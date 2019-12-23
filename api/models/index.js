const Sequelize = require('sequelize');
const fs = require('fs');

const { DATABASE_URL } = require('./../../config.js');

const dbConnectionString = DATABASE_URL;
const sequelize = new Sequelize(dbConnectionString, { logging: false, ssl: true, pool: { acquire: 2000 } });
const models = fs.readdirSync(__dirname)
  .reduce((all, fileName) => {
    if (fileName === 'index.js' || fileName==='.DS_Store') {
      return all;
    }
    const modelName = fileName.split('.')[0];
    const path = `${__dirname}/${fileName}`;

    return {
      ...all,
      [modelName]: sequelize.import(path),
    };

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
