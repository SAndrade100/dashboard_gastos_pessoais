// Mock users 
const USERS = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'admin123' },
  { id: 2, name: 'Test User', email: 'user@example.com', password: 'user123' }
];

// Store auth token in localStorage
const TOKEN_KEY = 'dashboard_auth_token';
const USER_KEY = 'dashboard_user';

export const loginUser = async (email, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (!user) {
    throw new Error('Credenciais inválidas');
  }
  
  // Create a user object without the password
  const userInfo = { id: user.id, name: user.name, email: user.email };
  
  // Create a mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  
  // Store in localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
  
  return userInfo;
};

export const logoutUser = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  return true;
};

export const checkAuthStatus = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const token = localStorage.getItem(TOKEN_KEY);
  const userString = localStorage.getItem(USER_KEY);
  
  if (!token || !userString) {
    return null;
  }
  
  try {
    return JSON.parse(userString);
  } catch (e) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
