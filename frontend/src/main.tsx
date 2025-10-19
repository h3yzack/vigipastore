import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router';
import HomePage from './pages/home.tsx';
import AboutPage from './pages/about.tsx';
import LoginPage from './pages/login.tsx';
import RegisterPage from './pages/register.tsx';
import App from './App.tsx';
import SettingPage from './pages/setting.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "setting",
        element: <SettingPage />,
      },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
