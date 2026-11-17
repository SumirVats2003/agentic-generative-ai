1. If the LLM API is unavailable, which parts of your application should continue working? How would you design that separation?
Ans. If the LLM API is unavailable, the user should still be able to set model temperature and select model
- Existing conversations should remain accessible.
- Stored messages should remain available.
- Model configuration should remain editable.
- Local business data and deterministic operations should continue working.
- The application should report model unavailability gracefully.

2. Why should conversation history be managed by your application instead of assuming the model remembers previous requests?
Ans. Since context is application based, it only makes sense that conversation history is managed by the application and not the model. This also gives control over context, and surety that all of required context is available to the LLM. Follows the principal of ALL AND ONLY.
the model processes the context supplied with each request. It does not inherently retain your previous API calls as persistent conversation memory.

3. TEMPERATURE VARIATION STUDY
Since this model was a small one, I did not see a lot of difference with different temperature values. However, with higher temperature values, the model's outputs started to become more casual, although not so much because of the model being small.
I asked the same question `WHO ARE YOU` at three different temperature values : 0.1, 0.5 and 0.9. The outputs at 0.1 and 0.5 were more or less the same. However, the output at temperature 0.9 was longer and had more casual wording.

4. Suppose Ollama is unavailable for 30 seconds, and the user sends three messages during that time.
Would you:
a. Store all three messages and retry them when Ollama comes back?
b. Reject the messages and ask the user to retry?
c. Store them as pending messages, but let the user decide whether to retry?
Ans. In a proper production environment, I would consider option a, considering user experience. However, for this toy program, I would simply reject and ask the user to retry.

5. Implementation:
Below are main.ts, conversation.ts and client.ts respectively. I have hardcoded the model since it is the only model that could run on my Hardware.

```typescript
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
```

```typescript
import { Client, type Message } from "./client.ts";

const client = new Client("gemma:2b", 0.2);

const messages: Message[] = [];

messages.push({
    role: "system",
    content: "You are a helpful AI assitant. Help the user by answering his query"
})

export async function conversation(user_query: string) {
    messages.push({
        role: "user",
        content: user_query
    });

    try {
        const result = await client.chat(messages);
        messages.push({
            role: "assistant",
            content: result
        });
        return result;
    } catch (error) {
        messages.pop()
        throw error;
    }
}

export function updateTemp(temp: number) {
    client.setTemperature(temp);
}
```

```typescript
import axios from "axios";

export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
};

export class Client {
    private API_URL = "http://localhost:11434/api/chat";
    private model: string;
    private temperature: number;

    constructor(
        model: string,
        temperature: number
    ) {
        this.model = model;
        this.temperature = temperature
    }

    public setTemperature(temp: number) {
        if (!Number.isFinite(temp) || temp < 0 || temp > 2) {
            throw new Error("Temperature must be between 0 and 2");
        }

        this.temperature = temp;
    }

    public async chat(messages: Message[]): Promise<string> {
        const response = await axios.post(
            this.API_URL,
            {
                model: this.model,
                messages,
                stream: false,
                options: {
                    temperature: this.temperature
                },
            }
        );

        const content = response.data?.message?.content;

        if (typeof content !== "string") {
            throw new Error("Invalid response received from Ollama");
        }

        if (response.status >= 400) {
            throw new Error("SOMETHING WENT WRONG : " + response.statusText);
        }

        return response.data.message?.content ?? "Some error occured";
    }
}
```
