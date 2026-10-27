// The same driver from an ES module: the smallest connect / query / close.
import mssql from 'mssql/msnodesqlv8.js'
import db from './lib/db.js'

const pool = await new mssql.ConnectionPool(db.config).connect()
try {
    const result = await pool.request()
        .input('top', mssql.Int, 3)
        .query('SELECT TOP (@top) name, type_desc FROM sys.objects ORDER BY object_id')
    console.table(result.recordset)
} finally {
    await pool.close()
}
