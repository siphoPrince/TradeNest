import axios  from "axios";
const API_URL = "http://localhost:8080/api/auth/";

const login = async(username, password)=>{
    const response = await axios.post(API_URL + "/signin", {
        username,
        password
    });
    return response.data;
}

const register = async(username, email, password)=>{
    const response = await axios.post(API_URL + "/signup", {
        username,
        email,
        password
    });
    return response.data;
}

export default {
    login,
    register
};