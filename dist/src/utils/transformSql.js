"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformType = void 0;
function transformType(sqlType) {
    switch (sqlType) {
        case 'int': return 'number';
        case 'varchar': return 'string';
        case 'float': return 'string';
        case 'datetime': return 'Date';
        case 'numeric': return 'number';
        default: return 'string';
    }
}
exports.transformType = transformType;
//# sourceMappingURL=transformSql.js.map