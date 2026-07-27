import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext.jsx';
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
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:cca2" element={<CountryDetail />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/trips/new" element={<CreateEditTrip />} />
          <Route path="/trips/:id/edit" element={<CreateEditTrip />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
