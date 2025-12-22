export function displayAgentMessages(messages) {

  console.log("\n======");

  for (const message of messages) {
    const constructorName = message.constructor.name;
    console.log(`${constructorName}: "${message.content}"`);
    if (constructorName === "AIMessage") {
      if (message.tool_calls.length > 0) {
        console.log(`Tool call: ${message.tool_calls[0].name} => args: ${JSON.stringify(message.tool_calls[0].args)}`);
      }
    }
  }
}