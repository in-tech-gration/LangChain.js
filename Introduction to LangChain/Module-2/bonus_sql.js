// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/bonus_sql.ipynb
import "dotenv/config.js";
import { tool, createAgent, HumanMessage } from "langchain";
import { SqlDatabase } from "@langchain/classic/sql_db";
import { DataSource } from "typeorm";
import path from "node:path";
import * as z from "zod";
const __dirname = import.meta.dirname;

let db;
const dbPath = path.resolve(path.join(__dirname, "Chinook.db"));
const datasource = new DataSource({ type: "sqlite", database: dbPath });
db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
// console.log(await db.run("SELECT * FROM Track;"));

const sqlQuery = tool(
  async ({ query }) => {
    console.log({ query });
    const result = await db.run(query);
    return result;
  },
  {
    name: "sql_query",
    description: "Obtain information from the database using SQL queries",
    schema: z.object({
      query: z.string().describe("The SQLite query for querying the database."),
    })
  }
)

// console.log( await sqlQuery.invoke({ query: "SELECT * FROM Artist LIMIT 10" }) );

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [sqlQuery],
});


const question = new HumanMessage("Who is the most popular artist beginning with 'S' in this database?")

const response = await agent.invoke({
  "messages": [question]
});

console.log(response.messages[response.messages.length - 1].content);




