const { mssql, SCHEMA } = require('../lib/db')

// Prepare once, execute many times with different values. A prepared statement holds
// a pooled connection until unprepare(), so always unprepare in finally.
module.exports = async function preparedStatement(pool) {
    const ps = new mssql.PreparedStatement(pool)
    ps.input('dept', mssql.NVarChar(50))
    ps.input('minSalary', mssql.Decimal(10, 2))
    await ps.prepare(`
        SELECT COUNT(*) AS n FROM ${SCHEMA}.Employees
        WHERE Department = @dept AND Salary >= @minSalary`)
    try {
        for (const dept of ['Engineering', 'Sales', 'Finance', 'Support']) {
            const r = await ps.execute({ dept, minSalary: 80000 })
            console.log(`${dept.padEnd(12)} earning >= 80000: ${r.recordset[0].n}`)
        }
    } finally {
        await ps.unprepare()
    }
}
