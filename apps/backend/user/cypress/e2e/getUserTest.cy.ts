describe('Get User by ID Endpoint', () => {
  const baseUrl = 'http://localhost:8211/api/user';

  it('should retrieve a user successfully', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/4`, // assuming user with ID 2 exists
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('username', 'user4');
      expect(response.body).to.have.property('email', 'user4@uvic.ca');
      expect(response.body).to.have.property('name', 'User Four');
      expect(response.body).to.have.property('bio', 'Bio for user four');
      expect(response.body).to.have.property('profileUrl', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Angel');
    });
  });
});
