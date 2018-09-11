'use strict';

const dbConf = require('../knexfile.js').test
const bookshelf = require('../src/models/db')
const knexCleaner = require('knex-cleaner');

const migrate = async()=>{
    await bookshelf.knex.migrate.rollback(dbConf)
    await bookshelf.knex.migrate.latest(dbConf)
}

bookshelf.knex.on('query', (query) => {
    if(query.bindings && query.bindings.length){
      if(!query.sql.match(/sqlite|knex/)){
        //console.log(query.sql)
      }
    }
  }) 
  
const clean = async() =>{
    await knexCleaner.clean(bookshelf.knex)
}

module.exports = {
  db:{
    migrate: migrate,
    clean: clean
  } 
}