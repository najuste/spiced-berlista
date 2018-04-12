import React from "react";
import ProfilePic from "./ProfilePic";
import { Link } from "react-router-dom";
import MakeFriendsButton from "./MakeFriendsButton";
import axios from "./axios";

export default class Profile extends React.Component {
    constructor() {
        super();
        this.state = {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            profilePic: "/profilepic.svg",
            bio: "",
            status: 0,
            messages: []
        };
        this.friendshipUpdate = this.friendshipUpdate.bind(this);
        this.handleWallSubmit = this.handleWallSubmit.bind(this);
    }

    componentDidMount() {
        axios
            .get(`/get-user-info/${this.props.match.params.id}`)
            .then(results => {
                if (results.data.user !== "same") {
                    const {
                        id,
                        firstname,
                        lastname,
                        email,
                        profilepic,
                        bio,
                        status
                    } = results.data.user;

                    this.setState({
                        id: id,
                        firstName: firstname,
                        lastName: lastname,
                        email: email,
                        status: status,
                        profilePic: profilepic || this.state.profilePic,
                        bio: bio || this.state.bio,
                        senderId: results.data.user.sender_id || null,
                        recipientId: results.data.user.recipient_id || null
                    });

                    axios
                        .get(`/profile-wall/${this.props.match.params.id}`)
                        .then(res => {
                            console.log("Data to post to wall:", res.data);
                            const { messages } = res.data;
                            this.setState({ messages });
                        });
                } else {
                    this.props.history.push("/");
                }
            })
            .catch(err => console.log("Getting PROPS", err));
    }

    friendshipUpdate() {
        const { status, id } = this.state;
        //no-request || 3-rejected, 4-terminated, 5-cancelled
        if (status === 0 || status > 2) {
            this.friendshipUpdateFun("/sendFriendshipRequest", 1, id); //pending
        } else {
            if (status === 1) {
                //pending
                if (this.state.id == this.state.recipientId) {
                    this.friendshipUpdateFun("/updateFriendshipRequest", 5, id); //cancel
                } else {
                    this.friendshipUpdateFun("/updateFriendshipRequest", 2, id); //accept //or 32 for reject
                }
            }
            if (status === 2) {
                this.friendshipUpdateFun("/updateFriendshipRequest", 4, id); //terminate
            }
        }
    }

    friendshipUpdateFun(route, status, id) {
        axios
            .post(route, { id, status })
            .then(results => {
                const { status, recipientId, senderId } = results.data;
                this.setState({ status, recipientId, senderId });
            })
            .catch(err => console.log("friendship Update err:", err));
    }

    writeToWall(receiver, msg) {
        axios
            .post("/profile-wall", { receiver, msg })
            .then(results => {
                const { message } = results.data;
            })
            .catch(err => console.log("write to wall err:", err));
    }

    handleWallSubmit(e) {
        e && e.preventDefault();
        let el = document.querySelector("textarea");
        let msg = el.value;
        this.writeToWall(this.state.id, msg);
        el.value = "";
    }
    handleKeyDown(e) {
        if (e.key === "Enter") {
            console.log("Got enter");
            this.handleWallSubmit();
        }
    }

    render() {
        return (
            <div id="profile-section">
                <ProfilePic
                    firstName={this.state.firstName}
                    lastName={this.state.lastName}
                    profilePic={this.state.profilePic}
                />
                <h3>
                    {this.state.firstName} {this.state.lastName}
                </h3>
                <p id="bio-text">
                    {this.state.bio
                        ? this.state.bio
                        : "User hasn't shared any hobbies with us yet"}
                </p>

                <MakeFriendsButton
                    status={this.state.status}
                    friendshipUpdate={this.friendshipUpdate}
                    sender={this.state.id == this.state.recipientId}
                />
                {this.state.status == 2 && (
                    <div className="wall">
                        <p>Leave a message </p>
                        <textarea
                            onKeyDown={this.handleKeyDown}
                            id="wall"
                            type="text"
                        />
                        <button
                            className="btn btn-wall"
                            onClick={this.handleWallSubmit}
                        >
                            Post
                        </button>
                        <div id="wall-section">
                            {this.state.messages &&
                                this.state.messages.map((m, i) => {
                                    return (
                                        <div className="msg">
                                            <ProfilePic
                                                firstName={m.firstname}
                                                lastName={m.lastname}
                                                profilePic={m.profilepic}
                                            />
                                            <p>{m.msg}</p>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
