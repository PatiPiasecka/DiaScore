import { useState, useEffect } from 'react';
import { getOrCreateUserId } from '../utils/user';
import { getOrCreateUserId } from '../utils/user';

export const useHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete a prediction by id and return success status + message
  const deletePrediction = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error('VITE_API_URL is not defined in the environment variables.');

      const response = await fetch(`${apiUrl}/predictions/${id}`, {
        method: 'DELETE',
      });

      const contentType = response.headers.get('content-type') || '';
      let responseData = null;
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok && response.status !== 204) {
        const msg = responseData?.detail || responseData || 'Failed to delete prediction';
        console.error(`[Delete Error] ${response.status} ${response.statusText}: ${msg}`);
        return { success: false, message: `${response.status} ${response.statusText}: ${msg}` };
      }

      setPredictions((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting prediction:', err);
      return { success: false, message: err.message || 'Failed to delete prediction' };
    }
  };

  // Delete all predictions and return success status + message
  const deleteAllPredictions = async () => {
    try {
      const userId = getOrCreateUserId();
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) throw new Error('VITE_API_URL is not defined in the environment variables.');

      const response = await fetch(`${apiUrl}/predictions/user/${userId}`, {
        method: 'DELETE',
      });

      const contentType = response.headers.get('content-type') || '';
      let responseData = null;
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok && response.status !== 204) {
        const msg = responseData?.detail || responseData || 'Failed to delete all predictions';
        console.error(`[Delete All Error] ${response.status} ${response.statusText}: ${msg}`);
        return { success: false, message: `${response.status} ${response.statusText}: ${msg}` };
      }

      setPredictions([]);
      return { success: true };
    } catch (err) {
      console.error('Error deleting all predictions:', err);
      return { success: false, message: err.message || 'Failed to delete all predictions' };
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getOrCreateUserId();
        const apiUrl = import.meta.env.VITE_API_URL;
        
        if (!apiUrl) {
          throw new Error('VITE_API_URL is not defined in the environment variables.');
        }

        const response = await fetch(`${apiUrl}/predictions/?user_id=${userId}`);

        const contentType = response.headers.get('content-type') || '';
        let responseData = null;
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        if (!response.ok) {
          const msg = responseData?.detail || responseData || 'Failed to fetch prediction history';
          console.error(`[Fetch Error] ${response.status} ${response.statusText}: ${msg}`);
          setError(msg);
          return;
        }

        setPredictions(responseData);
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
