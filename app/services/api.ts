// Base API service with common HTTP methods
const API_BASE_URL = 'http://localhost:3000/api';

// Generic error handler
const handleError = (error: any) => {
  console.error('API Error:', error);
  throw error;
};

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    return handleError(error);
  }
}

export const apiService = {
  get: <T>(endpoint: string) => fetchAPI<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, body: any) => 
    fetchAPI<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  put: <T>(endpoint: string, body: any) => 
    fetchAPI<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  
  delete: <T>(endpoint: string) => 
    fetchAPI<T>(endpoint, { method: 'DELETE' }),
};