import { useContext } from 'react';
import { AppContext } from '@/lib/context';

export const useAuth = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};

export const useIsAuthenticated = () => {
  const { user } = useAuth();
  return user !== null;
};
