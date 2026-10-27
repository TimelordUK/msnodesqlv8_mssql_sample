const { mssql, SCHEMA } = require('../lib/db')

// request.bulk() sends rows through the driver's bulk path - far faster than row-by-row INSERTs.
module.exports = async function bulkInsert(pool) {
    const departments = ['Engineering', 'Sales', 'Finance', 'Support']
    const count = 10000

    // columns must match the target table's column names and types
    const table = new mssql.Table(`${SCHEMA}.Employees`)
    table.columns.add('Name', mssql.NVarChar(100), { nullable: false })
    table.columns.add('Department', mssql.NVarChar(50), { nullable: false })
    table.columns.add('Salary', mssql.Decimal(10, 2), { nullable: false })
    table.columns.add('HiredOn', mssql.Date, { nullable: false })
    // table.create = true would create the table from these columns if it did not exist

    for (let i = 1; i <= count; i++) {
        table.rows.add(`Employee ${i}`, departments[i % departments.length],
            40000 + (i % 50) * 1000, new Date(2015, i % 12, (i % 28) + 1))
    }

    const start = Date.now()
    const result = await pool.request().bulk(table)
    console.log(`bulk inserted ${result.rowsAffected} rows in ${Date.now() - start} ms`)

    const summary = await pool.query(`
        SELECT Department, COUNT(*) AS Headcount, AVG(Salary) AS AvgSalary
        FROM ${SCHEMA}.Employees GROUP BY Department ORDER BY Department`)
    console.table(summary.recordset)
}
