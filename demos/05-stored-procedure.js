const { mssql, SCHEMA } = require('../lib/db')

// Inputs, outputs, a return value and a recordset from one procedure call.
module.exports = async function storedProcedure(pool) {
    await pool.query(`
        CREATE PROCEDURE ${SCHEMA}.DepartmentStats
            @department NVARCHAR(50),
            @headcount  INT OUTPUT,
            @maxSalary  DECIMAL(10,2) OUTPUT
        AS
        BEGIN
            SET NOCOUNT ON
            SELECT @headcount = COUNT(*), @maxSalary = MAX(Salary)
            FROM ${SCHEMA}.Employees WHERE Department = @department

            SELECT TOP 3 Name, Salary FROM ${SCHEMA}.Employees
            WHERE Department = @department ORDER BY Salary DESC, Name

            RETURN CASE WHEN @headcount > 0 THEN 0 ELSE 1 END
        END`)

    const result = await pool.request()
        .input('department', mssql.NVarChar(50), 'Engineering')
        .output('headcount', mssql.Int)
        .output('maxSalary', mssql.Decimal(10, 2))
        .execute(`${SCHEMA}.DepartmentStats`)

    console.log('output:', result.output, 'returnValue:', result.returnValue)
    console.table(result.recordset)
}
