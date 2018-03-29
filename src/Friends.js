import React from "react";
import { connect } from "react-redux";
import { getFriendsAndNot, updateFriendship } from "./actions";

import MakeFriendsButton from "./MakeFriendsButton";
import ListContainer from "./ListContainer";

class Friends extends React.Component {
    componentDidMount() {
        this.props.getFriendsAndNot();
    }

    render() {
        const { friends } = this.props;
        const { wannabes } = this.props;

        return (
            <div id="friends-section">
                {friends && (
                    <div id="friends-wrapper">
                        {friends.length ? (
                            <h4>Here are your friends:</h4>
                        ) : null}
                        <div id="friends">
                            <ListContainer
                                updateFriendship={this.props.updateFriendship}
                                users={friends}
                                btn={[{ status: 5, text: "Unfriend" }]}
                            />
                        </div>
                    </div>
                )}

                {wannabes && (
                    <div id="wannabes-wrapper">
                        {wannabes.length ? (
                            <h4>Some pending requests:</h4>
                        ) : null}
                        <div id="wannabes">
                            <ListContainer
                                updateFriendship={this.props.updateFriendship}
                                users={wannabes}
                                btn={[
                                    { status: 2, text: "Accept" },
                                    { status: 3, text: "Reject" }
                                ]}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const friendsButton = (state, text) => {
    <button
        className="btn btn-friends"
        onClick={() => this.props.updateFriendship(user_id, state)}
    >
        {text}
    </button>;
};

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
