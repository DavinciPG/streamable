const { DataTypes } = require('sequelize');
const db = require('../config/config');

const Logins = db.define('Logins', {
    date: {
        type: DataTypes.DATE,
        defaultValue: db.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    IP: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Logins.belongsTo(db.models.user, { foreignKey: 'userId' });

Logins.sync();

module.exports = Logins;