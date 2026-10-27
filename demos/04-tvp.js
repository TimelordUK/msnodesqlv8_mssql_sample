const { mssql, SCHEMA } = require('../lib/db')

// A table-valued parameter passes a whole set of rows to a procedure in one call.
// The mssql Table's name must match the user-defined table type, including its schema.
module.exports = async function tvp(pool) {
    await pool.query(`
        CREATE TYPE ${SCHEMA}.SalaryChange AS TABLE (
            Name      NVARCHAR(100) NOT NULL,
            NewSalary DECIMAL(10,2) NOT NULL
        )`)
    await pool.query(`
        CREATE PROCEDURE ${SCHEMA}.ApplySalaryChanges @changes ${SCHEMA}.SalaryChange READONLY
        AS
        BEGIN
            SET NOCOUNT ON
            UPDATE e SET Salary = c.NewSalary
            OUTPUT INSERTED.Name, DELETED.Salary AS OldSalary, INSERTED.Salary AS NewSalary
            FROM ${SCHEMA}.Employees e JOIN @changes c ON c.Name = e.Name
        END`)

    const changes = new mssql.Table(`${SCHEMA}.SalaryChange`)
    changes.columns.add('Name', mssql.NVarChar(100))
    changes.columns.add('NewSalary', mssql.Decimal(10, 2))
    changes.rows.add('Ada Lovelace', 120000)
    changes.rows.add('Employee 1', 55000)
    changes.rows.add('Employee 2', 56000)

    const result = await pool.request()
        .input('changes', mssql.TVP, changes)
        .execute(`${SCHEMA}.ApplySalaryChanges`)
    console.table(result.recordset)
}
