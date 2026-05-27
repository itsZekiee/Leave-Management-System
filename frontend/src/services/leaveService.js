const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Service for Leave Management API calls.
 * Communicates with the Laravel backend.
 */
export const leaveService = {
  /**
   * Get all leave applications for the current user.
   */
  async getAll() {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_URL}/leaves`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch leaves');
    }

    return response.json();
  },

  /**
   * Create a new leave application.
   */
  async create(data) {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_URL}/leaves`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create leave');
    }

    return response.json();
  },
};

/**
 * Helper to get the current Firebase Auth ID Token.
 * (Simulation of Firebase Auth integration)
 */
async function getFirebaseToken() {
  // In a real app: return auth.currentUser.getIdToken();
  return localStorage.getItem('firebase_token');
}
