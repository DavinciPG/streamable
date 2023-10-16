const { DataTypes, Sequelize } = require('sequelize');
const db = require('../config/config');

const Video = db.define('videos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
       type: DataTypes.STRING,
       allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
    private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
});

Video.belongsTo(db.models.user, { foreignKey: 'owner_id' });

Video.sync();

module.exports = Video;