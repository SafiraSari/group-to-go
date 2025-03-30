import React from "react";
import logo from "../assets/logo_horizontal.png";
import login from "../assets/animations/login.lottie";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "./Login.css";
import Button from "../components/Button";
import Input from "../components/Input";

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
                        <Input label="Username" type="username" placeholder="Username" isRequired />
                        <Input label="Password" type="password" placeholder="Password" isRequired />
                        <div className="login-options">
                            <p className="not-user">Not a User? Sign Up Here</p>
                        </div>
                        <Button label="Login"/>
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
