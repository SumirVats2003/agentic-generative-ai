import { type JSONSchemaType } from "ajv";
import { type Invoice } from "../types/invoice.ts";

export const schema: JSONSchemaType<Invoice> = {
    type: "object",
    properties: {
        vendor: { type: "string", nullable: true },
        invoiceNumber: { type: "string", nullable: true },
        invoiceDate: { type: "string", nullable: true },
        currency: { type: "string", nullable: true },
        lineItems: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    description: { type: "string", nullable: true },
                    quantity: { type: "number", nullable: true },
                    unitPrice: { type: "number", nullable: true },
                    amount: { type: "number", nullable: true },
                },
                required: [],
                additionalProperties: false
            }
        },
        subTotal: { type: "number" },
        tax: { type: "number" },
        total: { type: "number" },
    },
    required: ["lineItems", "subTotal", "tax", "total"],
    additionalProperties: false
}
