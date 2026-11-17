export type LineItem = {
    description?: string,
    quantity?: number,
    unitPrice?: number,
    amount?: number
}

export type Invoice = {
    vendor?: string,
    invoiceNumber?: string,
    invoiceDate?: string,
    currency?: string,
    lineItems: LineItem[],
    subTotal: number,
    tax: number,
    total: number
}
