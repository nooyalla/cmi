const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
    const EventUsers = sequelize.define('eventUsers', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: {
            type: DataTypes.STRING,
            field: 'user_id',
        },
        eventId: {
            type: DataTypes.STRING,
            field: 'event_id',
        },
        confirmationDate: {
            type: DataTypes.DATE,
            field: 'confirmation_date',
        },
        additionalItem: {
            type: DataTypes.TEXT,
            field: 'additional_item',
        },
        ...dateFields,
    }, {
        paranoid: true,
        tableName: 'event_users',
    });

    return EventUsers;
};
