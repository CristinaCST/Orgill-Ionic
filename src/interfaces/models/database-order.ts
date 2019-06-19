export interface DatabaseOrder {
    PO: string;
    date: string;
    location: string;
    type: number;
    total: number;
    program_number: string;
    confirmation_number?: string;
}
