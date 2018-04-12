import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";
import { FormErrors } from "./FormErrors";

import PlacesAutocomplete from "react-places-autocomplete";

import { geocodeByAddress, getLatLng } from "react-places-autocomplete";

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
        this.handlePlaceChange = this.handlePlaceChange.bind(this);
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
    handlePlaceChange(address) {
        this.setState({ address });
    }

    fieldsNotEmpty(name, value) {
        let formValidation = this.state.formErrors;
        let emailValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;

        switch (name) {
            case "firstname":
                var valid = value.length >= 1;
                formValidation.firstname = valid ? "" : "no name?";
                break;
            case "lastname":
                valid = value.length >= 1;
                formValidation.lastname = valid ? "" : "no surname?";
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
        geocodeByAddress(this.state.address)
            .then(results => getLatLng(results[0]))
            .then(latLng => {
                const { lat, lng } = latLng;
                this.setState({ lat, lng });
                axios.post("/register", this.state).then(results => {
                    if (results.data.success) {
                        location.replace("/");
                    } else {
                        this.setState({
                            errorMsg: results.data.errorMsg
                        });
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const inputProps = {
            value: this.state.address,
            onChange: this.handlePlaceChange,
            placeholder: "Where you thrive"
        };
        const options = {
            location: new google.maps.LatLng(52.52, 13.409),
            radius: 10000, //10 km
            country: "de",
            types: ["geocode"]
        };
        const myStyles = {
            root: { position: "relative" },
            input: {
                width: "168px",
                padding: "0.2em",
                margin: "auto",
                fontSize: "1em",
                fontFamily: "Arial",
                backgroundColor: "rgba(250, 250, 250, 0.8)"
            },

            autocompleteContainer: { backgroundColor: "green" },
            autocompleteItem: { color: "black" }
        };

        const firstname = this.state.firstname;
        const lastname = this.state.lastname;
        const email = this.state.email;
        const password = this.state.password;
        const msg = this.state.errorMsg;
        return (
            <div className="registration-form">
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
                    <PlacesAutocomplete
                        inputProps={inputProps}
                        options={options}
                        styles={myStyles}
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
                        Register
                    </button>
                    {msg ? <p className="error">{msg}</p> : null}
                    {!this.state.formValid && (
                        <FormErrors formErrors={this.state.formErrors} />
                    )}
                    <p>
                        Already registered?<br />
                        <Link to="/login">Log in!</Link>
                    </p>
                </form>
            </div>
        );
    }
}
