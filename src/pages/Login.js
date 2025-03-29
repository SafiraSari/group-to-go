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
                    <div className="login-header">
                        <img src={logo} alt="Logo" className="logo" />
                        <h1 className="login-title">Login</h1>
                    </div>
                    <form className="login-form">
                        <div className="input-group">
                            <input type="email" placeholder="Email" required />
                        </div>
                        <div className="input-group">
                            <input type="password" placeholder="Password" required />
                        </div>
                        <div className="login-options">
                            <a href="#" className="not-user">Not a User? Sign In Here</a>
                        </div>
                        <button type="submit" className="login-btn">Login</button>
                    </form>
                </div>
            </div>
            <div className="gradient-side"> {/* Right side - Gradient background */}
                {/* <DotLottieReact
                    src={login}
                    autoplay
                    loop /> */}
            </div>
        </div>
    );
};

export default LoginPage;