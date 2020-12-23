"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTableColumns = exports.getTables = void 0;
function getTables(dbClient) {
    return new Promise((resolve, reject) => {
        dbClient.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'`)
            .then((data) => resolve(data.recordset))
            .catch((err) => reject(err));
    });
}
exports.getTables = getTables;
function getTableColumns(dbClient, tableName, schema) {
    return new Promise((resolve, reject) => {
        dbClient.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      AND TABLE_SCHEMA = '${schema}'
    `)
            .then((data) => resolve(data.recordset))
            .catch((err) => reject(err));
    });
}
exports.getTableColumns = getTableColumns;
//# sourceMappingURL=tables.js.map