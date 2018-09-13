'use strict'

const { expect } = require('code');
const Lab = require('lab');
const {before, afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const Lock = require('../../src/models/lock')
const {setup, server} = require('../../server');
const itShouldRequireAuthentication = require('../helper').itShouldRequireAuthentication
const pick = require('lodash.pick')
const testDb = require('../setup').db
const uuidv4 = require('uuid/v4');

const CREDENTIALS={id:1}

const request = require('../helper').routeRequest("/locks", CREDENTIALS)

before(async ()=>{
    await testDb.migrate()
    await testDb.clean() 
})

afterEach(async ()=>{
    await testDb.clean()
})

const TEST_LOCK_NAME="test lock"

describe('API Locks', function() {
  describe('POST /locks', ()=>{
    it('should require name parameter ', async ()=>{
        const response = await server.inject(
          request("POST")
        )
        expect(response.statusCode).to.equal(400)
    })
    it('should fail if name already exists', async()=>{
      const params = {
        options:{
            payload:{
              name:TEST_LOCK_NAME
            }
        }
      }  
      let response = await server.inject(
          request("POST", params)
      )
      expect(response.statusCode).to.equal(200)
      response = await server.inject(
          request("POST", params)
      )
      expect(response.statusCode).to.equal(422)
    })
    it('should create a lock ', async()=>{
       let count = await Lock.count()
       expect(count).to.equal(0)
       let response = await server.inject(
          request("POST", {
            options:{
              payload:{
                name: TEST_LOCK_NAME
              }
            }
          })
      )
      expect(response.statusCode).to.equal(200)
      count = await Lock.count()
      expect(count).to.equal(1)
    })
  })
  describe('DELETE /locks/:id', ()=>{
    it('should delete lock if it belongs to authenticated user', async()=>{
      let count = await Lock.count()
      expect(count).to.equal(0)
      const lock = await Lock.create({name:TEST_LOCK_NAME, userId:CREDENTIALS.id})
      count = await Lock.count()
      expect(count).to.equal(1)
      const lockId = lock.get('id')
      const response = await server.inject(
          request("DELETE", {}, lockId)
      )
      expect(response.statusCode).to.equal(204)
      count = await Lock.count()
      expect(count).to.equal(0) 
   })  
   it('should return error if lock does not belong to authenticated user', async()=>{
      const userId = CREDENTIALS.id + 1
      let count = await Lock.count()
      expect(count).to.equal(0) 
      const lock = await Lock.create({name:TEST_LOCK_NAME, userId:userId})
      count = await Lock.count()
      expect(count).to.equal(1) 
      const lockId = lock.get('id')
      const response = await server.inject(
          request("DELETE", {}, lockId)
      )
      expect(response.statusCode).to.equal(403)
      count = await Lock.count()
      expect(count).to.equal(1) 
   })
   it('should require authentication', itShouldRequireAuthentication(server,
        request("DELETE", {credentials: undefined}, 1)
   ))  
  })
  describe('GET /locks', ()=>{
    it('should get authenticated user locks', async()=>{
      let count = await Lock.count()
      expect(count).to.equal(0)  
      const userId = CREDENTIALS.id
      const lock = await Lock.create({name:TEST_LOCK_NAME, userId:userId})
      count = await Lock.count()
      expect(count).to.equal(1) 
      const response = await server.inject(
          request("GET")
      )
      expect(response.statusCode).to.equal(200)
      const payload = JSON.parse(response.payload)[0]
      expect(payload.userId).to.equal(userId)
      expect(pick(payload,['id', 'name', 'userId'])).to.equal(lock.pick('id','name','userId'))
    })
    it('should require authentication', itShouldRequireAuthentication(server,
        request("GET", {credentials: undefined})
    ))  
  })
  describe('GET /locks/:id', ()=>{
    it('should retrieve a lock that belongs to authenticated user by id ', async()=>{
      let count = await Lock.count()
      expect(count).to.equal(0)  
      const userId = CREDENTIALS.id
      const lock = await Lock.create({name:TEST_LOCK_NAME, userId:userId})
      count = await Lock.count()
      expect(count).to.equal(1) 
      const lockId = lock.get('id')
      const response = await server.inject(
          request("GET", {}, lockId)
      )
     expect(response.statusCode).to.equal(200)
     const payload = JSON.parse(response.payload)
     expect(pick(payload,['id', 'name', 'userId'])).to.equal({id: lockId, name: TEST_LOCK_NAME, userId: userId})
    })
    it('should require authentication', itShouldRequireAuthentication(server,
        request("GET", {credentials: undefined}, 1)
    ))  
  })
  describe('GET /locks/macid/:macid', ()=>{
    it('should retrieve a lock that belongs to authenticated user by macid', async()=>{
      let count = await Lock.count()
      expect(count).to.equal(0)  
      const userId = CREDENTIALS.id
      const lock = await Lock.create({name:TEST_LOCK_NAME, userId:userId})
      count = await Lock.count()
      expect(count).to.equal(1) 
      const macId = lock.get('macId')
      expect(macId).to.exist()
      const response = await server.inject(
          request("GET", {}, 'macid/'+macId)
      )
     expect(response.statusCode).to.equal(200)
     const payload = JSON.parse(response.payload)
     expect(pick(payload,['id', 'name', 'userId', 'macId'])).to.equal({id: lock.id, name: TEST_LOCK_NAME, userId: userId, macId: macId})
    })
    it('should require authentication', itShouldRequireAuthentication(server,
        request("GET", {credentials: undefined}, 'macid/'+uuidv4())
    ))  
  })
  describe('PATCH /locks/:id',()=>{
      it('should be able to update lock name if it belongs to authenticated user', async()=>{
        const userId = CREDENTIALS.id
        const lock = await Lock.create({name:TEST_LOCK_NAME, userId:userId})
        let lockId = lock.get('id')
        let response = await server.inject(
            request("GET", {}, lockId)
        )
       expect(response.statusCode).to.equal(200)
       let payload = JSON.parse(response.payload)
       expect(pick(payload,['id', 'name', 'userId'])).to.equal({id: lockId, name: TEST_LOCK_NAME, userId: userId})
       const patchedName="patched name"
       response = await server.inject(
            request("PATCH", {
              options:{
                payload:{
                name:patchedName
                }
            }
            }, lockId)
       )
       expect(response.statusCode).to.equal(200)
       response = await server.inject(
            request("GET", {}, lockId)
       )
       payload = JSON.parse(response.payload)
       expect(pick(payload,['id', 'name', 'userId'])).to.equal({id: lockId, name: patchedName, userId: userId})
     })  
    it('should require authentication', itShouldRequireAuthentication(server,
        request("PATCH", {
          credentials: undefined,
          payload:{
            name:"patched name"
          }
        }, 1)
    ))  
  })
});