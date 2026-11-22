import { Ajv } from "ajv";
import { Client, type Message } from "../llm/client.ts";
import type { Invoice } from "../types/invoice.ts";
import { SYSTEM_PROMPT } from "./system-prompt.ts";
import { schema } from "./schema.ts";

export class Extractor {
    private client = new Client("gemma:2b", 0.2);
    private validator = new Ajv().compile(schema);
    private RETRY_COUNT = 2;

    public async extract(invoiceText: string): Promise<Invoice> {
        let extractionPromptPrefix =
            "Given below is an Invoice in raw text. Extract it into canonical invoice schema.";
        let retryCounter = this.RETRY_COUNT;
        let isRetry = false;

        while (!isRetry || retryCounter != 0) {
            const extractionQuery = `
                    ${extractionPromptPrefix}
                    ${invoiceText}
                `;
            try {
                const invoiceJSON =
                    await this.buildJSONInvoice(extractionQuery);

                if (this.validator(invoiceJSON)) {
                    return invoiceJSON;
                } else {
                    const errors = this.validator.errors
                        ?.map(
                            (error) =>
                                `${error.instancePath}: ${error.message}`,
                        )
                        .join("\n");
                    extractionPromptPrefix = `
                        The previous trial on generating JSON invoice ran into an error :\n${errors}.
                        Correct the errors and regenerate the correct JSON output for the given invoice text.
                    `;
                    if (isRetry) retryCounter--;
                    isRetry = true;
                }
            } catch (error) {
                extractionPromptPrefix = `
                    The previous trial on generating JSON invoice ran into an error :\n${error}.
                    Correct the errors and regenerate the correct JSON output for the given invoice text.
                `;
                if (isRetry) retryCounter--;
                isRetry = true;
            }
        }
        throw new Error("Couldn't succeed parsing Invoice as JSON");
    }

    private async buildJSONInvoice(extractionPrompt: string): Promise<Invoice> {
        const messages: Message[] = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: extractionPrompt },
        ];
        const result = await this.client.chat(messages);
        console.log(result);
        const invoiceJSON = JSON.parse(result) as Invoice;
        return invoiceJSON;
    }
}
