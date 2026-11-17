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

        return response.data.message?.content ?? "Some error occured";
    }
}
