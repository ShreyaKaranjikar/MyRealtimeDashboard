import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
let ws = null;
let messageHandlers = new Set();

export const api = {
  // Authentication
  async loginUser(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // File upload function
  async uploadCSV(file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // You can use this to update upload progress
          console.log(percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  },

  // WebSocket connection management
  connectWebSocket(token) {
    if (ws) return;

    ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send authentication immediately after connection
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      ws = null;
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(token), 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  },

  // Subscribe to WebSocket messages
  subscribeToUpdates(handler) {
    messageHandlers.add(handler);
    return () => messageHandlers.delete(handler);
  },

  // Disconnect WebSocket
  disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    messageHandlers.clear();
  }
};

export const { loginUser } = api;