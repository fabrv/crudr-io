"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTables = void 0;
function getTables(dbClient) {
    return new Promise((resolve, reject) => {
        dbClient.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'`)
            .then((data) => resolve(data.recordset))
            .catch((err) => reject(err));
    });
}
exports.getTables = getTables;
