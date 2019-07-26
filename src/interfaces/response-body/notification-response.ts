export interface NotificationResponse{
    id: string;
    data: {
        SKU: string;
    };
    headings: {
        en?: string;
        fr?: string;
    };
    contents: {
        en?: string;
        fr?: string;
    };
    completed_at: string;
}