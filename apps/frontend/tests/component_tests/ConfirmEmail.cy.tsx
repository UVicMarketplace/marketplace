import ConfirmEmail from "../../src/pages/ConfirmEmail";
import TestProviders from "../utils/TestProviders";
import { Route, Routes, MemoryRouter } from "react-router-dom";

describe("<ConfirmEmail />", () => {
  beforeEach(() => {
    cy.intercept("POST", "/user/confirm-email*", {
      statusCode: 200,
      body: {},
    }).as("confirmEmail");

    cy.mount(
      <MemoryRouter initialEntries={["/confirm-email/fake-token"]}>
        <TestProviders>
          <Routes>
            <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
            <Route path="/user/login" element={<div>Login Page</div>} />
          </Routes>
        </TestProviders>
      </MemoryRouter>
    );
  });

  it("renders the confirmation message", () => {
    cy.contains("waiting for email confirmation...").should("be.visible");

    cy.wait("@confirmEmail")
      .its("request.body")
      .should("deep.equal", { code: "fake-token" });
  });
});
