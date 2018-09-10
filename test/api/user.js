const { expect } = require('code');
const Lab = require('lab');
const {afterEach, describe, it } = exports.lab = Lab.script();

describe('API Users', () => {
  describe('POST /users', () =>{
    it('should require name/password parameter ')
    it('should fail if username already exists ')
    it('should create a user ')
  })
  describe("DELETE /users/me", () =>{
    it("should remvove user from system");
    it("should log user out");
    describe("afer delete", ()=>{
      it("user should not be able to login");
    })
  })

  describe("GET /users", () =>{
    it("should return [list] other users in the system");
  })

  describe("GET /users/:id", () =>{
    it("should return a user by id");
  })

  describe("GET /users/username/:username", () =>{
    it("should return a user by username");
  })
    
  describe("PUT /users/me", () =>{
    it("should update current user name/birthdate");
    it("should indicate 403 error if attempting to update user different from current user");
    it("should indicate 409 error if attempting to modify attributes other than name/birthDate of current user");
    it("should create a new user with the new attributes if user id does not exist and attributes are valid");
  })
  
  describe("PATCH /users/me", () =>{
    it("should be able to patch current user name");
    it("should be able to patch current user birthdate");
    it("should indicate 409 error if attempt to patch attributes other than current user name/birthDate");
  })   

  describe("POST /login", () =>{
    it("should return access tokens if provided credentials are correct");
    it("should indicate 422 if provided credentials are not correct");
  })       
})