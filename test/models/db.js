const { expect } = require('code');
const Lab = require('lab');
const { describe, it } = exports.lab = Lab.script();

var knexfile = require('../../knexfile.js')

describe('db', () =>{
 it("connects to mysql or sqlite db",()=>{
    ['development', 'test', 'production'].forEach((env)=>{
      const config =  knexfile[env]
      expect(config).to.exist() 
      expect(config.client).to.match(/mysql|sqlite3/)       
    })
 })
});