import React from "react";

import axios from "./axios";

export default class MakeFriendsButton extends React.Component {
    constructor(props) {
        super(props);
        this.renderButton = this.renderButton.bind(this);
    }

    renderButton(status) {
        let text;
        switch (status) {
            case 0: //no status
                text = "Make friend request";
                break;
            case 1: //pending
                this.props.sender
                    ? (text = "Cancel friend request") //Sender can cancel
                    : (text = "Accept friend request"); //Recipient can either accept (or reject)

                break;
            case 2: //"accepted":
                text = "Unfriend";
                break;
            case 3: //"rejected":
                text = "Make friend request";
                break;
            case 4: //"terminated":
                text = "Make friend request";
                break;
            case 5: //"canceled":
                text = "Make friend request";
                break;
            default:
                text = "Loading";
                break;
        }

        return (
            <button
                className="btn btn-friends"
                onClick={this.props.friendshipUpdate}
            >
                {text}
            </button>
        );
    }

    render() {
        return this.renderButton(this.props.status);
    }
}
