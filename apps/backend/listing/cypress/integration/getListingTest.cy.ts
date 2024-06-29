describe('Get Listing by ID Endpoint', () => {
  it('should retrieve a listing successfully and calculate zero distance for same coordinates', () => {
    cy.request({
      method: 'GET',
      url: '/api/listing/1' // assuming listing with ID 1 exists
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('listingID', 1);
      expect(response.body).to.have.property('title', 'Listing One');
      expect(response.body).to.have.property('description', 'Description for listing one');
      expect(response.body).to.have.property('price', 100);
      expect(response.body).to.have.property('status', 'AVAILABLE');
      expect(response.body).to.have.property('dateCreated');
      expect(response.body).to.have.property('dateModified');
      expect(response.body).to.have.property('reviews').to.be.an('array');
      expect(response.body).to.have.property('images').to.be.an('array');
      expect(response.body).to.have.property('distance', 0); // expect the distance to be zero
    });
  });
});
