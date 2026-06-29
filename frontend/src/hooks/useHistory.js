import { useState, useEffect } from 'react';
import { getOrCreateUserId } from '../utils/user'; 

export const useHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete a prediction by id and update local state
  const deletePrediction = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error('VITE_API_URL is not defined in the environment variables.');

      const response = await fetch(`${apiUrl}/predictions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete prediction');
      }

      setPredictions((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting prediction:', err);
      return false;
    }
  };

  // Delete all predictions for the current user and clear local state
  const deleteAllPredictions = async () => {
    try {
      const userId = getOrCreateUserId();
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) throw new Error('VITE_API_URL is not defined in the environment variables.');

      const response = await fetch(`${apiUrl}/predictions/user/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete all predictions');
      }

      setPredictions([]);
      return true;
    } catch (err) {
      console.error('Error deleting all predictions:', err);
      return false;
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getOrCreateUserId();
        
        // Fetch the API URL from Vite environment variables (.env file)
        const apiUrl = import.meta.env.VITE_API_URL;
        
        if (!apiUrl) {
          throw new Error('VITE_API_URL is not defined in the environment variables.');
        }

        // Fetch prediction history for the specific user
        const response = await fetch(`${apiUrl}/predictions/?user_id=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prediction history');
        }
        
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return { predictions, loading, error, deletePrediction, deleteAllPredictions };
};