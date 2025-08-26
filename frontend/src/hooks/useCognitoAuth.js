import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';

export const useCognitoAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (username, email, password) => {
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email
        }
      });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getAccessToken = async () => {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch (error) {
      return null;
    }
  };

  const refreshToken = async () => {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch (error) {
      return null;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    getAccessToken,
    refreshToken,
    checkAuthState
  };
};




