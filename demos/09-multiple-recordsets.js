const { SCHEMA } = require('../lib/db')

// One batch can return several result sets; result.recordsets holds them all,
// and rowsAffected holds the counts of the statements that changed rows.
module.exports = async function multipleRecordsets(pool) {
    const result = await pool.query(`
        SELECT COUNT(*) AS Employees FROM ${SCHEMA}.Employees;
        SELECT TOP 2 Name, Salary FROM ${SCHEMA}.Employees ORDER BY Salary DESC, Name;
        UPDATE ${SCHEMA}.Employees SET Salary = Salary * 1.01 WHERE Department = 'Support';
        SELECT Department, MIN(HiredOn) AS FirstHire FROM ${SCHEMA}.Employees GROUP BY Department ORDER BY Department;
    `)
    console.log('recordsets:', result.recordsets.length, 'rowsAffected:', result.rowsAffected)
    result.recordsets.forEach((rs, i) => {
        console.log(`recordset ${i}: columns ${Object.keys(rs.columns).join(', ')}`)
        console.table(rs)
    })

    // arrayRowMode returns rows as arrays, with the column metadata alongside
    const req = pool.request()
    req.arrayRowMode = true
    const arr = await req.query(`SELECT TOP 2 Id, Name FROM ${SCHEMA}.Employees ORDER BY Id`)
    console.log(arr.columns[0].map(c => c.name), arr.recordset)
}
