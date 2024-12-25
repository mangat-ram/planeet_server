import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Define the base URL for the API
const BASE_URL = process.env.API_URI;

// Function to handle GET requests
export const getRequest = async (endpoint: string): Promise<AxiosResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    return response;
  } catch (error) {
    throw new Error(`GET request failed: ${error}`);
  }
};

// Function to handle POST requests
export const postRequest = async (endpoint: string, data: any): Promise<AxiosResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data);
    return response;
  } catch (error) {
    throw new Error(`POST request failed: ${error}`);
  }
};

// Function to handle PUT requests
export const putRequest = async (endpoint: string, data: any): Promise<AxiosResponse> => {
  try {
    const response = await axios.put(`${BASE_URL}${endpoint}`, data);
    return response;
  } catch (error) {
    throw new Error(`PUT request failed: ${error}`);
  }
};

// Function to handle DELETE requests
export const deleteRequest = async (endpoint: string): Promise<AxiosResponse> => {
  try {
    const response = await axios.delete(`${BASE_URL}${endpoint}`);
    return response;
  } catch (error) {
    throw new Error(`DELETE request failed: ${error}`);
  }
};