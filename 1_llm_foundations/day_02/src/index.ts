import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Extractor } from "./extraction/extractor.ts";

console.log("INVOICE EXTRACTOR");
console.log();

const rl = readline.createInterface({ input, output });
const extractor = new Extractor();

while (true) {
    const user_query = await rl.question("👤 ");
    const result = await extractor.extract(user_query);
    console.log("🤖 ", result);
}

rl.close();
