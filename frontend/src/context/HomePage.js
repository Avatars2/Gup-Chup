import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await axios.post("/api/user/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      alert("Error Logging in");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">WhatsApp Clone</h1>
        <input className="w-full p-2 mb-2 border rounded" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full p-2 mb-4 border rounded" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-green-500 text-white p-2 rounded">Login</button>
      </div>
    </div>
  );
};

export default HomePage;