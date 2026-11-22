export interface LineItem {
    description: string | null;
    quantity: number | null;
    unitPrice: number | null;
    amount: number | null;
}

export interface Invoice {
    vendor: string | null;
    invoiceNumber: string | null;
    invoiceDate: string | null;
    currency: string | null;
    lineItems: LineItem[] | null;
    subTotal: number | null;
    tax: number | null;
    total: number | null;
}
