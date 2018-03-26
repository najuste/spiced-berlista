import React from "react";
import axios from "./axios";
import Logo from "./Logo";
import { BrowserRouter, Route, Link } from "react-router-dom";

import MyProfile from "./MyProfile";
import Profile from "./Profile";
import ProfilePic from "./ProfilePic";
import ProfilePicUpload from "./ProfilePicUpload";
import Friends from "./Friends";
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
            lookup: "",
            lookupResults: ""
        };
        this.toggleUploader = this.toggleUploader.bind(this);
        this.setImage = this.setImage.bind(this);
        this.setBio = this.setBio.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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
        //console.log(e.target.value);
        this.setState({ lookup: e.target.value });
    }
    handleSubmit(e) {
        console.log("In submit button:");
        // console.log(this.props);
        this.props.dispatch(getUsersByString(this.state.lookup)); //setting to STATE of redux
        //this.props.history.push("/search"); //redirecting the user to the route /search
        // axios
        //     .get(`/users/${this.state.lookup}`)
        //     .then(results => {
        //         console.log("Here are the results", results.data);
        //         this.setState({ lookupResults: results.data });
        //         //changing url by pushing
        //         this.props.history.push("/search");
        //     })
        //     .catch(err => console.log(err));
    }
    //  -------------------------------------------

    render() {
        return (
            <div id="loggedin">
                <BrowserRouter>
                    <div>
                        <Link to="/">
                            <Logo />
                        </Link>
                        <div id="to-page-friends">
                            <Link to="/friends">Friends</Link>
                        </div>
                        <div id="search">
                            <form>
                                <input
                                    onChange={this.handleChange}
                                    name="search"
                                    type="text"
                                    placeholder="Look up"
                                />

                                <Link to="/search">
                                    <div
                                        className="btn btn-search"
                                        onClick={this.handleSubmit}
                                    >
                                        S
                                    </div>
                                </Link>
                            </form>
                        </div>
                        <ProfilePic
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            profilePic={this.state.profilePic}
                            toggleUploader={this.toggleUploader}
                        />
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
                        <Route path="/map" component={UsersMap} />
                        UsersMap
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

//  <ProfilePicUpload
//      toggleUploader = {this.toggleUploader}
//      firstname = {this.firstname}
//
//      />
//  {this.state.showUploader && <ProfilePicUpload />} //if this truthy, then perform this thing
//

// handleSubmit(e) {
//     e.preventDefault();
//     console.log("In submit button:");
//     // console.log(this.props);
//
//     // axios
//     //     .get(`/users/${this.state.lookup}`)
//     //     .then(results => {
//     //         console.log("Here are the results", results.data);
//     //         this.setState({ lookupResults: results.data });
//     //         //changing url by pushing
//     //         this.props.history.push("/search");
//     //     })
//     //     .catch(err => console.log(err));
// }
