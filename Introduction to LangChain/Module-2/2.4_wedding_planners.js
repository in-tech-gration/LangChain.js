// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/2.4_wedding_planners.ipynb
import "dotenv/config.js";
import { tool, createAgent, ToolMessage, HumanMessage } from "langchain";
import { Command } from "@langchain/langgraph";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as z from "zod";
import { TavilySearch } from "@langchain/tavily";
import fs from "node:fs/promises";
import path from "node:path";
import { SqlDatabase } from "@langchain/classic/sql_db";
import { DataSource } from "typeorm";
const __dirname = import.meta.dirname;
// npm install sqlite3 typeorm
import { displayAgentMessages } from "../utils.js";

// process.env.LANGCHAIN_VERBOSE = "true";

// SETUP TOOLS

const client = new MultiServerMCPClient({
  travelServer: {
    transport: "http",
    url: "https://mcp.kiwi.com",
  },
});

const tools = await client.getTools();

let db;

async function getDb() {
  if (!db) {
    const dbPath = path.resolve(path.join(__dirname, "Chinook.db"));
    if (await fs.stat(dbPath)) {
      const datasource = new DataSource({ type: "sqlite", database: dbPath });
      db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
    }
  }
  return db;
}

async function getSchema() {
  const db = await getDb();
  return await db.getTableInfo();
}

// https://docs.langchain.com/oss/javascript/langchain/sql-agent#4-execute-sql-queries
const DENY_RE = /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

function sanitizeSqlQuery(q) {
  let query = String(q ?? "").trim();

  // block multiple statements (allow one optional trailing ;)
  const semis = [...query].filter((c) => c === ";").length;
  if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
    throw new Error("multiple statements are not allowed.")
  }
  query = query.replace(/;+\s*$/g, "").trim();

  // read-only gate
  if (!query.toLowerCase().startsWith("select")) {
    throw new Error("Only SELECT statements are allowed")
  }
  if (DENY_RE.test(query)) {
    throw new Error("DML/DDL detected. Only read-only queries are permitted.")
  }

  // append LIMIT only if not already present
  if (!HAS_LIMIT_TAIL_RE.test(query)) {
    query += " LIMIT 5";
  }
  return query;
}

const executeSql = tool(
  async ({ query }) => {
    const q = sanitizeSqlQuery(query);
    try {
      const result = await db.run(q);
      return typeof result === "string" ? result : JSON.stringify(result, null, 2);
    } catch (e) {
      throw new Error(e?.message ?? String(e))
    }
  },
  {
    name: "execute_sql",
    description: "Execute a READ-ONLY SQLite SELECT query and return results.",
    schema: z.object({
      query: z.string().describe("SQLite SELECT query to execute (read-only)."),
    }),
  }
);

// console.log( await getSchema() );

const queryPlaylistDB = tool(
  async ({ query }) => {
    const q = sanitizeSqlQuery(query);
    try {
      const db = await getDb();
      const result = await db.run(q);
      return typeof result === "string" ? result : JSON.stringify(result, null, 2);
    } catch (e) {
      throw new Error(e?.message ?? String(e))
    }
  },
  {
    name: "query_playlist_db",
    description: "Query the database for playlist information",
    schema: z.object({
      query: z.string().describe("The query to search the database for playlist information"),
    }),
  }
);

// CREATE STATE

const WeddingState = z.object({
  origin: z.string(),
  destination: z.string(),
  guestCount: z.string(),
  genre: z.string(),
});

// CREATE SUBAGENTS

// TRAVEL AGENT

const travelAgentSystemPrompt = `
  You are a travel agent. Search for flights to the desired destination wedding location.
  You are not allowed to ask any more follow up questions, you must find the best flight options based on the following criteria:
  - Price (lowest, economy class)
  - Duration (shortest)
  - Date (time of year which you believe is best for a wedding at this location)
  To make things easy, only look for one ticket, one way.
  You may need to make multiple searches to iteratively find the best options.
  You will be given no extra information, only the origin and destination. It is your job to think critically about the best options.
  Once you have found the best options, let the user know your shortlist of options.
`

const travelAgent = createAgent({
  model: "gpt-5-nano",
  tools,
  systemPrompt: travelAgentSystemPrompt,
  name: "TravelAgent",
});


// VENUE AGENT

const venueAgentSystemPrompt = `
  You are a venue specialist. Search for venues in the desired location, and with the desired capacity.
  You are not allowed to ask any more follow up questions, you must find the best venue options based on the following criteria:
  - Price (lowest)
  - Capacity (exact match)
  - Reviews (highest)
  You may need to make multiple searches to iteratively find the best options.
`

