import { type JSONSchemaType } from "ajv";
import { type Invoice } from "../types/invoice.ts";

const nullableString = {
    anyOf: [{ type: "string" }, { type: "null", nullable: true }],
} as const;

const nullableNumber = {
    anyOf: [{ type: "number" }, { type: "null", nullable: true }],
} as const;

export const schema: JSONSchemaType<Invoice> = {
    type: "object",
    properties: {
        vendor: nullableString,
        invoiceNumber: nullableString,
        invoiceDate: nullableString,
        currency: nullableString,
        lineItems: {
            anyOf: [
                {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            description: nullableString,
                            quantity: nullableNumber,
                            unitPrice: nullableNumber,
                            amount: nullableNumber,
                        },
                        required: [
                            "description",
                            "quantity",
                            "unitPrice",
                            "amount",
                        ],
                        additionalProperties: false,
                    },
                },
                { type: "null", nullable: true },
            ],
        },
        subTotal: nullableNumber,
        tax: nullableNumber,
        total: nullableNumber,
    },
    required: [
        "vendor",
        "invoiceNumber",
        "invoiceDate",
        "currency",
        "lineItems",
        "subTotal",
        "tax",
        "total",
    ],
    additionalProperties: false,
};
