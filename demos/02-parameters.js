const { mssql, SCHEMA } = require('../lib/db')

// Never concatenate values into SQL - pass them as typed parameters.
module.exports = async function parameters(pool) {
    await pool.query(`
        CREATE TABLE ${SCHEMA}.Employees (
            Id         INT IDENTITY PRIMARY KEY,
            Name       NVARCHAR(100) NOT NULL UNIQUE,
            Department NVARCHAR(50)  NOT NULL,
            Salary     DECIMAL(10,2) NOT NULL,
            HiredOn    DATE          NOT NULL
        )`)

    // explicit types with request.input
    const insert = await pool.request()
        .input('name', mssql.NVarChar(100), 'Ada Lovelace')
        .input('dept', mssql.NVarChar(50), 'Engineering')
        .input('salary', mssql.Decimal(10, 2), 95000.50)
        .input('hired', mssql.Date, new Date('2020-03-01'))
        .query(`
            INSERT INTO ${SCHEMA}.Employees (Name, Department, Salary, HiredOn)
            OUTPUT INSERTED.Id
            VALUES (@name, @dept, @salary, @hired)`)
    console.log('inserted id', insert.recordset[0].Id)

    // tagged template: each ${value} becomes a parameter with an inferred type, not string concatenation
    const dept = 'Engineering'
    const select = await pool.request().query`
        SELECT Name, Salary, HiredOn FROM mssql_demo.Employees WHERE Department = ${dept}`
    console.log(select.recordset)
}
