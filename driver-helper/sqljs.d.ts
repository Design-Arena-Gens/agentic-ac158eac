declare module "sql.js" {
  export interface QueryExecResult {
    columns: string[];
    values: Array<Array<string | number | null>>;
  }

  export interface Statement {
    bind(values: Array<string | number | null> | Record<string, unknown>): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  export class Database {
    constructor(data?: Uint8Array);
    prepare(sql: string): Statement;
    run(sql: string, params?: Array<string | number | null>): void;
    exec(sql: string): QueryExecResult[];
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;

  export { Database, QueryExecResult };
}
