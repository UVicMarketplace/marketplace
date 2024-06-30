import Filters from "../../src/components/filters";
import { mount } from "cypress/react";

interface SearchObject {
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  status: string;
  searchType: string;
  latitude: number;
  longitude: number;
  sort: string;
  page: number;
  limit: number;
}

const searchObject: SearchObject = {
  query: "",
  minPrice: null,
  maxPrice: null,
  status: "AVAILABLE",
  searchType: "LISTING",
  latitude: 0,
  longitude: 0,
  sort: "RELEVANCE",
  page: 1,
  limit: 6,
};

describe("<Filters />", () => {
  let onFilterChangeStub: (filters: Partial<SearchObject>) => void;

  const mountFilters = () => {
    mount(
      <Filters onFilterChange={onFilterChangeStub} filters={searchObject} />
    );
  };

  beforeEach(() => {
    onFilterChangeStub = cy.stub().as("onFilterChangeStub");
    mountFilters();
  });

  it("renders the filter fields and buttons correctly", () => {
    cy.contains("Filters").should("be.visible");
    cy.get('input[placeholder="Min"]').should("be.visible");
    cy.get('input[placeholder="Max"]').should("be.visible");
    cy.get("#status-select").should("have.value", "");
    cy.get("#type-select").should("have.value", "");
    cy.contains("Update Location").should("be.visible");
    cy.contains("Clear Filter").should("be.visible");
  });

  it("should update min and max price on input", () => {
    cy.get('input[placeholder="Min"]').type("100").should("have.value", "100");
    cy.get('input[placeholder="Max"]').type("500").should("have.value", "500");
  });

  it("should update status and type on selection", () => {
    cy.get("#status-select").click();
    cy.contains("Not Available").click();
    cy.contains("Not Available").should("be.visible");

    cy.get("#type-select").click();
    cy.contains("Users").click();
    cy.contains("Users").should("be.visible");
  });

  it("should call onFilterChange with correct filters on Apply Filters click", () => {
    cy.get('input[placeholder="Min"]').type("100");
    cy.get('input[placeholder="Max"]').type("500");
    cy.get("#status-select").click();
    cy.contains("Not Available").click();
    cy.get("#type-select").click();
    cy.contains("Users").click();

    cy.get("@onFilterChangeStub").should("have.been.calledWith", {
      minPrice: 100,
      maxPrice: 500,
      status: "SOLD",
      searchType: "USERS",
      latitude: 0,
      longitude: 0,
    });
  });

  it("should reset all filters on Clear Filter click", () => {
    cy.get('input[placeholder="Min"]').type("100");
    cy.get('input[placeholder="Max"]').type("500");
    cy.get("#status-select").click();
    cy.contains("Not Available").click();
    cy.get("#type-select").click();
    cy.contains("Users").click();

    cy.contains("Clear Filter").click();
    cy.get('input[placeholder="Min"]').should("have.value", "");
    cy.get('input[placeholder="Max"]').should("have.value", "");
    cy.get("#status-select").should("have.value", "");
    cy.get("#type-select").should("have.value", "");
  });

  it("should handle non-numeric values gracefully in price fields", () => {
    cy.get('input[placeholder="Min"]').type("abc").should("have.value", "");
    cy.get('input[placeholder="Max"]').type("xyz").should("have.value", "");
  });

  it("should adjust layout correctly for different screen sizes", () => {
    cy.viewport(850, 720);
    cy.get('input[placeholder="Min"]').should("be.visible");
    cy.get('input[placeholder="Max"]').should("be.visible");
    cy.get("#status-select").should("be.visible");
    cy.get("#type-select").should("be.visible");
    cy.contains("Update Location").should("be.visible");
    cy.contains("Clear Filter").should("be.visible");

    cy.viewport(600, 720);
    cy.get('input[placeholder="Min"]').should("be.visible");
    cy.get('input[placeholder="Max"]').should("be.visible");
    cy.get("#status-select").should("be.visible");
    cy.get("#type-select").should("be.visible");
    cy.contains("Update Location").should("be.visible");
    cy.contains("Clear Filter").should("be.visible");
  });
});
