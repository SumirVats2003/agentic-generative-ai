import { conversation, updateTemp } from "./conversation.ts";
import * as readline from 'node:readline/promises';
import { exit, stdin as input, stdout as output } from 'node:process';

console.log("Welcome to AI Chat\n")
console.log("Chat with the LLM, or type /exit to exit")
console.log("/temp <number> will change the temperature of the model")
console.log("=======================================================")

const temperature_regex = /^\/temp 0\.(?!0+$)\d+$/;

try {
    while (true) {
        const rl = readline.createInterface({ input, output });
        const user_query = await rl.question('👤 ');
        rl.close();

        if (user_query === "/exit") {
            break;
        }

        if (temperature_regex.test(user_query)) {
            const user_temp = parseFloat(user_query.split(" ")[1]);
            updateTemp(user_temp);
            continue;
        }

        const result = await conversation(user_query);
        console.log("🤖 " + result)
        console.log();
    }
} catch (error) {
    exit();
}
