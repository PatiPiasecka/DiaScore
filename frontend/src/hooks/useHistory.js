import { useState, useEffect } from 'react';
import { getOrCreateUserId } from '../utils/user';

export const useHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getOrCreateUserId();

        // Fetch the API URL from Vite environment variables (.env file)
        const apiUrl = import.meta.env.VITE_API_URL ?? '';

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

  return { predictions, loading, error };
};
