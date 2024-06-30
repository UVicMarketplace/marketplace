import Messages from '../../src/pages/Messages.tsx';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('<Messages />', () => {
  it('renders', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/messages']}>
        <Routes>
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </MemoryRouter>
    );

    // Additional assertions to verify the component rendered correctly
    cy.contains("Messages").should("exist");
  });
});
