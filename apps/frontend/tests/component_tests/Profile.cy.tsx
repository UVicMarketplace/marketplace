import { MemoryRouter, Route, Routes } from "react-router-dom";
import Profile from "../../src/pages/Profile";

describe("<Profile />", () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter initialEntries={[`/user/1`]}>
        <Routes>
          <Route path="/user/:id" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    cy.viewport(1280, 720);
  });

  it("renders the profile page", () => {
    cy.get("h4").should("contain.text", "My Profile");

    // Check if the form contains the necessary input fields
    cy.get("#username").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#bio").should("be.visible");
  });

  const testUsername = "theboywholived";
  const testPassword = "expelliarmus";
  const testName = "Harry James Potter";
  const testBio = "Dumbledore's Army Forever!";
  const testImageURL = "https://example.com/image.png";

  const updatedName = "Hermione Granger";
  const updatedBio = "Brightest witch of her age";
  const updatedImageURL = "https://example.com/hermione.png";

  it("allows typing into the input fields", () => {
    // Type into the input fields
    cy.get("#name").type(testName).should("have.value", testName);
    cy.get("#bio").type(testBio).should("have.value", testBio);
  });

  it("gets the profile information for a user", () => {
    const expectedProfile = {
      userID: "A1234B345",
      username: testUsername,
      name: testName,
      bio: testBio,
      profilePictureUrl: testImageURL,
    };

    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: expectedProfile,
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", expectedProfile);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(expectedProfile);
      }
    });

    it("gets the profile information for a user", () => {
      const expectedProfile = {
        userID: "A1234B345",
        username: testUsername,

        name: testName,
        bio: testBio,
        profilePictureUrl: testImageURL,
      };

      // Stubbing network request for getting profile information
      cy.intercept("GET", "/api/user/1", {
        statusCode: 200,
        body: expectedProfile,
      }).as("profileRequest");

      // Wait for the mock request to complete and check its status
      cy.wait("@profileRequest").then((interception) => {
        // Log request and expected bodies for debugging
        cy.log("Request Body", interception.request.body);
        cy.log("Expected Body", expectedProfile);

        if (interception.response) {
          expect(interception.response.body).to.deep.equal(expectedProfile);
        }
      });

      // Check if the profile information is displayed correctly
      cy.get("#username").should("have.value", testUsername);
      cy.get("#name").should("have.value", testName);
      cy.get("#bio").should("have.value", testBio);
    });
  });

  it("saves updated profile information", () => {
    const updatedProfile = {
      username: testUsername,
      name: updatedName,
      bio: updatedBio,
      profilePictureUrl: updatedImageURL,
      password: testPassword,
    };

    // Type into the input fields
    cy.get("#name").type(updatedName).should("have.value", updatedName);
    cy.get("#bio").type(updatedBio).should("have.value", updatedBio);
    cy.get("#username").type(testUsername).should("have.value", testUsername);

    cy.intercept("PATCH", "/api/user", (req) => {
      // Log request body for debugging
      req.reply({
        statusCode: 200,
        body: updatedProfile,
      });
    }).as("saveProfileRequest");

    // Click the save button
    cy.get("#save_button").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@saveProfileRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", updatedProfile);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(updatedProfile);
      }
    });

    // Assert that the profile information is updated correctly
    cy.get("#name").should("have.value", updatedName);
    cy.get("#bio").should("have.value", updatedBio);
  });

  it("fails to save updated profile information", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);

    cy.intercept("POST", "/api/images", {
      statusCode: 201,
      url: updatedImageURL,
    }).as("uploadImages");

    // Stubbing network request for saving profile information
    cy.intercept("PATCH", "/api/user", {
      statusCode: 400,
      body: { message: "Bad Request" },
    }).as("saveProfileRequest");

    // Click the save button
    cy.get("#save_button").click();

    // Wait for the mock request to complete and check its status
    cy.wait("@saveProfileRequest").its("response.statusCode").should("eq", 400);

    // Assert that the profile information is not updated
    cy.get("#name").should("have.value", updatedName);
    cy.get("#bio").should("have.value", updatedBio);
  });

  it("cancels the changes and reverts to original profile information", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Type into the input fields
    cy.get("#name").clear().type(updatedName).should("have.value", updatedName);
    cy.get("#bio").clear().type(updatedBio).should("have.value", updatedBio);

    // Click the cancel button
    cy.get("#cancel_button").click();

    // Assert that the profile information is reverted correctly
    cy.get("#name").should("have.value", testName);
    cy.get("#bio").should("have.value", testBio);
  });

  it("disables buttons when no profile information has been updated", () => {
    // Stubbing network request for getting profile information
    cy.intercept("GET", "/api/user/1", {
      statusCode: 200,
      body: {
        username: testUsername,
        name: testName,
        password: testPassword,
        bio: testBio,
        profilePictureUrl: testImageURL,
      },
    }).as("profileRequest");

    // Wait for the mock request to complete and check its status
    cy.wait("@profileRequest").its("response.statusCode").should("eq", 200);

    // Check that save and cancel buttons are disabled
    cy.get("#save_button").invoke("attr", "disabled").should("exist");
    cy.get("#cancel_button").invoke("attr", "disabled").should("exist");
  });

  // Check error for handling invalid username format
  it("displays an error message for invalid username format", () => {
    // Type an invalid username
    cy.get("#username")
      .type("invalid-username2389012839082103820198190830981903")
      .should(
        "have.value",
        "invalid-username2389012839082103820198190830981903"
      );

    // Click the save button
    cy.get("#save_button").click();

    // Check if the error message is displayed
    cy.get("p").should(
      "contain.text",
      "Username must be between 1 and 20 characters and only contain letters or numbers."
    );
  });
});
