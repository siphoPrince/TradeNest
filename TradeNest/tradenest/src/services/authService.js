import axios  from "axios";
const API_URL = "https://localhost:7124/api/Auth/";

const login = async(email, passwordHash)=>{
    const response = await axios.post(API_URL + "login", {
        email,
        passwordHash
    });
    return response.data;
}

const forgotPassword = async (email) => {
    const response = await axios.post(API_URL + "forgot-password", { email });
    return response.data;
};

const register = async(name, email, passwordHash)=>{
    const response = await axios.post(API_URL + "register", {
        name,
        email,
        passwordHash
    });
    return response.data;
}

const resetPassword = async (token, newPassword) => {
    const response = await axios.post(API_URL + "reset-password", {
        token,
        newPassword
    });
    return response.data;
};

const googleLogin = async (idToken) => {
    const response = await axios.post(API_URL + "google-login", JSON.stringify(idToken), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export default {
    login,
    register,
    googleLogin,
    forgotPassword,
    resetPassword
};