export const getOrCreateUserId = () => {
  const STORAGE_KEY = 'diascore_user_id';

  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
};