const knexfile = require('../../knexfile.js')
const Config = require('../../config')
var knex = require('knex')(knexfile[Config.ENV])
var DB = require('bookshelf')(knex);
const cascadeDelete = require('bookshelf-cascade-delete');
DB.plugin(cascadeDelete);
module.exports = DB