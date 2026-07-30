import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext.jsx';
import { NavigationDirectionProvider } from './lib/NavigationDirectionContext.jsx';
import PageTransition from './components/PageTransition.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import Landing from './pages/Landing.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import CountryDetail from './pages/CountryDetail.jsx';
import CreateEditTrip from './pages/CreateEditTrip.jsx';
import MyTrips from './pages/MyTrips.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';

function AnimatedRoutes() {
  // Passed explicitly to <Routes> (rather than letting it read location from
  // context) so the exiting page's route content stays frozen mid-animation
  // instead of jumping to whatever the new location resolves to.
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/explore"
          element={
            <RequireAuth>
              <Explore />
            </RequireAuth>
          }
        />
        <Route
          path="/explore/:cca2"
          element={
            <RequireAuth>
              <CountryDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/trips"
          element={
            <RequireAuth>
              <MyTrips />
            </RequireAuth>
          }
        />
        <Route
          path="/trips/new"
          element={
            <RequireAuth>
              <CreateEditTrip />
            </RequireAuth>
          }
        />
        <Route
          path="/trips/:id/edit"
          element={
            <RequireAuth>
              <CreateEditTrip />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavigationDirectionProvider>
          <AnimatedRoutes />
        </NavigationDirectionProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
