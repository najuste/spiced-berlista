import React from "react";
import { connect } from "react-redux";

import ListContainer from "./ListContainer";

class LookupResults extends React.Component {
    render() {
        const { users } = this.props;

        return (
            <div id="friends-section">
                {users && (
                    <div id="friends-wrapper">
                        {users.length ? (
                            <h4>Here are your search results:</h4>
                        ) : (
                            <h4>Nothing found: Try again</h4>
                        )}

                        <div id="friends">
                            <ListContainer users={users} />
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
        users: state.users
    };
}

export default connect(mapStateToProps)(LookupResults);
