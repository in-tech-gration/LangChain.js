// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-3/3.3_hitl.ipynb
import "dotenv/config.js";
import { tool, createAgent, HumanMessage, humanInTheLoopMiddleware } from "langchain";
import { Command, MemorySaver } from "@langchain/langgraph";
import * as z from "zod";

const readEmail = tool(
  async (_, config) => {
    return config.state.email;
  },
  {
    name: "read_email",
    description: "Read an email from the given address.",
    schema: z.object({})
  }
)

const sendEmail = tool(
  async ({ body }) => {
    console.log({ body });
    // fake email sending
    return "Email sent";
  },
  {
    name: "send_email",
    description: "Send an email to the given address with the given subject and body.",
    schema: z.object({
      body: z.string()
    })
  }
)

// console.log(await sendEmail.invoke({ body: "Hi there!" }));

const EmailState = z.object({
  email: z.string(),
});

const checkpointer = new MemorySaver();

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [readEmail, sendEmail],
  stateSchema: EmailState,
  checkpointer,
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        read_email: false,
        send_email: true,
      },
      descriptionPrefix: "Tool execution requires approval"
    })
  ]

})

const config = { configurable: { thread_id: "1" } }

const response = await agent.invoke({
  messages: [
    new HumanMessage("Please read my email and send a response.")
  ],
  email: "Hi Seán, I'm going to be late for our meeting tomorrow. Can we reschedule? Best, John.",
}, config);

// console.log(response);
console.log(response.__interrupt__);

// ACCESS JUST THE 'BODY' ARGUMENT FROM THE TOOL CALL
console.log(response.__interrupt__[0].value.actionRequests[0].args.body);

// Choose one of the 3 available responses (approve, reject, edit) and comment the other 2 in order to test:

// APPROVE ✅

const response2 = await agent.invoke(
  new Command({
    resume: {
      decisions: [{ type: "approve" }]
    }
  }),
  config
)

console.log(response2);


// REJECT ❌

const response3 = await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // listed in the `__interrupt__` request.
        resume: {
            decisions: [
                {
                    type: "reject",
                    // An explanation about why the action was rejected
                    message: "No please sign off - Your merciful leader, Seán.",
                }
            ]
        }
    }),
    config  // Same thread ID to resume the paused conversation
);

console.log(response3);
console.log(response3.__interrupt__[0].value.actionRequests[0].args.body);


// EDIT ✏️ 

const response4 = await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // listed in the `__interrupt__` request.
        resume: {
            decisions: [
                {
                    type: "edit",
                    // Edited action with tool name and args
                    editedAction: {
                        // Tool name to call.
                        // Will usually be the same as the original action.
                        name: "send_email",
                        // Arguments to pass to the tool.
                        args: { body: "This is the last straw, you're fired!"  },
                    }
                }
            ]
        }
    }),
    config  // Same thread ID to resume the paused conversation
);

console.log(response4);