import axios from "axios";

const baseUrl = `${import.meta.env.VITE_APP_API_URL}`;

const http = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-type": "application/json"
    }
});

export { http }