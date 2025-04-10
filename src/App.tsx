import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/Login';
import Register from './components/Register';

// Lazy load components
const TraineeDashboard = React.lazy(() =>
  import('./components/dashboard/trainee/TraineeDashboard')
);
const TrainingPlanPage = React.lazy(() =>
  import('./components/dashboard/trainee/TrainingPlanPage')
);
const TrainingPlanDetailsPage = React.lazy(() =>
  import('./components/dashboard/trainee/TrainingPlanDetailsPage')
);
const PlaybackPage = React.lazy(() =>
  import('./components/dashboard/trainee/PlaybackPage')
);
const PlaybackDetailPage = React.lazy(() =>
  import('./components/dashboard/trainee/playback/PlaybackDetailPage')
);
const ManageSimulationsPage = React.lazy(() =>
  import('./components/dashboard/trainee/manage/ManageSimulationsPage')
);
const GenerateScript = React.lazy(() =>
  import('./components/dashboard/trainee/manage/generate/GenerateScript')
);
const SimulationAttemptPage = React.lazy(() =>
  import('./components/dashboard/trainee/SimulationAttemptPage')
);
const ManageTrainingPlanPage = React.lazy(() =>
  import('./components/dashboard/trainee/manage/ManageTrainingPlanPage')
);
const AssignSimulationsPage = React.lazy(() =>
  import('./components/dashboard/trainee/AssignSimulationsPage')
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
  
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
  
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute path="/dashboard">
                      
                        <TraineeDashboard />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/training"
                  element={
                    <ProtectedRoute path="/training">
                      
                        <TrainingPlanPage />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/training/:id"
                  element={
                    <ProtectedRoute path="/training">
                      
                        <TrainingPlanDetailsPage />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/playback"
                  element={
                    <ProtectedRoute path="/playback">
                      
                        <PlaybackPage />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/playback/:id"
                  element={
                    <ProtectedRoute path="/playback">
                      
                        <PlaybackDetailPage />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-simulations"
                  element={
                    <ProtectedRoute path="/manage-simulations">
                      
                        <ManageSimulationsPage />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate-scripts"
                  element={
                    <ProtectedRoute path="/manage-simulations">
                      
                        <GenerateScript />
                      
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate-scripts/:id"
                  element={
                    <ProtectedRoute path="/manage-simulations">
                      <GenerateScript />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/simulation/:id/attempt" 
                  element={
                    <ProtectedRoute path="/training">
                      
                        <SimulationAttemptPage />
                      
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manage-training-plan" 
                  element={
                    <ProtectedRoute path="/manage-training-plan">
                      
                        <ManageTrainingPlanPage />
                      
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/assign-simulations"
                  element={
                    <ProtectedRoute path="/assign-simulations">
                      
                        <AssignSimulationsPage />
                      
                    </ProtectedRoute>
                  }
                />
  
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>        
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;