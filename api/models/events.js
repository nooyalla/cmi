const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const Events = sequelize.define('events', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    location: {
      type: DataTypes.TEXT,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    startDate: {
      type: DataTypes.DATE,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      field: 'end_date',
    },
    lastConfirmationDate: {
      type: DataTypes.DATE,
      field: 'last_confirmation_date',
    },
    minParticipants: {
      type: DataTypes.NUMBER,
      field: 'min_participants',
      defaultValue: 0,
    },
    maxParticipants: {
      type: DataTypes.NUMBER,
      field: 'max_participants',
      defaultValue: 0,
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'events',
  });

  return Events;
};
