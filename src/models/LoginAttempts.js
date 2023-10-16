const { DataTypes, Op } = require('sequelize');
const db = require('../config/config');

const LoginAttempts = db.define('LoginAttempts', {
    date: {
        type: DataTypes.DATE,
        defaultValue: db.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
    },
    IP: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

LoginAttempts.addHook('beforeFind', (options) => {
    // Check if options.where is already defined, and add the date filter
    options.where = {
        ...options.where,
        date: {
            [Op.gte]: new Date(new Date() - 15 * 60 * 1000), // 15 minutes ago
        },
    };
});

LoginAttempts.sync();

module.exports = LoginAttempts;