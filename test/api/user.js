'use strict'

const { expect } = require('code');
const Lab = require('lab');
const {before, afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const {setup, server} = require('../../server');
const testDb = require('../setup').db
const pick = require('lodash.pick')
const itShouldRequireAuthentication = require('../helper').itShouldRequireAuthentication

const CREDENTIALS={id:1}

const request = require('../helper').routeRequest('/users', CREDENTIALS)
const User = require('../../src/models/user')


before(async ()=>{
    await testDb.migrate()
})

beforeEach(async ()=>{
    await testDb.clean()
})

afterEach(async ()=>{
    await testDb.clean()
})

const user_create = async(attributes)=>{
   return User.create(attributes).then((model)=>model.refresh())
}
const TEST_PASSWORD="pass123"
const TEST_USER_NAME="username"

const payload = (response)=>JSON.parse(response.payload)

describe('API Users', () => {
  describe('POST /users -- Sign Up', function (){
    it('should require username/password parameter ', async ()=>{
        let response = await server.inject(
          request("POST")
        )
        expect(response.statusCode).to.equal(400)
        response = await server.inject(
          request("POST",{
            options:{
              payload:{
              username:TEST_USER_NAME
            }}
          })
        )
        expect(response.statusCode).to.equal(400)
         response = await server.inject(
          request("POST",{
            options:{
             payload:{
              password:TEST_PASSWORD
            }}
          })
        )
        expect(response.statusCode).to.equal(400)
    })
    it('should fail if username already exists',async()=>{
      let response = await server.inject(
          request("POST",{
           options:{ 
            payload:{
              username:TEST_USER_NAME,
              password: TEST_PASSWORD
            }}
          })
      )    
      expect(response.statusCode).to.equal(200)   
       response = await server.inject(
          request("POST",{
            options:{
              payload:{
              username:TEST_USER_NAME,
              password: TEST_PASSWORD
            }}
          })
      )  
      expect(response.statusCode).to.equal(422)
    })
    it('should create a user', async()=>{
      let count = await User.count()
      expect(count).to.equal(0)
      const response = await server.inject(
         request("POST",{
          options:{
            payload:{
              username:TEST_USER_NAME,
              password: TEST_PASSWORD
            }}
          })
      )   
      expect(response.statusCode).to.equal(200)
      count = await User.count()
      expect(count).to.equal(1)
    })
 })    
 describe("DELETE /users/me", function(){
    it("should remvove user from system", async ()=>{ 
      let count = await User.count()
      expect(count).to.equal(0)
      const user = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      count = await User.count()
      expect(count).to.equal(1)
      const response = await server.inject(
          request("DELETE", {}, "me")
      )
      expect(response.statusCode).to.equal(204)
      count = await User.count()
      expect(count).to.equal(0) 
    }); 
    it('should require authentication', itShouldRequireAuthentication(server,
        request("DELETE", {credentials: undefined},"me")
    ))  
  }) 
  describe("GET /users", () =>{
    it("should return [list] other users in the system", async()=>{
      const user = await user_create({username:"username1", password:TEST_PASSWORD})
      const username2 = "username2"
      const user2 = await user_create({username:username2, password:TEST_PASSWORD})
      const response = await server.inject(
          request("GET")
      )
      expect(response.statusCode).to.equal(200)
      const users=payload(response)
      expect(pick(users[0], ['id', 'username'])).to.equal({id: user2.get('id'), username:username2})
    });
    it('should require authentication', itShouldRequireAuthentication(server,
        request("GET", {credentials: undefined})
    ))   
  })
  describe("GET /users/:id", () =>{
    it("should return a user by id", async()=>{
      await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      const username2 = "username2"
      const user2 = await user_create({username:username2, password:TEST_PASSWORD})
      const response = await server.inject(
          request("GET",{},user2.id)
      )
      expect(response.statusCode).to.equal(200)
      const user=payload(response)
      expect(pick(user, ['id', 'username'])).to.equal({id: user2.get('id'), username:username2})
    });
    it('should require authentication', itShouldRequireAuthentication(server,
        request("GET", {credentials: undefined},1)
    ))  
  })
  describe("GET /users/username/:username", () =>{
    it("should return a user by username", async()=>{
      await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      const username2 = "username2"
      const user2 = await user_create({username:username2, password:TEST_PASSWORD})
      const response = await server.inject(
          request("GET",{},"username/"+user2.get('username'))
      )
      expect(response.statusCode).to.equal(200)
      const user=payload(response)
      expect(pick(user, ['id', 'username'])).to.equal({id: user2.get('id'), username:username2})
    });
   it('should require authentication', itShouldRequireAuthentication(server,
        request("GET", {credentials: undefined},"username")
   ))   
  })
   describe("PUT /users/me", () =>{
    it("should be able to update current user name/birthdate", async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      expect(me.pick(['name', 'birthDate'])).to.be.empty()
      const meName="meName"
      const meBirthDate=new Date()
      me.set({name:meName, birthDate: meBirthDate})
      const response = await server.inject(
          request("PUT",{options:{
            payload: me.serialize()
          }},"me")
      )
      expect(response.statusCode).to.equal(200)
      const updated = payload(response)
      expect(pick(updated,['id','name', 'birthDate'])).to.equal({id:me.get('id'),name:meName,birthDate:meBirthDate.toISOString()})
    })
    it("should indicate 403 error if attempting to update user different from current user",async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      const othername= "othername"
      const other = await user_create({username:othername, password:TEST_PASSWORD})
      const meName="meName"
      const meBirthDate=new Date()
      other.set({name:meName, birthDate: meBirthDate})
      const response = await server.inject(
          request("PUT",{options:{
            payload: other.serialize()
          }},"me")
      )
      expect(response.statusCode).to.equal(403)
    })
    it("should indicate 409 error if attempting to modify serialize other than name/birthDate of current user", async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      me.set("username","newusername")
      const response = await server.inject(
          request("PUT",{options:{
            payload: me.serialize()
          }},"me")
      )
      expect(response.statusCode).to.equal(409)
 
    })
    it("should indicate 404 if user id does not exist", async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      me.set({id:10, username:"newusername"})
      const response = await server.inject(
          request("PUT",{options:{
            payload: me.serialize()
          }},"me")
      )
      expect(response.statusCode).to.equal(404)
    })
    it('should require authentication', itShouldRequireAuthentication(server,
        request("PUT", {credentials: undefined, options:{payload:User.forge().serialize()}},"me")
    ))    
  })

  describe("PATCH /users/me", () =>{
    it("should be able to patch current user name", async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      expect(me.pick(['name'])).to.be.empty()
      const meName="meName"
      const meBirthDate=new Date()
      const response = await server.inject(
          request("PATCH",{options:{
            payload:{name:meName}
          }},"me")
      )
      expect(response.statusCode).to.equal(200)
      const patched = payload(response)
      expect(pick(patched,['id','name'])).to.equal({id:me.get('id'),name:meName})

    })
    it("should be able to patch current user birthDate", async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      expect(me.pick(['birthDate'])).to.be.empty()
      const meName="meName"
      const meBirthDate=new Date()
      const response = await server.inject(
          request("PATCH",{options:{
            payload:{birthDate: meBirthDate}
          }},"me")
      )
      expect(response.statusCode).to.equal(200)
      const patched = payload(response)
      expect(pick(patched,['id','birthDate'])).to.equal({id:me.get('id'),birthDate:meBirthDate.toISOString()})

    })
    it("should indicate 400 error if attempt to patch attributes other than current user name/birthDate", async()=>{
      const me = await user_create({username:TEST_USER_NAME, password:TEST_PASSWORD})
      const response = await server.inject(
          request("PATCH",{options:{
            payload: {"username":"newusername"}
          }},"me")
      )
      expect(response.statusCode).to.equal(400)
    })
   it('should require authentication', itShouldRequireAuthentication(server,
        request("PATCH", {credentials: undefined, options:{payload:{name:"patched name"}}},"me")
    ))    
  })   

  describe("POST /login", () =>{
    it("should return access tokens if provided credentials are correct", async()=>{
      const  credentials = {username:TEST_USER_NAME, password:TEST_PASSWORD}
      const me = await user_create(credentials)
      const response = await server.inject(
          request("POST",{
            basePath: "/login",
            options:{
            payload:credentials
          }})
      )
      expect(response.statusCode).to.equal(200)
      const access_token = payload(response).access_token
      expect(access_token).to.exist()
    })
    it("should indicate 401 if provided credentials are not correct", async()=>{
      const  credentials = {username:TEST_USER_NAME, password:TEST_PASSWORD}
      const me = await user_create(credentials)
      const response = await server.inject(
          request("POST",{
            basePath: "/login",
            options:{
            payload:{username:TEST_USER_NAME,password:"bad password"}
          }})
      )
      expect(response.statusCode).to.equal(401)
    })
     it("should be able to access a restricted resource with token", async()=>{
      const  credentials = {username:TEST_USER_NAME, password:TEST_PASSWORD}
      const me = await user_create(credentials)
      let response = await server.inject(
          request("GET",{credentials:undefined},"me")
      )
      expect(response.statusCode).to.equal(401)
      response = await server.inject(
          request("POST",{
            basePath: "/login",
            options:{
            payload:{username:TEST_USER_NAME,password:TEST_PASSWORD}
          }})
      )
      const access_token = payload(response).access_token
      response = await server.inject(
          request("GET",{credentials:undefined,
          options:{
            headers:{"Authorization": access_token}
          }},"me")
      )
      expect(response.statusCode).to.equal(200)
    })
  })  
})