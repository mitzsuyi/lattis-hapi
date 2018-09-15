const { expect } = require('code');
const Lab = require('lab');
const {afterEach, before, describe, it } = exports.lab = Lab.script();
const Joi = require('joi')
const Lock = require('../../src/models/lock')
const User = require('../../src/models/user')
const testDb = require('../setup').db

before(async ()=>{
    await testDb.migrate()
    await testDb.clean()
})

afterEach(async ()=>{
    await testDb.clean()
})

describe('Lock model', function() {
  it("can be created", async ()=>{
    let count = await Lock.count()
    expect(count).to.equal(0)
    const lock = await Lock.create({name:"name", userId:1})
    expect(lock).to.exist()
    count = await Lock.count()
    expect(count).to.equal(1)
    const saved = await Lock.where({id: lock.id})
    expect(saved).to.exist()
  })
  it("validates on create", async ()=>{
    const deferred = Lock.create({})
    await expect(deferred).to.reject(Error)
  })  
  
  it("validates on patch", async ()=>{
    const lock = await Lock.create({name:"patch test", userId:1})
    await expect(lock.patch({name:1})).to.reject(Error)
  })

  it("can be destroyed", async ()=>{
    const lock = await Lock.create({name:"name", userId:1})
    const lockId = lock.get('id')
    let saved = await Lock.where({id:lockId}).fetch()
    expect(saved).to.exist()
    await lock.destroy()
    saved = await Lock.where({id:lockId}).fetch()
    expect(saved).to.not.exist()
  })

  it("requires userid to create", async ()=>{
    expect(Lock.create()).to.reject(Error)
    expect(Lock.create({name:"name"})).to.reject(Error)
  })

  it("names + userId are unique", async ()=>{
    const sameParams = {name:"name", userId:1}
    await Lock.create(sameParams)
    expect(Lock.create(sameParams)).to.reject(Error)
  })

  it("name can be patched", async ()=>{
    const lock = await Lock.create({name:"patch me", userId:1})
    const patchedName="patched name"
    await lock.patch({name: patchedName})
    const saved = await Lock.where({id:lock.id}).fetch()
    expect(saved.get('name')).to.equal(patchedName)
  })

  it("contains reference to a user", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const lock = await Lock.create({name:"name", userId:user.id})
    const association = await lock.related('user').fetch()
    expect(association.tableName).to.equal(user.tableName)
    expect(association.pick('username', 'id', 'password')).to.equal(user.pick('username', 'id', 'password'))
  })

  it("macId is autogenerated", async ()=>{
    const lock = await Lock.create({name:"name", userId:1})
    const macId = lock.get('macId')
    expect(macId).to.exist()
    const isUuid = Joi.validate(macId, Joi.string().guid()).error === null
    expect(isUuid).to.be.true()
  })
});