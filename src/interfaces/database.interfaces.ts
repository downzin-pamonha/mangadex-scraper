export interface DatabaseRecord {
    [key: string]: any;
}

export interface QueryResult {
    affectedRows?: number;
    insertId?: number;
}
