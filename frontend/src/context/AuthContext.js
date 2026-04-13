import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Axios instance with default config
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  });

  // Add interceptor to automatically add token
  api.interceptors.request.use((config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
      setupSocket(userInfo);
    }
    setLoading(false);
  }, []);

  const setupSocket = (userData) => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    newSocket.emit('setup', userData);
    setSocket(newSocket);
  };

  const login = async (mobile, password) => {
    try {
      const { data } = await api.post('/user/login', { mobile, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setupSocket(data);
      toast.success('Login successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (name, mobile, password, pic) => {
    try {
      const { data } = await api.post('/user/register', { name, mobile, password, pic });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setupSocket(data);
      toast.success('Registration successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    if (user) {
      socket?.emit("logout", user._id);
    }
    localStorage.removeItem('userInfo');
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    loading,
    socket,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
