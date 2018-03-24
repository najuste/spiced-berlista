import React from "react";
import { connect } from "react-redux";
import { getFriendsAndNot, updateFriendship } from "./actions";

import MakeFriendsButton from "./MakeFriendsButton";
import ProfilePic from "./ProfilePic";
import Profile from "./Profile";

class Friends extends React.Component {
    componentDidMount() {
        //     console.log("Location?", this.props.location);
        this.props.getFriendsAndNot();
        console.log("getting props when mounted", this.props);
        //getting the state - a list of friends and not
        // if (this.props.location && this.props.location.pathname == "/friends") {
        //     //== "/friends"
        //     console.log("Do we have results from search?", this.props.location);
        //     this.props.getFriendsAndNot();
        // } else {
        //     console.log("Got results from search", this.props);
        //     // const { users } = this.props;
        // }
        // // this.props.dispatch(getFriendsAndNot());
    }

    render() {
        const defaultpic = "./profilepic.svg";

        const { friends } = this.props;
        const { wannabes } = this.props;
        // const { others } = this.props; // only search Button produces

        return (
            <div id="friends-section">
                {friends && (
                    <div id="friends-wrapper">
                        {friends.length ? (
                            <h4>Here are your friends:</h4>
                        ) : null}

                        <div id="friends">
                            {friends.map(friend => (
                                <div
                                    className="friend"
                                    key={friend.id}
                                    onClick={e => {
                                        e.preventDefault();
                                        <Route
                                            path="/user/:id"
                                            component={Profile}
                                        />;
                                    }}
                                >
                                    <ProfilePic
                                        firstName={friend.firstname}
                                        lastName={friend.lastname}
                                        profilePic={
                                            friend.profilepic || defaultpic
                                        }
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
                                        profilePic={
                                            wana.profilepic || defaultpic
                                        }
                                    />
                                    <p>
                                        {wana.firstname} {wana.lastname}
                                    </p>
                                    <button
                                        className="btn btn-friends"
                                        onClick={() =>
                                            this.props.updateFriendship(
                                                wana.id,
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
                                                wana.id,
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
    console.log("state", state);
    return {
        friends:
            state.users && state.users.filter(friend => friend.status == 2),
        wannabes:
            state.users && state.users.filter(friend => friend.status == 1)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getFriendsAndNot: () => dispatch(getFriendsAndNot()),
        updateFriendship: (id, status) => dispatch(updateFriendship(id, status))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
