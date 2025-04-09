import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from "../assets/logo_horizontal.png";
import signup from "../assets/animations/signup.lottie";
import Button from "../components/Button";
import Input from "../components/Input";
import Confirmation from "../components/Confirmation";
import "./Signup.css";

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    }

    const confirmSignUp = async () => {
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
                setError(data.error || 'Sign Up failed');
                console.error('Error:', data.error || 'Sign Up failed');
                return;
            }
            else {
                console.log('Sign Up successful. You may now register!');
                navigate('/login');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error connecting to server');
        } finally {
            setShowConfirmation(false);
        }
    }

    return (
        <div className="split-container">
            <div className="signup-container">
                <div style={{ width: "100%" }}>
                    <img src={logo} alt="Logo" className="logo-login" />
                    <div className="signup-header">
                        <h1 className="signup-title">Sign Up</h1>
                    </div>
                    <form className="signup-form" onSubmit={handleSignUp}>
                        <Input label="Username" type="text" placeholder="Username" isRequired value={username} onChange={(e) => setUsername(e.target.value)} />
                        <Input label="Password" type="password" placeholder="Password" isRequired value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className="signup-options">
                            <Link to="/login" className="not-user">Already a User? Log In Here</Link>
                        </div>
                        <Button type="submit" label="Sign Up" />
                        {error && <p id="error">{error}</p>}
                    </form>
                </div>
            </div>
            <div className="gradient-side">
                <DotLottieReact
                    src={signup}
                    className="signup-animation"
                    loop
                    autoplay
                />
            </div>

            {/* popup for user to confirm they want to signup */}
            {showConfirmation && (
                <Confirmation label="create an account" onCancel={() => setShowConfirmation(false)} onConfirm={confirmSignUp}/>
            )}
        </div>
    );
};

export default SignupPage;