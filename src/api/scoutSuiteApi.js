// src/api/scoutSuiteApi.js
// import { API_BASE_URL } from './config'; // Assuming you have a config file, or use import.meta.env

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Trigger a new Cloud Security Scan (Admin Only)
export const triggerCloudScan = async (scanConfig) => {
  const response = await fetch(`${API_URL}/cloud/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scanConfig),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Cloud scan failed to start');
  }
  return data;
};

// Fetch Cloud Findings with optional filters
export const getCloudFindings = async (filters = {}) => {
  // Convert filters object to query string
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await fetch(`${API_URL}/cloud/findings?${queryParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch cloud findings');
  return response.json();
};