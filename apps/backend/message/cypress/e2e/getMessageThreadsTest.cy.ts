describe("Get all threads for user", () => {
  const baseUrl = "http://localhost:8214/api/user";

  it("should retrieve all of a user's threads", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/overview`,
      body: {
        num_items: "10",
        offset: "0",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body[0]).to.have.property("listing_id");
      expect(response.body[0]).to.have.property("other_participant");
      expect(response.body[0]).to.have.property("last_message");
    });
  });
});
