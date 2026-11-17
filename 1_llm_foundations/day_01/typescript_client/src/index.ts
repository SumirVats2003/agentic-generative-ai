import { conversation, updateTemp } from "./conversation.ts";
import * as readline from 'node:readline/promises';
import { exit, stdin as input, stdout as output } from 'node:process';

console.log("Welcome to AI Chat\n")
console.log("Chat with the LLM, or type /exit to exit")
console.log("/temp <number> will change the temperature of the model")
console.log("=======================================================")

const temperature_regex = /^\/temp\s+(\d+(?:\.\d+)?)$/;

while (true) {
    try {
        const rl = readline.createInterface({ input, output });
        const user_query = await rl.question('👤 ');

        if (user_query === "/exit") {
            break;
        }

        const match = user_query.match(temperature_regex);
        if (match) {
            const temperature = Number(match[1]);

            try {
                updateTemp(temperature);
                console.log(`Temperature updated to ${temperature}`);
            } catch (error) {
                console.log("Invalid temperature:", error);
            }

            continue;
        }

        const result = await conversation(user_query);
        console.log("🤖 " + result)
        console.log();
        rl.close();
    } catch (error) {
        console.log("Encountered error : ", error)
    }
}
