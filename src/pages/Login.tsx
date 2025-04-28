
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Layout from '@/components/layout/Layout';

const Login = () => {
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Set title for the page
    document.title = 'AssureCare CRM - Login';
  }, []);

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout requireAuth={false}>
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">AssureCare CRM</h1>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your deals and manage the full sales lifecycle
            </p>
          </div>

          <div className="mt-8 bg-white p-6 shadow sm:rounded-lg">
            <LoginForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
