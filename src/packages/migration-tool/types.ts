export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  primaryKey: boolean;
  position: number;
}

export interface DatabaseSchema {
  [tableName: string]: ColumnInfo[];
}
