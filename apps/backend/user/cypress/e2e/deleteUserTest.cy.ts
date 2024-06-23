describe('Delete Listing Endpoint', () => {
    const baseUrl = 'http://localhost:8211/api/user';
  
    it('should delete a listing successfully', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/3`, // assuming listing with ID 3 exists
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'User deleted successfully');
      });
    });
  
    it('should fail to delete a non-existent listing', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/9999`, // assuming listing with ID 9999 does not exist
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'User not found');
      });
    });
  });