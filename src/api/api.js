// src/api/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const createMondayTask = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/createMondayTask`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
