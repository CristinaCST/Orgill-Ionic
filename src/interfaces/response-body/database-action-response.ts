export interface DatabaseActionResponse {
    insertId: number;
    rows: {
        item<T>(i: number): T;
    } & any[];
    rowsAffected: number;
}
