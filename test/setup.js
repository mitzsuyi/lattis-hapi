'use strict';

require('dotenv').config()

const dbConf = require('../knexfile.js').test
const bookshelf = require('../src/models/db')

const {setup} = require('../server');

const migrate = async()=>{
    await bookshelf.knex.migrate.rollback(dbConf)
    await bookshelf.knex.migrate.latest(dbConf)
}

const clean = async(options={}) =>{
   await bookshelf.knex('users').truncate()
   await bookshelf.knex('locks').truncate()
}

(async()=>{
  await setup()
})()

module.exports = {
  db:{
    migrate: migrate,
    clean: clean
  } 
}