import EditListing from "../../src/pages/EditListing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TestProviders from "../utils/TestProviders";

const listingObject = {
  listingID: "A23F29039B23",
  seller_profile: {
    userID: "A12334B345",
    username: "hubert123",
    name: "Bartholomew Hubert",
    bio: "I love stuff",
    profilePictureUrl: "https://example.com/image.png",
  },
  title: "Used Calculus Textbook",
  description: "No wear and tear, drop-off available.",
  price: 50,
  location: {
    latitude: 34.23551,
    longitude: -104.54451,
  },
  status: "AVAILABLE",
  dateCreated: "2024-05-23T15:30:00Z",
  dateModified: "2024-05-23T15:30:00Z",
  reviews: [
    {
      listing_review_id: "A23F29039B23",
      reviewerName: "John Doe",
      stars: 5,
      comment:
        "Great seller, the item was exactly as described and in perfect condition.",
      userID: "A23434B090934",
      listingID: "A23F29039B23",
      dateCreated: "2024-05-23T15:30:00Z",
      dateModified: "2024-05-23T15:30:00Z",
    },
  ],
  images: [
    { url: "https://picsum.photos/200/300" },
    { url: "https://picsum.photos/200/300" },
    { url: "https://picsum.photos/200/300" },
  ],
  distance: 4.2,
};

describe("<EditListing />", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/listing/edit/1`]}>
          <Routes>
            <Route path="/listing/edit/:id" element={<EditListing />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>,
    );
    cy.viewport(1280, 720);
    cy.intercept("GET", "/api/listing/1", (req) => {
      req.reply({
        statusCode: 200,
        body: listingObject,
      });
    }).as("getListing");
  });

  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.wait("@getListing");

    cy.intercept("PATCH", "/api/listing/1", (req) => {
      req.reply({
        statusCode: 200,
      });
    }).as("patchListing");

    cy.contains("Edit Listing").should("be.visible");
  });

  it("Edits the listing correctly", () => {
    const patchObject = {
      listing: {
        title: "This is a bad textbook like the one used with SENG 474",
        price: 0,
        location: { latitude: 48.463302, longitude: -123.3108 },
        description: "I do not like this textbook",
        images: [
          { url: "https://picsum.photos/200/300" },
          { url: "https://picsum.photos/200/300" },
          { url: "https://picsum.photos/200/300" },
        ],
      },
      status: "AVAILABLE",
    };
    cy.wait("@getListing");

    cy.intercept("PATCH", "/api/listing/1", (req) => {
      req.reply({
        statusCode: 200,
      });
    }).as("patchListing");

    cy.contains("Edit Listing").should("be.visible");

    cy.get("#field-description").should(
      "have.value",
      listingObject.description,
    );

    cy.get("#field-description").type("HELLO");

    cy.get("#field-description")
      .should("be.visible")
      .clear()
      .type("I do not like this textbook")
      .should("have.value", "I do not like this textbook");

    cy.get("#field-title")
      .should("be.visible")
      .clear()
      .type("{selectall}{backspace}")
      .type("This is a bad textbook like the one used with SENG 474")
      .should(
        "have.value",
        "This is a bad textbook like the one used with SENG 474",
      );

    cy.get("#field-price")
      .should("be.visible")
      .type("{selectAll}0")
      .should("have.value", "0");

    cy.get("#submit-button", { timeout: 10000 }).should("be.visible").click();

    cy.wait("@patchListing").then((interception) => {
      const requestBody = interception.request.body;
      cy.log("Request Body", requestBody);
      cy.log("Expected Body", patchObject);
      expect(requestBody).to.deep.equal(patchObject);
    });
  });

  it("Deletes listing correctly", () => {
    cy.intercept("DELETE", "/api/listing/1", (req) => {
      req.reply({
        statusCode: 200,
      });
    }).as("deleteListing");

    cy.get("#delete-button").click();

    cy.wait("@deleteListing").its("response.statusCode").should("eq", 200);
  });

  it("Changes Status of Listing", () => {
    const patchObject = {
      listing: {
        title: "Used Calculus Textbook",
        price: 50,
        location: { latitude: 48.463302, longitude: -123.3108 },
        description: "No wear and tear, drop-off available.",
        images: [
          { url: "https://picsum.photos/200/300" },
          { url: "https://picsum.photos/200/300" },
          { url: "https://picsum.photos/200/300" },
        ],
      },
      status: "SOLD",
    };

    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/listing/edit/1`]}>
          <Routes>
            <Route path="/listing/edit/:id" element={<EditListing />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>,
    );

    cy.wait("@getListing");

    cy.intercept("PATCH", "/api/listing/1", (req) => {
      req.reply({
        statusCode: 200,
      });
    }).as("patchListing");

    cy.get("#status-button", { timeout: 10000 }).should("be.visible").click();

    cy.get("#submit-button", { timeout: 10000 }).should("be.visible").click();

    cy.wait("@patchListing").then((interception) => {
      const requestBody = interception.request.body;
      cy.log("Request Body", requestBody);
      cy.log("Expected Body", patchObject);
      expect(requestBody).to.deep.equal(patchObject);
    });
  });
});
