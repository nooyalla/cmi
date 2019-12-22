const Sequelize = require('sequelize');
const fs = require('fs');

const dbConnectionString = process.env.DATABASE_URL || "postgres://cxaitoocyrmvde:f102dc71cfb17f7c3fba1ff9bc8f6ad94345ade47cfbfdbbce5b098113d23263@ec2-54-195-252-243.eu-west-1.compute.amazonaws.com:5432/d426t09fcdnssk" ;
const sequelize = new Sequelize(dbConnectionString, { logging: false, ssl: true, pool: { acquire: 2000 } });

const models = fs.readdirSync(__dirname)
  .reduce((all, fileName) => {
    if (fileName === 'index.js') {
      return all;
    }
    const modelName = fileName.split('.')[0];
    console.log('modelName',modelName)
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
