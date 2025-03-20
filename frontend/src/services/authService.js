import api from './api';

export const authService = {
    login: async (userType, credentials) => {
        try {
            console.log(`Attempting to login as ${userType}...`);
            const response = await api.post(`/${userType}/login`, credentials);
            console.log('Login successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response) {
                throw error.response.data;
            } else if (error.request) {
                throw new Error('No response received from server. Please check if the server is running.');
            } else {
                throw new Error(error.message || 'An error occurred during login');
            }
        }
    },

    // Add other auth-related methods here
    logout: async () => {
        try {
            const response = await api.post('/logout');
            return response.data;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error.response?.data || error.message;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get('/me');
            return response.data;
        } catch (error) {
            console.error('Failed to get current user:', error);
            throw error.response?.data || error.message;
        }
    }
}; 