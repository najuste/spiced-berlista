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
            location: "",
            email: "",
            password: "",
            formErrors: {
                email: "",
                password: ""
            },
            locationValid: false,
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
    handlePlaceChange(location) {
        this.setState({ location });
        const { formErrors } = this.state;
        let valid = location.length >= 2;
        formErrors.location = valid ? "" : "pick a location";
    }

    fieldsNotEmpty(name, value) {
        let { formErrors, emailValid, passwordValid } = this.state;
        switch (name) {
            case "firstname":
                var valid = value.length >= 1;
                formErrors.firstname = valid ? "" : "no name?";
                break;
            case "lastname":
                valid = value.length >= 1;
                formErrors.lastname = valid ? "" : "no surname?";
                break;
            case "email":
                emailValid = value.match(
                    /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i
                );
                formErrors.email = emailValid ? "" : " invalid email";
                break;
            case "password":
                passwordValid = value.length >= 6;
                formErrors.password = passwordValid
                    ? ""
                    : "password is too short";
                break;
            default:
                break;
        }
        this.setState(
            {
                formErrors: formErrors,
                emailValid: emailValid,
                passwordValid: passwordValid
            },
            this.validateForm
        );
    }

    setLocationError() {
        this.setState(prevState => ({
            formErrors: {
                ...prevState.formErrors,
                location: "location not chosen"
            }
        }));
    }

    validateForm() {
        this.setState({
            formValid:
                this.state.emailValid &&
                this.state.passwordValid &&
                this.state.locationValid
        });
    }

    submitRegistration() {
        geocodeByAddress(this.state.location)
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
            type: "search",
            value: this.state.location,
            onChange: this.handlePlaceChange,
            placeholder: "Where in Berlin?",
            name: "location"
        };
        const onError = (status, clearSuggestions) => {
            clearSuggestions();
            this.setLocationError();
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
                width: "100%",
                padding: "0.2em",
                margin: "auto",
                fontSize: "1em",
                fontFamily: "Arial",
                backgroundColor: "rgba(250, 250, 250, 0.8)"
            }
        };

        const { firstname, lastname, location, email, password } = this.state;
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
                        onError={onError}
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
