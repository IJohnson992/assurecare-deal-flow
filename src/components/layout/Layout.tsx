
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { currentUser, isLoading } = useAuth();
  
  // If authentication is required and user is not logged in
  if (requireAuth && !isLoading && !currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If we're still loading auth state, show a loading indicator
  if (requireAuth && isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {currentUser && <Sidebar />}
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {currentUser && <TopBar />}
        
        <main className="flex-1 overflow-y-auto bg-background p-4">
          <div className="container mx-auto px-4 py-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
