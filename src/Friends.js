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
                            <ListContainer users={friends} />
                        </div>
                    </div>
                )}

                {wannabes && (
                    <div id="wannabes-wrapper">
                        {wannabes.length ? (
                            <h4>Some pending requests:</h4>
                        ) : null}
                        <div id="wannabes">
                            <ListContainer users={wannabes} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const friendsButton = (state, text, user_id) => {
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

// how for each user show the button?
// var FriendButton =
// <button
//     className="btn btn-friends"
//     onClick={() =>
//         this.props.updateFriendship(
//             user.id,
//             5
//         )
//     }
// >
//     Unfriend
// </button>

// <button
//     className="btn btn-friends"
//     onClick={() =>
//         this.props.updateFriendship(
//             wana.id,
//             2
//         )
//     }
// >
//     Accept
// </button>
// <button
//     className="btn btn-friends btn-reject"
//     onClick={() =>
//         this.props.updateFriendship(
//             wana.id,
//             3
//         )
//     }
// >
//     Reject
// </button>
