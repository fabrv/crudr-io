import mssql from 'mssql'

export class TestService {
  private dbClient: mssql
  constructor(dbClient: mssql) {
    dbClient = dbClient
  }
  
  createTest(model: test): Promise<test> {
    return new Promise((resolve, reject) => {
      this.dbClient.query(
        `INSERT INTO 
        OUTPUT INSERTED.CODE_SKU
        SONDA.SWIFT_SKU(CODE_SKU)
        VALUES (${model.CODE_SKU})`
      )
      .then((data: any) => {
        resolve(data.recordset)
      })
      .catch(err => reject(err))
    })
  }

  readTest(limit: number = 1000, offset: number = 0): Promise<test> {
    return new Promise((resolve, reject) => {
      this.dbClient.query(
        `SELECT * FROM SONDA.SWIFT_COMBO
        ORDER BY COMBO_ID
        OFFSET ${offset} ROWS
        FETCH FIRST ${limit} ROWS ONLY`
      )
      .then((data: any) => {
        resolve(data.recordset)
      })
      .catch(err => reject(err))
    })
  }

  updateTest(model: test, firstFieldValue: type) {
    return new Promise((resolve, reject) => {
      this.dbClient.query(
        `UPDATE SONDA.SWIFT_USER_BY_TEAM
        SET TEAM_ID = 1234
        AND USER_ID = 1234
        WHERE USER_ID = ${firstFieldValue}`
      )
      .then((data: any) => {
        resolve(model)
      })
      .catch((err: any) => reject(err))
    })
  }

  deleteTest(firstFieldValue: type) {
    return new Promise((resolve, reject) => {
      this.dbClient.query(
        `DELETE FROM SONDA.SWIFT_USER_BY_TEAM
        WHERE USER_ID = ${firstFieldValue}`
      )
      .then((data: any) => {
        resolve(model)
      })
      .catch((err: any) => reject(err))
    })
  }
}