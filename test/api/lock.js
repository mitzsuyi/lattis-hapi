exports.lab = require('lab').script();
const {describe, it} = require('../setup')

describe('API Locks', function() {
  describe('POST /locks', ()=>{
    it('should require name parameter ')
    it('should fail if name already exists ')
    it('should require authentication')
    it('should create a lock ')
  })
  describe('DELETE /locks/:id', ()=>{
    it('should delete lock if it belongs to authenticated user ')
  })
  describe('GET /locks', ()=>{
    it('should retrieve authenticated user locks ')
  })
  describe('GET /locks/:id', ()=>{
    it('should retrieve a lock that belongs to authenticated user by id ')
  })
  describe('GET /locks/macid/:macid', ()=>{
    it('should retrieve a lock that belongs to authenticated user by macid ')
  })

  describe('PATCH /locks/:id', ()=>{
    it('should be able to update lock name if it belongs to authenticated user ')
    it("should not allow patching fields other than name");
  })
});