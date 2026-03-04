import axios  from "axios";
const API_URL = "https://localhost:7124/api/Auth/";

const login = async(email, passwordHash)=>{
    const response = await axios.post(API_URL + "login", {
        email,
        passwordHash
    });
    return response.data;
}

const register = async(name, email, passwordHash)=>{
    const response = await axios.post(API_URL + "register", {
        name,
        email,
        passwordHash
    });
    return response.data;
}

export default {
    login,
    register
};