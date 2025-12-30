import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper to get auth headers via Supabase Client (Reliable)
const getHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // System
  getSystemStatus: async () => {
    const res = await fetch(`${API_URL}/system/status`);
    return res.json();
  },

  // Sensors
  getLatestSensors: async () => {
    const res = await fetch(`${API_URL}/sensors/latest`);
    return res.json();
  },

  getSensorHistory: async (from, to) => {
    const query = new URLSearchParams({ from, to }).toString();
    const res = await fetch(`${API_URL}/sensors/history?${query}`);
    return res.json();
  },

  // Control
  togglePump: async (state) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/control/pump`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ state: state ? 'ON' : 'OFF' }),
    });
    if (res.status === 403) throw new Error('Unauthorized');
    if (res.status === 401) throw new Error('Session Expired');
    return res.json();
  },

  triggerFeed: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/control/feed`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ action: 'FEED' }),
    });
    if (res.status === 403) throw new Error('Unauthorized');
    if (res.status === 401) throw new Error('Session Expired');
    return res.json();
  },

  setBrightness: async (value) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/control/brightness`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ value: parseInt(value, 10) }),
    });
    if (res.status === 403) throw new Error('Unauthorized');
    if (res.status === 401) throw new Error('Session Expired');
    return res.json();
  },

  updateFeedingSettings: async (settings) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/control/feeding-settings`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(settings),
    });
    if (res.status === 403) throw new Error('Unauthorized');
    if (res.status === 401) throw new Error('Session Expired');
    return res.json();
  },
};
