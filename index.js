const mssql= require('mssql/msnodesqlv8')
const {runQuery, executeProcedure} = require("./query");
const connectionString = "Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;Connect Timeout=10";


async function runner() {
    try {
        const dropProcSQL = `
            IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'AddNumbers')
                DROP PROCEDURE AddNumbers
        `;
        await runQuery(mssql, connectionString, dropProcSQL);
        
        const createProcSQL = `
            CREATE PROCEDURE AddNumbers
                @Number1 INT,
                @Number2 INT,
                @Result INT OUTPUT
            AS
            BEGIN
                SET @Result = @Number1 + @Number2
                SELECT @Result AS Sum
            END
        `;
        await runQuery(mssql, connectionString, createProcSQL);
        console.log('Stored procedure created successfully');
        
        const result = await executeProcedure(mssql, connectionString, 'AddNumbers', {
            Number1: 5,
            Number2: 7
        });
        
        console.log('Stored procedure result:', JSON.stringify(result, null, 4));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

runner().then(() => {
    console.log('done')
})


