import ForgotPassword from "../../src/pages/ForgotPassword";
import { mount } from "cypress/react";

describe("<ForgotPassword />", () => {
  const mountForgotPassword = () => {
    mount(<ForgotPassword />);
  };

  beforeEach(() => {
    mountForgotPassword();
  });

  it("renders the forgot password page", () => {
    cy.contains("Forgot Password").should("be.visible");
  });
});
