var knexfile = require('../../knexfile.js')
var knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);
var DB = require('bookshelf')(knex);
module.exports = DB