const { expect } = require('code');
const Lab = require('lab');
const {afterEach, before, after, describe, it } = exports.lab = Lab.script();
const testDb = require('../setup').db
const User = require('../../src/models/user')
const Lock = require('../../src/models/lock')
const bcrypt = require('bcrypt')

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
    const saved = await User.where({id: user.id})
    expect(saved).to.exist()
  })
  it("can be destroyed", async()=>{
    const user = await User.create({username:"username", password:"password"})
    user.destroy()
    user.on('destroyed', async ()=>{
      const saved = await User.where({id: user.id})
      expect(saved).to.not.exist()
    })
  }) 
  it("contains locks", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    let locks = await user.locks()
    expect(locks).to.be.empty()
    const lock = await Lock.create({name: "test lock", userId: user.id})
    locks = await user.locks()
    expect(locks.length).to.equal(1)
  })
  it("deletes associated locks on destroy", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const lock = await Lock.create({name: "test lock", userId: user.id})
    let saved = await Lock.where({id: lock.id})
    expect(save).to.exist()
    await user.destroy()
    saved = await Lock.where({id: lock.id})
    expect(saved).to.not.exist()
  })

  it("name/birthDate are initially empty on create", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    expect(user.name).to.be.empty()
    expect(user.birthDate).to.be.empty()
  })

  it("name/birthDate can be patched", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const birthDate = new Date()
    const patchedName="patched name"
    await user.patch({name: patchedName, birthDate: birthDate})
    const saved = User.where({id:user.id})
    expect(saved.name).to.equal(patchedName)
    expect(saved.birthDate).to.equal(birthDate)
  })
  it("name/birthDate can be put", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const birthDate = new Date()
    const patchedName="patched name"
    const cloned = user.clone()
    cloned.set({name: patchedName, birthDate: birthDate})
    await User.put(user, cloned)
    const saved = User.where({id:user.id})
    expect(saved.name).to.equal(patchedName)
    expect(saved.birthDate).to.equal(birthDate)
  })
  it("can insert new record via put when there is no conflict", async ()=>{
    let count = await User.count()
    expect(count).to.equal(0)
    const user = await User.create({username:"username", password:"password"})
    count = await User.count()
    expect(count).to.equal(1)
    const birthDate = new Date()
    const patchedName="patched name"
    const cloned = user.clone()
    cloned.set({id:user.id+1, name: patchedName, birthDate: birthDate})
    await User.put(user, cloned)
    count = await User.count()
    expect(count).to.equal(2)
    const newUser = User.where({id:user.id+1})
    expect(newUser.name).to.equal(patchedName)
    expect(newUser.birthDate).to.equal(birthDate)
    const saved = User.where({id:user.id})
    expect(saved).to.equal(user)
  })
  it("resists updates to all fields other than name/birthDate", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    expect(user.patch({id:user.id+2})).to.reject(Error)
    const cloned = user.clone()
    cloned.set({username:"new username"})
    expect(User.put(user, cloned)).to.reject(Error)
  })
  it("should raise error if username on create conflicts with existing user", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    expect(User.create({username:"username", password:"password"})).to.reject(Error)
  })
  it("should raise error if put new id conflicts with another existing user ", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const user2 = await User.create({username:"username2", password:"password"})
    const cloned = user.clone()
    cloned.set({id: user2.id})
    expect(User.put(user, cloned)).to.reject(Error)
  })
  it("encrypts password", async ()=>{
    const password="secret-password"
    const user = await User.create({username:"username", password:password})
    const createPassword = user.get('password')
    expect(createPassword).to.not.equal(password)
    const result = await bcrypt.compare(password, createPassword)
    expect(result).to.equal(true)
  })
});