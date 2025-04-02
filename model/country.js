const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const Country = sequelize.define('country_master', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chat: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  area_code: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  createdby: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedby: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },

}, {
  tableName: 'country_master',
  timestamps: false,
  createdby: 'createdby',
  updatedby: 'updatedby',
});

module.exports = Country;
