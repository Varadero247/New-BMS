import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from './stores/auth';

// Screens
import LoginScreen from './screens/Login';
import DashboardScreen from './screens/Dashboard';
import BuildingsScreen from './screens/Buildings';
import DevicesScreen from './screens/Devices';
import AlertsScreen from './screens/Alerts';
import ProfileScreen from './screens/Profile';
import TabBar from './components/TabBar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-20">{children}</main>
      <TabBar />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#2563eb' });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <DashboardScreen />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings"
          element={
            <PrivateRoute>
              <AppLayout>
                <BuildingsScreen />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <PrivateRoute>
              <AppLayout>
                <DevicesScreen />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <PrivateRoute>
              <AppLayout>
                <AlertsScreen />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <ProfileScreen />
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
