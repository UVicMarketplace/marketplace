import MyReviews from "../../src/pages/MyReviews";
import { mount } from "cypress/react";

describe("<MyReviews />", () => {
  const mountMyReviews = () => {
    mount(<MyReviews />);
  };

  beforeEach(() => {
    mountMyReviews();
  });

  it("renders the MyReviews page", () => {
    cy.contains("My Reviews").should("be.visible");
  });
});
