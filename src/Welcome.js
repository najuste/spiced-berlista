import React from "react";
import { HashRouter, Route } from "react-router-dom";

//these go as props in the hashRouter
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";

export default class Welcome extends React.Component {
    render() {
        return (
            <div id="welcome-wrapper">
                <div id="welcome">
                    <h1>Welcome to</h1>
                    <h1 id="berlin">BERL'</h1>
                    <HashRouter>
                        <div id="form">
                            <Route
                                exact
                                path="/"
                                component={RegistrationForm}
                            />
                            <Route path="/login" component={LoginForm} />
                        </div>
                    </HashRouter>
                </div>
            </div>
        );
    }
}
