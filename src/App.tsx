import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import DailySchedule from './pages/DailySchedule';
import DailyStatus from './pages/DailyStatus';
import Registers from './pages/Registers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Force all pages to start with current date
const getCurrentDate = () => new Date();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/import" element={<Import />} />
              <Route path="/daily-schedule" element={<DailySchedule />} />
              <Route path="/daily-status" element={<DailyStatus />} />
              <Route path="/registers" element={<Registers />} />
            </Routes>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#2d2d2d',
                color: '#fff',
                border: '1px solid #ff6b35',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;