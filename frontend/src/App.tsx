import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { StartInterviewPage } from './pages/StartInterviewPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { ProfilePage } from './pages/ProfilePage';

const NotFound: React.FC = () => (
  <div style={{
    paddingTop: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
  }}>
    <div>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>404</div>
      <h2 style={{ color: '#F5F3FF', marginBottom: '8px' }}>Page not found</h2>
      <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        
        {/* Setup Interview Routes */}
        <Route path="/start" element={<StartInterviewPage />} />
        <Route path="/interview" element={<StartInterviewPage />} />
        <Route path="/interview/start" element={<StartInterviewPage />} />
        
        {/* Live Interview Room Routes */}
        <Route path="/live" element={<LiveInterviewPage />} />
        <Route path="/interview/live" element={<LiveInterviewPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
