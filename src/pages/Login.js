import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo_horizontal.png";
import login from "../assets/animations/login.lottie";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "./Login.css";
import Button from "../components/Button";
import Input from "../components/Input";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, SetError] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch('http://localhost:3500/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if(!response.ok) {
                console.log('Login failed');
                if(response.status === 401){
                    SetError('Incorrect username or password');
                }
                if(response.status === 400){
                    SetError('Username and password are required');
                }
                if(response.status === 404){
                    SetError('User not found. Please enter another username or signup!');
                }
            }
            if(response.ok){ 
                console.log('Login successful');
                navigate('/');
            }
                     
        }catch(error){
            SetError('Error connecting to server')
        }

    }
    return (
        <div className="split-container">
            <div className="login-container"> {/*Left side - Login form */}
                <div style={{width: "100%"}}>
                    <img src={logo} alt="Logo" className="logo-login"/>
                    <div className="login-header">
                        <h1 className="login-title">Login</h1>
                    </div>
                    <form className="login-form" onSubmit={handleLogin}>
                        <Input label="Username" type="username" placeholder="Username" isRequired value={username} onChange={(e) => setUsername(e.target.value)}/>
                        <Input label="Password" type="password" placeholder="Password" isRequired value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className="login-options">
                            <Link to="/signup" className="not-user">Not a user? Create an account</Link> {/* Sign Up will be changed to a link that will redirect the user to the signup page */}
                        </div>
                        <Button type="submit" label="Login"/>
                        {error && <p id="error">{error}</p>}
                    </form>
                </div>
            </div>
            <div className="gradient-side"> {/* Right side - Gradient background */}
                <DotLottieReact 
                    src={login}
                    className="login-animation"
                    loop
                    autoplay 
                />
            </div>
        </div>
    );
};

export default LoginPage;
