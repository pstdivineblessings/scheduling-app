'use strict';

const db = require("../models");
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const initialSqlScript = fs.readFileSync(path.resolve(__dirname, "./sql/initial-db.sql"),{
  encoding: "utf-8",
});

module.exports = {
  async up () {
     await db.sequelize.query(initialSqlScript,{          
      raw: true,
      type: Sequelize.QueryTypes.RAW
    } )
  },

  // async down (queryInterface, Sequelize) {
  async down () {
    await db.sequelize.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`, {          
      raw: true,
      type: Sequelize.QueryTypes.RAW
    });
    
  }
};
