import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages - Public
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import SearchPage from './pages/public/SearchPage';
import WorkerPublicProfile from './pages/public/WorkerPublicProfile';
import NotFoundPage from './pages/public/NotFoundPage';

// Pages - Protected
import DashboardPage from './pages/protected/DashboardPage';
import ChatPage from './pages/protected/ChatPage';
import CreateJobPage from './pages/protected/CreateJobPage';
import JobDetailPage from './pages/protected/JobDetailPage';
import MyJobsListPage from './pages/protected/MyJobsListPage';
import WorkerRegisterPage from './pages/protected/WorkerRegisterPage';
import AvailableJobsPage from './pages/protected/AvailableJobsPage';
import SendQuotePage from './pages/protected/SendQuotePage';
import MyProfilePage from './pages/protected/MyProfilePage';
import MySentQuotesPage from './pages/protected/MySentQuotesPage';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="register-worker" element={
                <ProtectedRoute>
                  <WorkerRegisterPage />
                </ProtectedRoute>
              } />
              <Route path="search" element={<SearchPage />} />
              <Route path="perfil/:id" element={<WorkerPublicProfile />} />
              
              {/* Rutas protegidas */}
              <Route path="solicitar" element={
                <ProtectedRoute>
                  <CreateJobPage />
                </ProtectedRoute>
              } />
              <Route path="solicitar/:workerId" element={
                <ProtectedRoute>
                  <CreateJobPage />
                </ProtectedRoute>
              } />
              <Route path="mis-solicitudes" element={
                <ProtectedRoute>
                  <MyJobsListPage />
                </ProtectedRoute>
              } />
              <Route path="mis-solicitudes/:jobId" element={
                <ProtectedRoute>
                  <JobDetailPage />
                </ProtectedRoute>
            } />
              <Route path="solicitudes-disponibles" element={
                <ProtectedRoute>
                  <AvailableJobsPage />
                </ProtectedRoute>
              } />
              <Route path="enviar-propuesta/:jobId" element={
                <ProtectedRoute>
                  <SendQuotePage />
                </ProtectedRoute>
              } />
              <Route path="mi-perfil" element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              } />
              <Route path="mis-propuestas" element={
                <ProtectedRoute>
                  <MySentQuotesPage />
                </ProtectedRoute>
              } />
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={["trabajador"]} redirectTo="/">
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="chat/:conversacionId" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </AuthProvider>
        </Router>
    </QueryClientProvider>
  );
}

export default App;
