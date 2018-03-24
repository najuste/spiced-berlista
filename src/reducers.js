export default function(state = {}, action) {
    if (action.type == "GET_FRIENDS_WANNABES") {
        //action.type from actions
        state = Object.assign({}, state, {
            //action.users from actions
            users: action.users
        });
    }
    if (action.type == "LOOKUP_BY_STRING") {
        //action.type from actions
        state = Object.assign({}, state, {
            //action.users from actions
            users: action.users
        });
    }
    if (action.type == "LOOKUP_COOR") {
        //action.type from actions
        state = Object.assign({}, state, {
            //action.users from actions
            users: action.users
        });
    }

    if (action.type == "UPDATE_FRIENDSHIP") {
        return {
            ...state,
            users: state.users.map(function(friend) {
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
