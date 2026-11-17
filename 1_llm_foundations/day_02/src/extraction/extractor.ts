import { Ajv } from "ajv";
import { Client, type Message } from "../llm/client.ts";
import type { Invoice } from "../types/invoice.ts";
import { SYSTEM_PROMPT } from "./system-prompt.ts";
import { schema } from "./schema.ts";

export class Extractor {
    private client = new Client("gemma:2b", 0.2);
    private messages: Message[] = [{ role: "system", content: SYSTEM_PROMPT }];
    private validator = (new Ajv()).compile(schema);

    public async extract(invoiceText: string): Promise<Invoice> {
        try {
            const invoiceJSON = await this.buildJSONInvoice(invoiceText);

            if (this.validator(invoiceJSON)) {
                return invoiceJSON as Invoice;
            } else {
                const errors = this.validator.errors?.reduce((err, i) => (i + err + "\n"), "");
                const retryMessage =
                    `There are the following errors in the parsed JSON : ${errors}. Correct these and regenerate the correct JSON output.`
                const correctedJson = this.buildJSONInvoice(retryMessage);

                if (this.validator(correctedJson)) {
                    return correctedJson as Invoice;
                } else {
                    throw new Error("Error while creating json")
                }
            }
        } catch (error) {
            throw error;
        }
    }

    private async buildJSONInvoice(invoiceText: string) {
        const message = this.buildExtractionMessage(invoiceText);
        this.messages.push(message);
        const result = await this.client.chat(this.messages);
        const invoiceJSON = JSON.parse(result);
        return invoiceJSON;
    }

    private buildExtractionMessage(invoiceText: string): Message {
        const extractionQuery = `${invoiceText}`;
        return {
            role: "user",
            content: extractionQuery
        }
    }
}
