// Based on: https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents-personal-assistant

// Multi-Agent Architecture: Supervisor Pattern: 
// A central supervisor agent coordinates specialized worker agents. This approach excels when tasks require different types of expertise. Rather than building one agent that manages tool selection across domains, you create focused specialists coordinated by a supervisor who understands the overall workflow.

import "dotenv/config.js";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "langchain";
import { z } from "zod";

const model = new ChatOpenAI({
  model: "gpt-4.1",
  // apiKey: "your-api-key"
});

// Test:
// const response = await model.invoke("What is the capital of Egypt?");
// console.log({ response });

// 1. Define tools
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
