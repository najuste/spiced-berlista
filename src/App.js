import React from "react";
import axios from "./axios";
import Logo from "./Logo";
import { BrowserRouter, Route, Link } from "react-router-dom";

import MyProfile from "./MyProfile";
import Profile from "./Profile";

import ProfilePic from "./ProfilePic";
import ProfilePicUpload from "./ProfilePicUpload";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            profilePic: "/profilepic.svg",
            bio: "",
            showUploader: false
        };
        this.toggleUploader = this.toggleUploader.bind(this);
        this.setImage = this.setImage.bind(this);
        this.setBio = this.setBio.bind(this);
    }

    setImage(profilePic) {
        this.toggleUploader();
        this.setState({ profilePic: profilePic });
    }

    setBio(bio) {
        this.setState({ bio: bio });
    }
    componentDidMount() {
        axios.get("/user").then(results => {
            console.log("Getting all from cookies(!)", results.data.user);

            this.setState({
                id: results.data.user.id,
                firstName: results.data.user.firstname,
                lastName: results.data.user.lastname,
                email: results.data.user.email,
                profilePic:
                    results.data.user.profilepic || this.state.profilePic,
                bio: results.data.user.bio || this.state.bio
            });
        });
    }

    //to change the state
    // we need to pass this as the prop to pofile pic
    toggleUploader() {
        this.setState({ showUploader: !this.state.showUploader });
    }

    render() {
        return (
            <div id="loggedin">
                <Logo />
                <ProfilePic
                    firstName={this.state.firstName}
                    lastName={this.state.lastName}
                    profilePic={this.state.profilePic}
                    toggleUploader={this.toggleUploader}
                />

                <BrowserRouter>
                    <div>
                        <Route
                            exact
                            path="/"
                            render={() => (
                                <MyProfile
                                    firstName={this.state.firstName}
                                    lastName={this.state.lastName}
                                    profilePic={this.state.profilePic}
                                    bio={this.state.bio}
                                    setBio={this.setBio}
                                />
                            )}
                        />
                        <Route path="/user/:id" component={Profile} />
                    </div>
                </BrowserRouter>
                {this.state.showUploader && (
                    <ProfilePicUpload setImage={this.setImage} />
                )}
            </div>
        );
    }

    //  <ProfilePicUpload
    //      toggleUploader = {this.toggleUploader}
    //      firstname = {this.firstname}
    //
    //      />
    //  {this.state.showUploader && <ProfilePicUpload />} //if this truthy, then perform this thing
    //
}
