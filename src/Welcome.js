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
                    <div id="welcome-logo">
                        <h1 id="berlin">BERL</h1>
                        <h1 id="berlin-hang">ista</h1>
                    </div>

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
