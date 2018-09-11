const { expect } = require('code');
const Lab = require('lab');
const {afterEach, before,beforeEach, after, describe, it } = exports.lab = Lab.script();
const testDb = require('../setup').db
const User = require('../../src/models/user')
const Lock = require('../../src/models/lock')
const bcrypt = require('bcrypt')

before(async ()=>{
    await testDb.migrate()
})
beforeEach(async ()=>{
    await testDb.clean()
})
afterEach(async ()=>{
    await testDb.clean()
})

describe('User model', ()=> {
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
    const user = await User.create({username:"destroy-user", password:"password"})
    const userId = user.id 
    let saved = await User.where({id:userId}).fetch()  
    expect(saved).to.exist()
    await user.destroy()
    saved = await User.where({id:userId}).fetch()
    expect(saved).to.not.exist()
  }) 
  it("contains locks", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    let locks = await user.related('locks').fetch()
    expect(locks).to.be.empty()
    const lock = await Lock.create({name: "test lock", userId: user.id})
    locks = await user.related('locks').fetch()
    expect(locks.length).to.equal(1)
  })
  it("deletes associated locks on destroy", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    let count = await Lock.count()
    expect(count).to.equal(0)
    const lock = await Lock.create({name: "test lock", userId: user.id})
    count = await Lock.count()
    expect(count).to.equal(1)
    let saved = await Lock.where({id: lock.id}).fetch()
    expect(saved).to.exist()
    await user.destroy()
    saved = await Lock.where({id: lock.id}).fetch()
    expect(saved).to.not.exist()
    count = await Lock.count()
    expect(count).to.equal(0)
  })

  it("name/birthDate are initially empty on create", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    expect(user.get('name')).to.not.exist()
    expect(user.get('birthDate')).to.not.exist()
  })


  it("name/birthDate can be patched", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const birthDate = new Date()
    const patchedName="patched name"
    await user.patch({name: patchedName, birthDate: birthDate})
    const saved = await User.where({id:user.id}).fetch()
    expect(saved.get('name')).to.equal(patchedName)
    expect(saved.get('birthDate')).to.equal(birthDate)
  })
  
  it("name/birthDate can be put", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const birthDate = new Date()
    const patchedName="patched name"
    let cloned = user.clone()
    cloned.set({name: patchedName, birthDate: birthDate})
    const updated = await User.put(user, cloned)
    const saved = await User.where({id:user.id}).fetch()
    expect(saved.get('name')).to.equal(patchedName)
    expect(saved.get('birthDate')).to.equal(birthDate)
  })
 
  it("validates on create", async ()=>{
    const deferred = User.create({})
    await expect(deferred).to.reject(Error)
  })  
  
  it("validates on put", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const cloned = user.clone()
    cloned.set({name:1,username:"username2", birthDate:"birthdDAte", id:user.id+1})
    await expect(User.put(user, cloned)).to.reject(Error)

  })

  it("validates on patch", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const patch = user.patch({name:1, birthDate:"birthDate"})
    await expect(patch).to.reject(Error)
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
    cloned.set({id:user.id+1, username:"username2", name: patchedName, birthDate: birthDate})
    const updated = await User.put(user, cloned)
    count = await User.count()
    expect(count).to.equal(2)
    const newUser = await User.where({id:user.id+1}).fetch()
    expect(newUser.get('name')).to.equal(patchedName)
    expect(newUser.get('birthDate')).to.equal(birthDate)
    const saved = User.where({id:user.id})
    const savedNameBirthDate = saved.pick(["name", "birthDate"])
    expect(savedNameBirthDate).to.equal({})
    expect(savedNameBirthDate).to.equal(user.pick(["name", "birthDate"]))
  })

  it("resists updates to all fields other than name/birthDate", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    expect(user.patch({id:user.id+2})).to.reject(Error)
    const cloned = user.clone()
    cloned.set({username:"new username"})
    await expect(User.put(user, cloned)).to.reject(Error)
  })

  it("should raise error if username on create conflicts with existing user", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    await expect(User.create({username:"username", password:"password"})).to.reject(Error)
  })

  it("should raise error if put new id conflicts with another existing user ", async ()=>{
    const user = await User.create({username:"username", password:"password"})
    const user2 = await User.create({username:"username2", password:"password"})
    const cloned = user.clone()
    cloned.set({id: user2.id})
    await expect(User.put(user, cloned)).to.reject(Error)
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