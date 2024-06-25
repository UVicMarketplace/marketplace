describe("Get all threads for user", () => {
  const baseUrl = "0.0.0.0:/api/messages/";
  // const baseUrl = "http://localhost:8214/api/messages";

  const listingId = 1; // assuming listing with ID 1 exists
  const receiverId = 2; // assuming user with ID 2 exists

  it("should retrieve all messages in a thread", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/thread/${listingId}/${receiverId}`,
      body: {
        num_items: "10",
        offset: "0",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
    });
  });

  it("should fail to retrieve a non-existent thread", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/thread/-1/-1`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("error", "Listing not found");
    });
  });
});
