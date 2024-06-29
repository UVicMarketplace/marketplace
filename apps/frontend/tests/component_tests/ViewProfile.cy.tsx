import { MemoryRouter, Route, Routes } from "react-router-dom";
import ViewProfile from "../../src/pages/ViewProfile";
import TestProviders from "../utils/TestProviders";

describe("<ViewProfile />", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/user/profile/1`]}>
          <Routes>
            <Route path="/user/profile/:id" element={<ViewProfile />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>
    );
  });

  it("renders the profile page", () => {
    cy.get("h4").should("contain.text", "User Profile");

    // Check if the form contains the necessary input fields
    cy.get("#username").should("be.visible");
    cy.get("#name").should("be.visible");
  });

  it("should get the profile information for a user", () => {
    const expectedProfileObject = {
      userID: "1",
      username: "testuser",
      name: "Test User",
      bio: "This is a test user",
      profileUrl: "https://picsum.photos/200/300",
    };

    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: expectedProfileObject,
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", expectedProfileObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(expectedProfileObject);
      }
    });

    cy.contains("Username: " + expectedProfileObject.username).should(
      "be.visible"
    );
    cy.contains("Name: " + expectedProfileObject.name).should("be.visible");
    cy.contains(expectedProfileObject.bio).should("be.visible");
    cy.get("div#profile_picture > img").should(
      "have.attr",
      "src",
      expectedProfileObject.profileUrl
    );
  });
});
