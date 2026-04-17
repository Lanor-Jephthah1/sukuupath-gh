import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashWelcome from './pages/SplashWelcome';
import OnboardingScreens from './pages/OnboardingScreens';
import SignupScreen from './pages/SignupScreen';
import SigninScreen from './pages/SigninScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import ProfileSetupScreen from './pages/ProfileSetupScreen';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import SettingsScreen from './pages/SettingsScreen';
import StudyNotesPage from './pages/StudyNotesPage';
import TranslationWorkspace from './pages/TranslationWorkspace';
import SimplifyEnglishScreen from './pages/SimplifyEnglishScreen';
import SummarizerPage from './pages/SummarizerPage';
import AIChatPage from './pages/AIChatPage';
import DocumentWorkspacePage from './pages/DocumentWorkspacePage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import LibraryPage from './pages/LibraryPage';
import AdminDashboard from './pages/AdminDashboard';
import AuditDashboard from './pages/AuditDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { applyTheme, getStoredTheme } from './utils/theme';

applyTheme(getStoredTheme());

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SplashWelcome />} />
        <Route path="/onboarding" element={<OnboardingScreens />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/login" element={<SigninScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/profile-setup" element={<ProfileSetupScreen />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/translation" element={<TranslationWorkspace />} />
          <Route path="/simplify" element={<SimplifyEnglishScreen />} />
          <Route path="/summaries" element={<SummarizerPage />} />
          <Route path="/ai-chat" element={<AIChatPage />} />
          <Route path="/documents" element={<DocumentWorkspacePage />} />
          <Route path="/quiz" element={<QuizGeneratorPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/notes" element={<StudyNotesPage />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/audit" element={<AuditDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
