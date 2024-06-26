describe("Get all threads for user", () => {
  const baseUrl = "http://localhost:8214/api/messages";

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
      expect(parseInt(response.body.totalCount)).to.eq(1);
      expect(response.body.messages).to.be.an("array");
    });
  });

  it("should get zero messages from a non-existent thread", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/thread/1000/10000`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(parseInt(response.body.totalCount)).to.eq(0);
    });
  });
});
