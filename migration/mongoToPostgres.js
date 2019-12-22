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

async function doStuff() {
    console.log('################');
    console.log('migration start');
    console.log('################');
    await createTables();
    console.log('########');
    console.log('DONE');
    process.exit(0);
}
doStuff();
