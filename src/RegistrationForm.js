import React from "react";
// import axios from "axios";
import axios from "./axios";
import { Link } from "react-router-dom";
import { FormErrors } from "./FormErrors";

export default class UsersForm extends React.Component {
    constructor() {
        super();
        this.state = {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            formErrors: {
                email: "",
                password: ""
            },
            emailValid: false,
            passwordValid: false,
            formValid: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(
            {
                [name]: value
            },
            res => {
                this.fieldsNotEmpty(name, value);
            }
        );
    }
    fieldsNotEmpty(name, value) {
        console.log("Validating fields", name, value);
        let formValidation = this.state.formErrors;
        let emailValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;

        switch (name) {
            case "firstname":
                var valid = value.length >= 1;
                formValidation.firstname = valid ? "" : "no name?"; //FIXME still smth wrong
                break;
            case "lastname":
                valid = value.length >= 1;
                formValidation.lastname = valid ? "" : "no surname?"; //FIXME still smth wrong
                break;
            case "email":
                emailValid = value.match(
                    /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i
                );
                formValidation.email = emailValid ? "" : " invalid email";
                break;
            case "password":
                passwordValid = value.length >= 6;
                formValidation.password = passwordValid ? "" : "is too short";
                break;
            default:
                break;
        }
        this.setState(
            {
                formErrors: formValidation,
                emailValid: emailValid,
                passwordValid: passwordValid
            },
            this.validateForm
        );
    }

    validateForm() {
        this.setState({
            formValid: this.state.emailValid && this.state.passwordValid
        });
    }

    submitRegistration() {
        axios
            .post("/register", this.state)
            .then(results => {
                console.log("Posting axios data", results.data);
                if (results.data.success) {
                    location.replace("/");
                } else {
                    this.setState({
                        errorMsg: results.data.errorMsg
                    });
                    console.log("Got error, ", results.data.errorMsg);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const firstname = this.state.firstname;
        const lastname = this.state.lastname;
        const email = this.state.email;
        const password = this.state.password;
        const msg = this.state.errorMsg;
        return (
            <div className="registration-form">
                {msg ? <p className="error">{msg}</p> : null}
                {!this.state.formValid && (
                    <FormErrors formErrors={this.state.formErrors} />
                )}
                <form>
                    <input
                        onChange={this.handleChange}
                        name="firstname"
                        type="text"
                        placeholder="First Name"
                    />
                    <input
                        onChange={this.handleChange}
                        name="lastname"
                        type="text"
                        placeholder="Last Name"
                    />
                    <input
                        onChange={this.handleChange}
                        name="email"
                        type="email"
                        placeholder="Email"
                    />
                    <input
                        onChange={this.handleChange}
                        name="password"
                        type="password"
                        placeholder="Password"
                    />
                    <button
                        type="submit"
                        className="btn btn-register"
                        disabled={!this.state.formValid}
                        onClick={e => {
                            e.preventDefault();
                            this.submitRegistration();
                        }}
                    >
                        {" "}
                        Register
                    </button>
                    <p>
                        Already registered? <Link to="/login">Log in!</Link>
                    </p>
                </form>
            </div>
        );
    }
}
