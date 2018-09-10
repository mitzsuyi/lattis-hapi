'use strict';

const dbConf = require('../knexfile.js').test
const bookshelf = require('../src/models/db')
const knexCleaner = require('knex-cleaner');

const migrate = async()=>{
    await bookshelf.knex.migrate.rollback(dbConf)
    await bookshelf.knex.migrate.latest(dbConf)
}

const clean = async() =>{
    await knexCleaner.clean(bookshelf.knex)
}

module.exports = {
  db:{
    migrate: migrate,
    clean: clean
  } 
}