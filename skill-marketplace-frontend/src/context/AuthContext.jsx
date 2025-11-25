import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload.user,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = authAPI.getStoredToken();
        const user = authAPI.getStoredUser();

        if (token && user) {
          // Verify token is still valid
          const isValid = await authAPI.verifyToken();
          
          if (isValid) {
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER,
              payload: {
                user,
                token,
                isAuthenticated: true
              }
            });
          } else {
            // Token is invalid, clear storage
            authAPI.logout();
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER,
              payload: {
                user: null,
                token: null,
                isAuthenticated: false
              }
            });
          }
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: {
              user: null,
              token: null,
              isAuthenticated: false
            }
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: {
            user: null,
            token: null,
            isAuthenticated: false
          }
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await authAPI.login(credentials);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      
      const response = await authAPI.register(userData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: {
          user: response.user
        }
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;