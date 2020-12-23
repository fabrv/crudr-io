import mssql from 'mssql'
import { table } from '../model/table'
export function getTables(dbClient: mssql): Promise<table[]> {
  return new Promise((resolve, reject) => {
    dbClient.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'`)
    .then((data: { recordset: table[] }) => resolve(data.recordset))
    .catch((err: any) => reject(err))
  })
}