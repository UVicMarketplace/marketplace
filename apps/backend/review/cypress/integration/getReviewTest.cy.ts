describe('Get Review by ID Endpoint', () => {
      
    it('should retrieve a review successfully', () => {
      cy.request({
        method: 'GET',
        url: '/api/review/1', // assuming review with ID 1 exists
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('review_id', 1);
        expect(response.body).to.have.property('reviewerName', 'deleted_user');
        expect(response.body).to.have.property('stars', 5);
        expect(response.body).to.have.property('comment', 'Terrible product, really');
        expect(response.body).to.have.property('userID', 1);
        expect(response.body).to.have.property('listingID', 1);
        expect(response.body).to.have.property('dateCreated');
        expect(response.body).to.have.property('dateModified');
      });
    });
  });
  