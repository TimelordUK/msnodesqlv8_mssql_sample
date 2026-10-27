const { mssql, SCHEMA } = require('../lib/db')

// SQL Server errors arrive as RequestError carrying the server's error number, state and line.
module.exports = async function errors(pool) {
    try {
        await pool.request()
            .input('name', mssql.NVarChar(100), 'Ada Lovelace')
            .query(`INSERT INTO ${SCHEMA}.Employees (Name, Department, Salary, HiredOn)
                    VALUES (@name, 'Engineering', 1, '2024-01-01')`)
    } catch (err) {
        if (!(err instanceof mssql.RequestError)) throw err
        // 2627 = unique constraint violation, 2601 = duplicate key in a unique index
        console.log({ name: err.name, code: err.code, number: err.number, state: err.state, message: err.message })
    }

    // THROW / RAISERROR from your own SQL
    try {
        await pool.query(`THROW 50001, 'Custom business rule violated', 1`)
    } catch (err) {
        console.log({ number: err.number, message: err.message })
    }

    // cancelling a long running request (requestTimeout in the config does this automatically)
    const req = pool.request()
    const slow = req.query(`WAITFOR DELAY '00:00:10'`)
    setTimeout(() => req.cancel(), 200)
    try {
        await slow
    } catch (err) {
        console.log({ code: err.code, message: err.message })
    }
}
