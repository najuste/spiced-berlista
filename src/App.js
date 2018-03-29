import React from "react";
import axios from "./axios";
import Logo from "./Logo";
import { BrowserRouter, Route, Link } from "react-router-dom";

import MyProfile from "./MyProfile";
import Profile from "./Profile";
import ProfilePic from "./ProfilePic";
import ProfilePicUpload from "./ProfilePicUpload";
import Friends from "./Friends";
import ChatRoom from "./ChatRoom";
import LookupResults from "./LookupResults";
import OnlineUsers from "./OnlineUsers";

import UsersMap from "./UsersMap";

import { connect } from "react-redux";
import { getUsersByString } from "./actions";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            profilePic: "/profilepic.svg",
            bio: "",
            showUploader: false,
            lookup: ""
        };
        this.toggleUploader = this.toggleUploader.bind(this);
        this.setImage = this.setImage.bind(this);
        this.setBio = this.setBio.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKey = this.handleKey.bind(this);
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
            console.log("Getting data from cookies(!)");

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

    toggleUploader() {
        this.setState({ showUploader: !this.state.showUploader });
    }

    // LOOKUP action -------------------------------------------
    handleChange(e) {
        let l = e.target.value.toString();
        this.setState({ lookup: l });
    }
    handleSubmit(e) {
        this.props.dispatch(getUsersByString(this.state.lookup));
        //setting to STATE of redux (while the rest is not...)
    }

    handleKey(e) {
        if (e.key === "Enter") {
            this.handleSubmit();
        }
    }
    //  -------------------------------------------

    render() {
        return (
            <div id="loggedin">
                <BrowserRouter>
                    <div>
                        <nav>
                            <ul>
                                <li>
                                    <Link to="/">
                                        <Logo />
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/map">Map</Link>
                                </li>
                                <li>
                                    <Link to="/chat">Chat</Link>
                                </li>
                                <li>
                                    <Link to="/friends">Friends</Link>
                                </li>

                                <li>
                                    <div id="search">
                                        <Link to="/search">
                                            <input
                                                onChange={this.handleChange}
                                                onKeyDown={this.handleKey}
                                                name="search"
                                                type="text"
                                                placeholder="Look up"
                                            />

                                            <div
                                                className="btn btn-search"
                                                onClick={this.handleSubmit}
                                            >
                                                S
                                            </div>
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <ProfilePic
                                        firstName={this.state.firstName}
                                        lastName={this.state.lastName}
                                        profilePic={this.state.profilePic}
                                        toggleUploader={this.toggleUploader}
                                    />
                                </li>
                            </ul>
                        </nav>
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
                        <Route path="/friends" component={Friends} />
                        <Route path="/search" component={LookupResults} />
                        <Route path="/online" component={OnlineUsers} />
                        <Route path="/chat" component={ChatRoom} />
                        <Route path="/map" component={UsersMap} />
                    </div>
                </BrowserRouter>

                {this.state.showUploader && (
                    <ProfilePicUpload
                        setImage={this.setImage}
                        toggleUploader={this.toggleUploader}
                    />
                )}
            </div>
        );
    }
}

export default connect()(App);
