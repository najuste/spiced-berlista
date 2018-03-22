export default function(state = {}, action) {
    if (action.type == "GET_FRIENDS_WANNABES") {
        //action.type from actions
        state = Object.assign({}, state, {
            //action.users from actions
            friends: action.users
        });
    }
    if (action.type == "UPDATE_FRIENDSHIP") {
        return {
            ...state,
            friends: state.friends.map(function(friend) {
                //array, so mapping
                if (friend.id == action.id) {
                    return {
                        ...friend,
                        status: action.status
                    };
                } else {
                    return friend;
                }
            })
        };
    }

    return state;
}
