import React, { useState, useEffect } from 'react';
import LoginForm from './features/auth/LoginForm';
import DashboardView from './features/dashboard/DashboardView';
import { loginUser } from './lib/api';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <DashboardView user={user} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;