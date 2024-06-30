import { MemoryRouter, Routes, Route } from "react-router-dom";
import Homepage from "../../src/pages/Homepage";
import Messages from "../../src/pages/Messages";
import Profile from "../../src/pages/Profile";
import TestProviders from "../utils/TestProviders";

describe("<SearchBar />", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/messages" element={<Messages />} />\
            <Route path="/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>
    );
    cy.viewport(1280, 720);
  });
  it("renders the search bar and buttons correctly", () => {
    cy.contains("MartletPlace").should("be.visible");
    cy.get('input[placeholder="Search"]').should("be.visible");
    cy.get("button").contains("Search").should("be.visible");
    cy.get("button").contains("Account").should("be.visible");
    cy.get('button img[alt="Filter Icon"]').should("be.visible");
    cy.get('button img[alt="Message Icon"]').should("be.visible");
  });

  it("should toggle filters visibility on filter button click", () => {
    cy.get('button img[alt="Filter Icon"]').click();
    cy.contains("Filters").should("be.visible");
    cy.get('button img[alt="Filter Icon"]').click();
    cy.contains("Filters").should("not.exist");
  });

  it("should update search input value on typing", () => {
    cy.get('input[placeholder="Search"]').type("Test Search");
    cy.get('input[placeholder="Search"]').should("have.value", "Test Search");
  });

  it("should open menu on hamburger button click and navigate", () => {
    cy.viewport(700, 720); // Adjust viewport to make hamburger menu visible
    cy.get("button").contains("=").click();
    cy.contains("My Profile").should("be.visible");
    cy.contains("My Listing").should("be.visible");
    cy.contains("Messaging").should("be.visible");
  });

  /*
  it("should navigate to messages page on message button click", () => {
    cy.get('button img[alt="Message Icon"]').click();
    cy.contains("Messages").should("be.visible");
  });
   */

  it("should navigate to user profile page on account button click", () => {
    cy.get("button").contains("Account").click();
    cy.contains("My Profile").should("be.visible");
  });

  it("should navigate to user profile page on hamburger menu click", () => {
    cy.viewport(700, 720); // Adjust viewport to make hamburger menu visible
    cy.get("button").contains("=").click();
    cy.contains("My Profile").click();
    cy.contains("My Profile").should("be.visible");
  });

  it("updates search input values", () => {
    cy.get('input[placeholder="Search"]').type("Test Search");
    cy.get('input[placeholder="Search"]').should("have.value", "Test Search");
    cy.get(":nth-child(3) > .MuiButtonBase-root").click();
    cy.get('input[placeholder="Min"]').type("100");
    cy.get('input[placeholder="Max"]').type("500");
    cy.get("#status-select").click();
    cy.contains("Not Available").click();
    cy.get("#type-select").click();
    cy.contains("User").click();
    cy.get("button").contains("Search").click();
  });
});
