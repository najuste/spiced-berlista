import React from "react";
import { connect } from "react-redux";

import ListContainer from "./ListContainer";

class OnlineUsers extends React.Component {
    render() {
        const { friends } = this.props;
        const { others } = this.props;
        return (
            <div id="online-section">
                {friends && (
                    <div id="friends-wrapper">
                        {friends.length ? (
                            <h4>Here are your friends online:</h4>
                        ) : null}

                        <div id="friends">
                            <ListContainer users={friends} />
                        </div>
                    </div>
                )}
                {others && (
                    <div id="non-friends-wrapper">
                        {others.length ? <h4>Other users online:</h4> : null}
                        <div id="non-friends">
                            <ListContainer users={others} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("State in map state props", state);
    return {
        friends:
            state.visitors &&
            state.visitors.filter(friend => friend.status == 2),
        others:
            state.visitors &&
            state.visitors.filter(friend => friend.status != 2)
    };
}

export default connect(mapStateToProps)(OnlineUsers);
