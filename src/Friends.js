import React from "react";
import { connect } from "react-redux";
import { getFriendsAndNot, updateFriendship } from "./actions";
import MakeFriendsButton from "./MakeFriendsButton";

import ProfilePic from "./ProfilePic";

class Friends extends React.Component {
    componentDidMount() {
        //getting the state - a list of friends and not
        this.props.getFriendsAndNot();
    }

    render() {
        const defaultpic = "./profilepic.svg";
        const { friends } = this.props;
        const { wannabes } = this.props;
        console.log("Friends:", friends);

        return (
            <div id="friends-section">
                {friends && (
                    <div id="friends-wrapper">
                        {friends.length ? (
                            <h4>Here are your friends:</h4>
                        ) : null}

                        <div id="friends">
                            {friends.map(friend => (
                                <div className="friend" key={friend.id}>
                                    <ProfilePic
                                        firstName={friend.firstname}
                                        lastName={friend.lastname}
                                        profilePic={friend.profilepic}
                                    />
                                    <div>
                                        {friend.firstname} {friend.lastname}
                                    </div>
                                    <button
                                        className="btn btn-friends"
                                        onClick={() =>
                                            this.props.updateFriendship(
                                                friend.id,
                                                5
                                            )
                                        }
                                    >
                                        Unfriend
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {wannabes && (
                    <div id="wannabes-wrapper">
                        {wannabes.length ? (
                            <h4>Some pending requests:</h4>
                        ) : null}
                        <div id="wannabes">
                            {wannabes.map(wana => (
                                <div className="friend" key={wana.id}>
                                    <ProfilePic
                                        firstName={wana.firstname}
                                        lastName={wana.lastname}
                                        profilePic={wana.profilepic}
                                    />
                                    <p>
                                        {wana.firstname} {wana.lastname}
                                    </p>
                                    <button
                                        className="btn btn-friends"
                                        onClick={() =>
                                            this.props.updateFriendship(
                                                friend.id,
                                                2
                                            )
                                        }
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-friends btn-reject"
                                        onClick={() =>
                                            this.props.updateFriendship(
                                                friend.id,
                                                3
                                            )
                                        }
                                    >
                                        Reject
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    //console.log("state", state);
    return {
        friends:
            state.friends && state.friends.filter(friend => friend.status == 2),
        wannabes:
            state.friends && state.friends.filter(friend => friend.status == 1)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getFriendsAndNot: () => dispatch(getFriendsAndNot()),
        updateFriendship: (id, status) => dispatch(updateFriendship(id, status))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
