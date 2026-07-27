import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext.jsx';
import RequireAuth from './components/RequireAuth.jsx';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