const venueAgent = createAgent({
  model: "gpt-5-nano",
  tools: [new TavilySearch({ maxResults: 1 })],
  systemPrompt: venueAgentSystemPrompt,
  name: "VenueAgent",
});

// PLAYLIST AGENT

const playlistAgentSystemPrompt = `
  You are a playlist specialist. Query the sql database and curate the perfect playlist for a wedding given a genre.
  Once you have your playlist, calculate the total duration and cost of the playlist, each song has an associated price.
  If you run into errors when querying the database, try to fix them by making changes to the query.
  Do not come back empty handed, keep trying to query the db until you find a list of songs.
  You may need to make multiple queries to iteratively find the best options.
`;

const playlistAgent = createAgent({
  model: "gpt-5-nano",
  tools: [queryPlaylistDB],
  systemPrompt: playlistAgentSystemPrompt,
  name: "PlaylistAgent",
});

// MAIN COORDINATOR

const searchFlights = tool(
  async (_, config) => {

    console.log("searchFlights()");

    const origin = config.state.origin;
    const destination = config.state.destination;
    const message = `Find flights from ${origin} to ${destination}`
    const response = await travelAgent.invoke({
      messages: [new HumanMessage(message)],
    });
    const lastResponse = response.messages[response.messages.length - 1].content;
    // console.log({ lastResponse });
    return lastResponse;
  },
  {
    name: "search_flights",
    description: "Travel agent searches for flights to the desired destination wedding location.",
    schema: z.object({}),
  }
)

const searchVenues = tool(
  async (_, config) => {

    console.log("searchVenues()");

    const destination = config.state.destination;
    const capacity = config.state.questCount;
    const query = `Find wedding venues in ${destination} for ${capacity} guests`;
    const response = await venueAgent.invoke({
      messages: [new HumanMessage(query)],
    });
    const lastResponse = response.messages[response.messages.length - 1].content;
    // console.log({ lastResponse });
    return lastResponse;
  },
  {
    name: "search_venues",
    description: "Venue agent chooses the best venue for the given location and capacity.",
    schema: z.object({}),
  }
);

const suggestPlaylist = tool(
  async (_, config) => {

    console.log("suggestPlaylist()");

    const genre = config.state.genre;
    const query = `Find ${genre} tracks for wedding playlist`;
    const response = await playlistAgent.invoke({
      messages: [new HumanMessage(query)],
    });
    const lastResponse = response.messages[response.messages.length - 1].content;
    // console.log({ lastResponse });
    return lastResponse;
  },
  {
    name: "suggest_playlist",
    description: "Playlist agent curates the perfect playlist for the given genre.",
    schema: z.object({}),
  }
);

const updateState = tool(
  async ({ origin, destination, guestCount, genre }, config) => {

    console.log("updateState()", {
      origin, destination, guestCount, genre
    });

    const command = new Command({
      update: {
        origin,
        destination,
        guestCount,
        genre,
        messages: [new ToolMessage({
          content: "Successfully updated state",
          tool_call_id: config.toolCall?.id ?? "",
        })]
      }
    });

    return command;

  },
  {
    name: "update_state",
    description: "Update the state when you know all of the values: origin, destination, guestCount, genre",
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
      guestCount: z.number(),
      genre: z.string(),
    }),
  }
);

const coordinatorSystemPrompt = `
  You are a wedding coordinator. Delegate tasks to your specialists for flights, venues and playlists.
  First find all the information you need to update the state. Once that is done you can delegate the tasks.
  Once you have received their answers, coordinate the perfect wedding for me.
`

const coordinator = createAgent({
  model: "gpt-5-nano",
  tools: [searchFlights, searchVenues, suggestPlaylist, updateState],
  systemPrompt: coordinatorSystemPrompt.trim(),
  stateSchema: WeddingState,
  name: "CoordinatorAgent",
});

// TEST
async function init() {

  const response = await coordinator.invoke({
    messages: [
      new HumanMessage(
        "I'm from London and I'd like a wedding in Paris for 100 guests, jazz-genre"
      )
    ],
  })

  console.log(response);
  displayAgentMessages(response.messages);
  // console.log(response.messages[response.messages.length - 1].content);

}

init();

// link to trace: https://smith.langchain.com/public/7b5fe668-d3e3-4af4-b513-a8cacc0c9e84/r

