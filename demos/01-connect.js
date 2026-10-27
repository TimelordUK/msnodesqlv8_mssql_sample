// A ConnectionPool is created once and shared for the life of the app;
// every pool.request() borrows a connection and hands it back when done.
module.exports = async function connect(pool) {
    const result = await pool.query(`
        SELECT DB_NAME() AS db, SUSER_SNAME() AS login, SERVERPROPERTY('ProductVersion') AS version`)
    console.log(result.recordset[0])
}
