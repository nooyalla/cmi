const Sequelize = require('sequelize');
const fs = require('fs');

const dbConnectionString = process.env.DATABASE_URL ;
const sequelize = new Sequelize(dbConnectionString, { logging: false, ssl: true, pool: { acquire: 2000 } });

const models = fs.readdirSync(__dirname)
  .reduce((all, fileName) => {
    if (fileName === 'index.js') {
      return all;
    }
    const modelName = fileName.split('.')[0];
      return {
        ...all,
        [modelName]: sequelize.import(`${__dirname}/${fileName}`),
      }
      }, {});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
