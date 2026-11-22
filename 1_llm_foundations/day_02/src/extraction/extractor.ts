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
        let retryContext = "";
        let lastError: unknown;

        for (let attempt = 0; attempt <= this.RETRY_COUNT; attempt++) {
            const extractionQuery = `
                Extract the invoice below into the canonical invoice schema.

                ${retryContext}

                INVOICE INPUT:
                ${invoiceText}
            `;

            try {
                const invoiceJSON =
                    await this.buildJSONInvoice(extractionQuery);

                if (this.validator(invoiceJSON)) {
                    return invoiceJSON;
                }

                const errors = this.validator.errors
                    ?.map((error) => `${error.instancePath}: ${error.message}`)
                    .join("\n");

                lastError = new Error(errors ?? "Schema validation failed");

                retryContext = `
                    Your previous response failed schema validation.
                    Validation errors:
                    ${errors}

                    Generate a corrected JSON response.
                `;
            } catch (error) {
                lastError = error;

                retryContext = `
                    Your previous response could not be processed.
                    Error:
                    ${String(error)}

                    Generate a corrected JSON response.
                `;
            }
        }

        throw new Error("Invoice extraction failed after all attempts", {
            cause: lastError,
        });
    }

    private async buildJSONInvoice(extractionPrompt: string): Promise<Invoice> {
        const messages: Message[] = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: extractionPrompt },
        ];

        const result = await this.client.chat(messages);

        return JSON.parse(result) as Invoice;
    }
}
