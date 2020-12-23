import mssql from 'mssql'
import { column } from '../model/column'
import { table } from '../model/table'
export function getTables(dbClient: mssql): Promise<table[]> {
  return new Promise((resolve, reject) => {
    dbClient.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'`)
    .then((data: any) => resolve(data.recordset))
    .catch((err: any) => reject(err))
  })
}

export function getTableColumns(dbClient: mssql, tableName: string, schema: string): Promise<column[]> {
  return new Promise((resolve, reject) => {
    dbClient.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      AND TABLE_SCHEMA = '${schema}'
    `)
    .then((data: any) => resolve(data.recordset))
    .catch((err: any) => reject(err))
  })
}