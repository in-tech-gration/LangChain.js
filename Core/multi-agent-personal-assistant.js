// Based on: https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents-personal-assistant

// Multi-Agent Architecture: Supervisor Pattern: 

// A central supervisor agent coordinates specialized worker agents. This approach excels when tasks require different types of expertise. Rather than building one agent that manages tool selection across domains, you create focused specialists coordinated by a supervisor who understands the overall workflow.

// Your system has three layers. The bottom layer contains rigid API tools that require exact formats. The middle layer contains sub-agents that accept natural language, translate it to structured API calls, and return natural language confirmations. The top layer contains the supervisor that routes to high-level capabilities and synthesizes results.

import "dotenv/config.js";
import { ChatOpenAI } from "@langchain/openai";
import { tool, createAgent, HumanMessage, humanInTheLoopMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

const model = new ChatOpenAI({
  model: "gpt-4.1",
  // apiKey: "your-api-key"
});

// Test:
// const response = await model.invoke("What is the capital of Egypt?");
// console.log({ response });

// 1. DEFINE TOOLS
const createCalendarEvent = tool(
  async ({ title, startTime, endTime, attendees, location }) => {
    // Stub: In practice, this would call Google Calendar API, Outlook API, etc.
    return `Event created: ${title} from ${startTime} to ${endTime} with ${attendees.length} attendees`;
  },
  {
    name: "create_calendar_event",
    description: "Create a calendar event. Requires exact ISO datetime format.",
    schema: z.object({
      title: z.string(),
      startTime: z.string().describe("ISO format: '2024-01-15T14:00:00'"),
      endTime: z.string().describe("ISO format: '2024-01-15T15:00:00'"),
      attendees: z.array(z.string()).describe("email addresses"),
      location: z.string().optional(),
    }),
  }
);

// Test:
// const event = await createCalendarEvent.invoke({
//   title: "Learn Langchain",
//   startTime: "2025-12-28T00:00:00",
//   endTime: '2025-12-28T00:45:00',
//   attendees: ["ada@eff.org", "alan@proton.me"],
//   location: "Athens, Greece",
// });
// console.log({ event });


const sendEmail = tool(
  async ({ to, subject, body, cc }) => {
    // Stub: In practice, this would call SendGrid, Gmail API, etc.
    return `Email sent to ${to.join(', ')} - Subject: ${subject}`;
  },
  {
    name: "send_email",
    description: "Send an email via email API. Requires properly formatted addresses.",
    schema: z.object({
      to: z.array(z.string()).describe("email addresses"),
      subject: z.string(),
      body: z.string(),
      cc: z.array(z.string()).optional(),
    }),
  }
);

// Test:
// const email = await sendEmail.invoke({
//   to: ["ada@eff.org"],
//   subject: "Use encryption!",
//   body: "Install GPG and use encryption on the messages.",
//   cc: ["alan@proton.me"]
// });
// console.log({ email });


const getAvailableTimeSlots = tool(
  async ({ attendees, date, durationMinutes }) => {
    // Stub: In practice, this would query calendar APIs
    return ["09:00", "14:00", "16:00"];
  },
  {
    name: "get_available_time_slots",
    description: "Check calendar availability for given attendees on a specific date.",
    schema: z.object({
      attendees: z.array(z.string()),
      date: z.string().describe("ISO format: '2024-01-15'"),
      durationMinutes: z.number(),
    }),
  }
);

// const availability = await getAvailableTimeSlots.invoke({
//   attendees: [ "ada@eff.org", "alan@proton.me" ],
//   date: "2025-12-28T00:45:00",
//   durationMinutes: 5
// });
// console.log({ availability });

// 2. CREATE SPECIALIZED SUB-AGENTS

// CALENDAR SUB-AGENT

const CALENDAR_AGENT_PROMPT = `
You are a calendar scheduling assistant.
Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm')
into proper ISO datetime formats.
Use get_available_time_slots to check availability when needed.
Use create_calendar_event to schedule events.
Always confirm what was scheduled in your final response.
`.trim();

const calendarAgent = createAgent({
  model,
  tools: [createCalendarEvent, getAvailableTimeSlots],
  systemPrompt: CALENDAR_AGENT_PROMPT,
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: { create_calendar_event: true },
      descriptionPrefix: "Calendar event pending approval",
    }),
  ],
});

// Test: ❌
// const event1 = await calendarAgent.invoke({
//   messages: [
//     new HumanMessage(
//       "Create an event for next Friday at 20.15 and include ada@eff.org and alan@proton.me"
//     )
//   ]
// });
// console.log({ event1 });
// "Ada and Alan are not available next Friday (June 21) at 20:15. The available time slots for that day are 09:00, 14:00, and 16:00. Would you like to schedule the event at one of these times, or try a different date?"

