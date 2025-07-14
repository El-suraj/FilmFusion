// frontend/src/axiosConfig.js
import axios from "axios";

// Create a custom Axios instance
const instance = axios.create({
  baseURL: 'https://filmfusionsxyz.netlify.app/', // Use your Vite env variable here
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Attach token to every outgoing request if available
instance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor for handling 401/403 errors globally
// instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//             // Handle unauthorized/forbidden access, e.g., logout user
//             // This might require passing the logout function from AuthContext
//             console.log("Unauthorized or Forbidden access. Consider logging out.");
//             // You would typically dispatch a logout action here if using Redux/Zustand,
//             // or trigger a specific logout handler from AuthContext.
//         }
//         return Promise.reject(error);
//     }
// );

export default instance;
