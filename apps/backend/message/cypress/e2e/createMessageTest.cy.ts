describe("Create Message", () => {
  const baseUrl = "/api/messages";

  it("should successfully create a new message", () => {
    const content = "hi i want to buy your couch";
    cy.request({
      method: "POST",
      url: baseUrl,
      body: {
        listing_id: "1",
        receiver_id: "2",
        content: content,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("content", content);
      expect(response.body).to.have.property("listing_id", "1");
      expect(response.body).to.have.property("receiver_id", "2");
    });
  });

  it("should fail to create a new message with missing parameters", () => {
    cy.request({
      method: "POST",
      url: baseUrl,
      body: {
        content: "hi",
        receiver_id: "2",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property("error");
    });
  });
});
