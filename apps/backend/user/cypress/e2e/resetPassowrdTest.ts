describe('Reset Password', () => {
  it('should successfully send a reset password email', () => {
    cy.request({
      method: 'POST',
      url: '/api/user/reset-password',
      body: {
        email: 'testuser@example.com'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Email sent successfully');
    });
  });

  it('should handle error if email sending fails', () => {
    cy.intercept('POST', '/api/user/reset-password', {
      statusCode: 500,
      body: { error: "Email could not be sent. Please try again" }
    }).as('resetPassword');

    cy.request({
      method: 'POST',
      url: '/api/user/reset-password',
      body: {
        email: 'testuser@example.com'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(500);
      expect(response.body).to.have.property('error', 'Email could not be sent. Please try again');
    });
  });
});
