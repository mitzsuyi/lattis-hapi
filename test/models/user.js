const { expect } = require('code');
const Lab = require('lab');
const {afterEach, before, after, describe, it } = exports.lab = Lab.script();
const testDb = require('../setup').db
const User = require('../../src/models/user')

before(async ()=>{
    await testDb.migrate()
    await testDb.clean()
})

afterEach(async ()=>{
    await testDb.clean()
})

describe('User model', function() {
  it("can be created", async ()=>{
    let count = await User.count()
    expect(count).to.equal(0)
    const user = await User.create({username:"username", password:"password"})
    expect(user).to.exist()
    count = await User.count()
    expect(count).to.equal(1)
    const saved = User.where({id: user.id})
    expect(saved).to.exist(1)
  })
  it("can be destroyed", ()=>{

  }) 
  it("contains locks", ()=>{

  })
  it("deletes associated locks on destroy", ()=>{

  })
  it("name/birthDate can be patched", ()=>{

  })
  it("name/birthDate can be put", ()=>{

  })
  it("can insert new record via put when there is no conflict", ()=>{

  })
  it("resists updates to all fields other than name/birthDate", ()=>{

  })
  it("encrypts password", ()=>{

  })
  it("can be updated", ()=>{

  })
});