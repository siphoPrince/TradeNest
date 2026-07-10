import api from "./api"; 

const login = async (email, password) => {
    // FIX: Map 'password' to 'passwordHash' to match 'request.PasswordHash' in C# LoginDto
    const response = await api.post("/api/Auth/login", {
        email: email,
        passwordHash: password 
    });
    return response.data;
};

const register = async (username, email, password) => {
    // FIX: Map 'username' to 'name' to match 'request.Name' in C# UserRegisterDto
    const response = await api.post("/api/Auth/register", {
        name: username, 
        email: email,
        password: password
    });
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await api.post("/api/Auth/forgot-password", { email });
    return response.data;
};

const resetPassword = async (resetData) => {
    const response = await api.post("/api/Auth/reset-password", resetData);
    return response.data;
};

const googleLogin = async (idToken) => {
    // Pass idToken directly as a raw string literal value. 
    // Axios will automatically wrap it cleanly in quotes for ASP.NET Core [FromBody] binding.
    const response = await api.post("/api/Auth/google-login", idToken, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};


export default {
    login,
    register,
    googleLogin,
    forgotPassword,
    resetPassword
};
