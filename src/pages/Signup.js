import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/logo_horizontal.png";
import signup from "../assets/lottieanimations/signup.lottie";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "./Signup.css";
import Button from "../components/Button";
import Input from "../components/Input";

const SignupPage = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, SetError] = useState('');
    const navigate = useNavigate();
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3500/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                SetError(data.error || 'Sign Up failed');
                console.error('Error:', data.error || 'Sign Up failed');
                return;
            }
            else {
                console.log('Sign Up successful. You may now register!');
                navigate('/login');
            }
        } catch (error) {
            console.error('Error:', error);
            SetError('Error connecting to server');
        }

    }
    return (
        <div className="split-container">
            <div className="signup-container"> {/*Left side - Login form */}
                <div style={{ width: "100%" }}>
                    <img src={logo} alt="Logo" className="logo-login" />
                    <div className="signup-header">
                        <h1 className="signup-title">SignUp</h1>
                    </div>
                    <form className="signup-form" onSubmit={handleSignUp}>
                        <Input label="Username" type="username" placeholder="Username" isRequired value={username} onChange={(e) => setUsername(e.target.value)} />
                        <Input label="Password" type="password" placeholder="Password" isRequired value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className="signup-options">
                            <Link to="/login" className="not-user">Already a User? Log In Here</Link>
                        </div>
                        <Button type="submit" label="Sign Up" />
                        {error && <p id="error">{error}</p>}
                    </form>
                </div>
            </div>
            <div className="gradient-side"> {/* Right side - Gradient background */}
                <DotLottieReact
                    src={signup}
                    className="signup-animation"
                    loop
                    autoplay
                />
            </div>
        </div>
    );
};

export default SignupPage;
