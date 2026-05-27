import { useState, useCallback } from 'react';
import { leaveService } from '../services/leaveService';

/**
 * Custom hook for managing leave applications.
 * Skill: Transactional Workflow
 */
export const useLeave = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaveService.getAll();
      setLeaves(data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch leave history');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitLeave = async (leaveData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await leaveService.create(leaveData);
      setLeaves((prev) => [response.data, ...prev]);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to submit leave application');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    leaves,
    loading,
    error,
    fetchLeaves,
    submitLeave,
  };
};
