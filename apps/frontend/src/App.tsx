import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAccount from "./pages/CreateAccount";
import Homepage from "./pages/Homepage";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import ViewListing from "./pages/ViewListing";
import Messages from "./pages/messages/Messages";
import MyReviews from "./pages/MyReviews";
import MyListings from "./pages/MyListings";
import UserProvider from "./contexts/UserProvider";
import PrivateRoute from "./components/Auth/PrivateRoute";
import AuthRoute from "./components/Auth/AuthRoute";
import ConfirmEmail from "./pages/ConfirmEmail";
import ViewProfile from "./pages/ViewProfile";
import Profile from "./pages/Profile";

function App() {
  return (
    <UserProvider>
      <Router>
        {/* Not wrapped intentionally */}
        <Routes>
          <Route path="/confirm/:token" element={<ConfirmEmail />} />
          {/* Auth Routes */}
          <Route
            path="/user/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/user/resetpassword"
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            }
          />
          <Route
            path="/user/signup"
            element={
              <AuthRoute>
                <CreateAccount />
              </AuthRoute>
            }
          />

          {/* Private Routes */}
          <Route
            path="/:query?"
            element={
              <PrivateRoute>
                <Homepage />
              </PrivateRoute>
            }
          />

          <Route
            path="/user"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile/:id"
            element={
              <PrivateRoute>
                <ViewProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/reviews"
            element={
              <PrivateRoute>
                <MyReviews />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/listings"
            element={
              <PrivateRoute>
                <MyListings />
              </PrivateRoute>
            }
          />
          <Route
            path="/listing/new"
            element={
              <PrivateRoute>
                <CreateListing />
              </PrivateRoute>
            }
          />
          <Route
            path="/listing/edit/:id"
            element={
              <PrivateRoute>
                <EditListing />
              </PrivateRoute>
            }
          />
          <Route
            path="/listing/view/:id"
            element={
              <PrivateRoute>
                <ViewListing />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
