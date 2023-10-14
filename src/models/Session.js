const { DataTypes } = require('sequelize');
const db = require('../config/config');

const Session = db.define('Session', {
  sid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  data: DataTypes.TEXT,
  expires: DataTypes.DATE,
});

module.exports = Session;