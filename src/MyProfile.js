import React from "react";
import ProfilePic from "./ProfilePic";
import { Link } from "react-router-dom";
import axios from "./axios";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bio: this.props.bio,
            showBio: false
        };
        this.showBioToggle = this.showBioToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submitBio = this.submitBio.bind(this);
    }

    submitBio(e) {
        e.preventDefault();
        console.log("Inside submit bio", this.state);
        axios
            .post("/bio", this.state)
            .then(results => {
                console.log("Results from db update bio", results);
                if (results.data.success) {
                    this.props.setBio(this.state.bio);
                    this.showBioToggle();
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    showBioToggle() {
        this.setState({ showBio: !this.state.showBio });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
        console.log(e.target.name, e.target.value);
    }

    render() {
        console.log(this.state);
        return (
            <div id="profile-section">
                <ProfilePic
                    firstName={this.props.firstName}
                    lastName={this.props.lastName}
                    profilePic={this.props.profilePic}
                />
                {!this.state.showBio && (
                    <p id="bio-text">
                        // FIXME: STILL NEEDS TTO BE FIXED
                        {this.props.bio ? (
                            this.props.bio +
                            <a onClick={this.showBioToggle}>"Edit"</a>
                        ) : (
                            <a onClick={this.showBioToggle}>
                                "You haven't shared any hobbies with us yet"
                            </a>
                        )}
                    </p>
                )}
                {this.state.showBio && (
                    <form>
                        <textarea
                            onChange={this.handleChange}
                            type="text"
                            placeholder="tell us about yourself"
                            name="bio"
                            cols="40"
                            rows="5"
                            defaultValue={this.props.bio}
                        />
                        <button
                            type="submit"
                            className="btn btn-bio"
                            onClick={this.submitBio}
                        >
                            Update
                        </button>
                    </form>
                )}
            </div>
        );
    }
}
