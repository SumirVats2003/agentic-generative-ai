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
