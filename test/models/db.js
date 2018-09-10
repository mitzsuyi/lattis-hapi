exports.lab = require('lab').script();
const {describe, expect, it} = require('../setup')
var knexfile = require('../../knexfile.js')

describe('db', function() {
 it("connects to mysql or sqlite db",()=>{
    ['development', 'test', 'production'].forEach((env)=>{
      const config =  knexfile[env]
      expect(config).to.exist() 
      expect(config.client).to.include(['mysql', 'sqlite'])       
    })
 })
});