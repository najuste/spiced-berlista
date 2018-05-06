import React from "react";
import { connect } from "react-redux";
import { getChatMessages } from "./actions";
import { emitChatMessage } from "./socket";
import { Link } from "react-router-dom";

import ProfilePic from "./ProfilePic";
const defaultpic = "./profilepic.svg";

class ChatRoom extends React.Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKey = this.handleKey.bind(this);
    }

    componentDidUpdate() {
        this.chatContainer && (this.chatContainer.scrollTop = 1000); //
    }

    handleSubmit(e) {
        e && e.preventDefault();
        let el = document.querySelector("textarea");
        let msg = el.value;
        emitChatMessage(msg);
        el.value = "";
    }

    handleKey(e) {
        if (e.key === "Enter") {
            this.handleSubmit();
        }
    }

    render() {
        const { messages } = this.props;
        return (
            <div id="chat-section">
                {messages && (
                    <div
                        id="chat-wrapper"
                        ref={elem => (this.chatContainer = elem)}
                    >
                        {messages.length != 0 &&
                            messages.map(msg => {
                                return (
                                    <div key={msg.user.id} className="msg">
                                        <Link to={"/user/" + msg.user.id}>
                                            <ProfilePic
                                                firstName={msg.user.firstName}
                                                lastName={msg.user.lastName}
                                                profilePic={
                                                    msg.user.profilePic ||
                                                    defaultpic
                                                }
                                            />
                                        </Link>
                                        <div className="msg-data">
                                            <p className="user">
                                                {msg.user.firstName}
                                            </p>
                                            <p className="time">
                                                {msg.timestamp}
                                            </p>

                                            <p className="text">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
                <p>Leave your message</p>

                <textarea
                    onKeyDown={this.handleKey}
                    id="chat"
                    rows="2"
                    cols="50"
                    type="text"
                />
                <button
                    className="btn btn-chatSubmit"
                    onClick={this.handleSubmit}
                >
                    Submit
                </button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        messages:
            state.messages && state.messages.slice(state.messages.length - 10)
        // users:
        //     state.users && state.users.filter(friend => friend.status == 1)
    };
}

export default connect(mapStateToProps)(ChatRoom);
