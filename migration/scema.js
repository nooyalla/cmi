const models = require('../api/models');
const dbSchemas = require('./db_schemas');

async function createTables(){
    console.log('createTables start');
    for (const tableData of dbSchemas.tables){
        try {
            console.log('adding table:',tableData.tableName);
            await models.sequelize.query(`CREATE TABLE ${tableData.tableName} (${tableData.columns.join(',')});`);
            console.log('table added. ',tableData.tableName);
            console.log('');
        } catch (e) {
            console.error(e.message)
        }
    }
    console.log('createTables end');
}

async function deleteTables(){
    console.log('deleteTables start');
    for (const tableData of dbSchemas.tables){
        try {
            console.log('deleting table:',tableData.tableName);
            await models.sequelize.query(`DROP TABLE ${tableData.tableName};`);
            console.log('table deleted. ',tableData.tableName);
            console.log('');
        } catch (e) {
            console.error(e.message)
        }
    }
    console.log('deleteTables end');
}

async function doStuff() {
    console.log('################');
    console.log('migration start');
    console.log('################');
    await deleteTables();
    await createTables();
    console.log('########');
    console.log('DONE');
    process.exit(0);
}
doStuff();