// Test: ✅
// const event2 = await calendarAgent.invoke({
//   messages: [
//     new HumanMessage(
//       "Create an event for next Friday at 14:00 and include ada@eff.org and alan@proton.me"
//     )
//   ]
// });
// console.log({ event2 });
// "The event \"Meeting\" has been scheduled for next Friday, June 21st, from 14:00 to 15:00. Attendees include ada@eff.org and alan@proton.me."

// Test: ✅
const query = "Schedule a team meeting next Tuesday at 2pm for 1 hour";

// const stream = await calendarAgent.stream({
//   messages: [{ role: "user", content: query }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }
// "The team meeting has been scheduled for next Tuesday, June 18th, from 2:00 pm to 3:00 pm. If you would like to add specific attendees or a location, please let me know!"

// EMAIL SUB-AGENT
const EMAIL_AGENT_PROMPT = `
You are an email assistant.
Compose professional emails based on natural language requests.
Extract recipient information and craft appropriate subject lines and body text.
Use send_email to send the message.
Always confirm what was sent in your final response.
`.trim();

const emailAgent = createAgent({
  model,
  tools: [sendEmail],
  systemPrompt: EMAIL_AGENT_PROMPT,
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: { send_email: true },
      descriptionPrefix: "Outbound email pending approval",
    }),
  ],
});

// Test:
const emailQuery = "Send the design team a reminder about reviewing the new mockups";

// const stream = await emailAgent.stream({
//   messages: [{ role: "user", content: emailQuery }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }

// 3. WRAP SUB-AGENTS AS TOOLS

// The tool descriptions help the supervisor decide when to use each tool, so make them clear and specific.

const scheduleEvent = tool(
  async ({ request }) => {
    const result = await calendarAgent.invoke({
      messages: [{ role: "user", content: request }]
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text;
  },
  {
    name: "schedule_event",
    description: `
Schedule calendar events using natural language.

Use this when the user wants to create, modify, or check calendar appointments.
Handles date/time parsing, availability checking, and event creation.

Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
    `.trim(),
    schema: z.object({
      request: z.string().describe("Natural language scheduling request"),
    }),
  }
);

const manageEmail = tool(
  async ({ request }) => {
    const result = await emailAgent.invoke({
      messages: [{ role: "user", content: request }]
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text;
  },
  {
    name: "manage_email",
    description: `
Send emails using natural language.

Use this when the user wants to send notifications, reminders, or any email communication.
Handles recipient extraction, subject generation, and email composition.

Input: Natural language email request (e.g., 'send them a reminder about the meeting')
    `.trim(),
    schema: z.object({
      request: z.string().describe("Natural language email request"),
    }),
  }
);

// 4. CREATE THE SUPERVISOR AGENT

const SUPERVISOR_PROMPT = `
You are a helpful personal assistant.
You can schedule calendar events and send emails.
Break down user requests into appropriate tool calls and coordinate the results.
When a request involves multiple actions, use multiple tools in sequence.
`.trim();

const supervisorAgent = createAgent({
  model,
  tools: [scheduleEvent, manageEmail],
  systemPrompt: SUPERVISOR_PROMPT,
  checkpointer: new MemorySaver(),
});

// 5. USE THE SUPERVISOR

// Example 1: Simple single-domain request
const example1 = "Schedule a team standup for tomorrow at 9am";

// const stream = await supervisorAgent.stream({
//   messages: [{ role: "user", content: example1 }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }

// Example 2: Complex multi-domain request
const example2 =
  "Schedule a meeting with the design team next Tuesday at 2pm for 1 hour, " +
  "and send them an email reminder about reviewing the new mockups.";

// const stream = await supervisorAgent.stream({
//   messages: [{ role: "user", content: example2 }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }

// 6. ADD HUMAN-IN-THE-LOOP REVIEW

const humanInTheLoop =
  "Schedule a meeting with the design team next Tuesday at 2pm for 1 hour, " +
  "and send them an email reminder about reviewing the new mockups.";

const config = { configurable: { thread_id: "6" } };

const interrupts = [];
// const stream = await supervisorAgent.stream(
//   { messages: [{ role: "user", content: humanInTheLoop }] },
//   config
// );

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     } else if (Array.isArray(update)) {
//       const interrupt = update[0];
//       interrupts.push(interrupt);
//       console.log(`\nINTERRUPTED: ${interrupt.id}`);
//     }
//   }
// }

// for (const interrupt of interrupts) {
//   for (const request of interrupt.value.actionRequests) {
//     console.log(`INTERRUPTED: ${interrupt.id}`);
//     console.log(`${request.description}\n`);
//   }
// }