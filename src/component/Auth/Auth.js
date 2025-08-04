import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { useEffect } from 'react';
import { getRequest, postRequest, putRequest, deleteRequest } from './network';  // Import the getRequest and postRequest functions

export const refreshAccessToken = async () => {
    try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        console.log('Retrieved Refresh Token:', refreshToken);

        if (!refreshToken) {
            console.error('No refresh token available');
            throw new Error('No refresh token available');
        }

        console.log('Sending request to refresh access token');
        const responseText = await postRequest(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken
        });

        const response = JSON.parse(responseText);
        console.log('Received response from token refresh endpoint:', response);

        const { access } = response;

        if (!access) {
            throw new Error('Access token missing in response');
        }

        console.log('New Access Token:', access);

        // Store the new access token
        await AsyncStorage.setItem('accessToken', access);

        return access;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null;
    }
};


export const makeAuthenticatedRequest = async (url, method = 'get', data = {}, header = false) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
        throw new Error('No access token available');
    }

    let headers;
    if (header) {
        headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
        };
    }
    else {
        headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
    }
    

    if (method.toLowerCase() === 'get') {
        const queryString = Object.keys(data).length ? `?${new URLSearchParams(data).toString()}` : '';
        return getRequest(`${API_BASE_URL}${url}${queryString}`, headers);
    } else if (method.toLowerCase() === 'post') {
        return postRequest(`${API_BASE_URL}${url}`, data, headers);
    } else if (method.toLowerCase() === 'put') {
        return putRequest(`${API_BASE_URL}${url}`, data, headers);
    } else if (method.toLowerCase() === 'delete') {
        return deleteRequest(`${API_BASE_URL}${url}`, data, headers);
    } else {
        throw new Error(`Unsupported request method: ${method}`);
    }
};