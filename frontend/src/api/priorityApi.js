// frontend/src/api/priorityApi.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/predict-priority';

export const getTaskPriority = async(taskData) => {
    try {
        const response = await axios.post(API_URL, taskData);
        return response.data;
    } catch (error) {
        console.error('Error fetching priority:', error);
        throw error;
    }
};