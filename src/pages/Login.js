import React from "react";
import logo from "../assets/logo_horizontal.png";
import login from "../assets/lottieanimations/login.lottie";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "./Login.css";

const LoginPage = () => {
    return (
        <div className="split-container">
            <div className="login-container"> {/*Left side - Login form */}
                <div style={{width: "100%"}}>
                <img src={logo} alt="Logo" className="logo-login"/>
                    <div className="login-header">
                        <h1 className="login-title">Login</h1>
                    </div>
                    <form className="login-form">
                        <div className="input-group">
                            <p className="username-text">Username</p>
                            <input type="username" placeholder="Username" required />
                        </div>
                        <div className="input-group">
                            <p className="password-text">Password</p>
                            <input type="password" placeholder="Password" required />
                        </div>
                        <div className="login-options">
                            <p className="not-user">Not a User? Sign In Here</p>
                        </div>
                        <button type="submit" className="login-btn">Login</button>
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