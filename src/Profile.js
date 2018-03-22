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
            status: 0
        };
        this.friendshipUpdate = this.friendshipUpdate.bind(this);
    }

    //componentWillReceiveProps() {}

    componentDidMount() {
        axios
            .get(`/get-user-info/${this.props.match.params.id}`) //UPDATE results with friendship status
            .then(results => {
                // console.log("resuts from axios", results.data.user);
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
                    // if (results.data.user.sender_id) {
                    //     this.setState({
                    //         senderId: results.data.user.sender_id,
                    //         recipientId: results.data.user.recipient_id
                    //     });
                    // }
                } else {
                    //if results.data.user !== "none" // show msg no such user
                    this.props.history.push("/");
                }
            })
            .catch(err => console.log("Getting PROPS", err));
    }

    //pass props or rather access the state?
    friendshipUpdate() {
        //chosenStatus could be either 2 or 3 //
        // console.log("inside friendship update,", this.state.status);
        let status = this.state.status;

        let id = this.state.id; //user_id
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
                //accepted
                this.friendshipUpdateFun("/updateFriendshipRequest", 4, id); //terminate
            }
        }
        // //|| rejected || terminated ||  ||canceled
        // if (status == 0 || status == 3 || status == 4 || status == 5) {
        //     this.friendshipUpdateFun("/sendFriendshipRequest", 1, id); //pending
        //     //pending || accepted
        // } else if (status == 1 || status == 2) {
        //     this.friendshipUpdateFun("/updateFriendshipRequest", 0, id); //no-request
        // }
    }

    friendshipUpdateFun(route, status, id) {
        axios
            .post(route, { id, status })
            .then(results => {
                const { status, recipientId, senderId } = results.data;
                console.log("Data from axios", results.data);
                // yzou need to send back the senderid and the recipientid from the post route
                // setthe state with this data, sthat shuld fix this shit

                this.setState({ status, recipientId, senderId });
            })
            .catch(err => console.log("friendship Update err:", err));
    }

    render() {
        console.log(
            "is this dude the sender???",
            this.state.id == this.state.recipientId,
            this.state.id,
            this.state.recipientId
        );
        return (
            <div id="profile-section">
                <ProfilePic
                    firstName={this.state.firstName}
                    lastName={this.state.lastName}
                    profilePic={this.state.profilePic}
                />

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
            </div>
        );
    }
}
