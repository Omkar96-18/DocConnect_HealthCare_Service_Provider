import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMessages from './pages/patient/PatientMessages';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Assistant Pages
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import AssistantApprovals from './pages/assistant/AssistantApprovals';
import AssistantPrescriptions from './pages/assistant/AssistantPrescriptions';
import AssistantProfile from './pages/assistant/AssistantProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MedicalCenters from './pages/admin/MedicalCenters';
import UserManagement from './pages/admin/UserManagement';

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Central Role Dispatcher */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <PrivateRoute>
                <RoleRoute roles={['patient']}>
                  <AppLayout><PatientDashboard /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/find-doctors"
            element={
              <PrivateRoute>
                <RoleRoute roles={['patient']}>
                  <AppLayout><FindDoctors /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <PrivateRoute>
                <RoleRoute roles={['patient']}>
                  <AppLayout><PatientAppointments /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/messages"
            element={
              <PrivateRoute>
                <RoleRoute roles={['patient']}>
                  <AppLayout><PatientMessages /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <PrivateRoute>
                <RoleRoute roles={['patient']}>
                  <AppLayout><PatientPrescriptions /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <PrivateRoute>
                <RoleRoute roles={['patient']}>
                  <AppLayout><PatientProfile /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <PrivateRoute>
                <RoleRoute roles={['doctor']}>
                  <AppLayout><DoctorDashboard /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <PrivateRoute>
                <RoleRoute roles={['doctor']}>
                  <AppLayout><DoctorAppointments /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <PrivateRoute>
                <RoleRoute roles={['doctor']}>
                  <AppLayout><DoctorPatients /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/messages"
            element={
              <PrivateRoute>
                <RoleRoute roles={['doctor']}>
                  <AppLayout><DoctorMessages /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <PrivateRoute>
                <RoleRoute roles={['doctor']}>
                  <AppLayout><DoctorPrescriptions /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <PrivateRoute>
                <RoleRoute roles={['doctor']}>
                  <AppLayout><DoctorProfile /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Assistant Routes */}
          <Route
            path="/assistant/dashboard"
            element={
              <PrivateRoute>
                <RoleRoute roles={['assistant']}>
                  <AppLayout><AssistantDashboard /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/assistant/approvals"
            element={
              <PrivateRoute>
                <RoleRoute roles={['assistant']}>
                  <AppLayout><AssistantApprovals /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/assistant/prescriptions"
            element={
              <PrivateRoute>
                <RoleRoute roles={['assistant']}>
                  <AppLayout><AssistantPrescriptions /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/assistant/profile"
            element={
              <PrivateRoute>
                <RoleRoute roles={['assistant']}>
                  <AppLayout><AssistantProfile /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <RoleRoute roles={['admin']}>
                  <AppLayout><AdminDashboard /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/medical-centers"
            element={
              <PrivateRoute>
                <RoleRoute roles={['admin']}>
                  <AppLayout><MedicalCenters /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <RoleRoute roles={['admin']}>
                  <AppLayout><UserManagement /></AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Fallback & Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}