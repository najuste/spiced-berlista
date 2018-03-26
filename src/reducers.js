export default function(state = {}, action) {
    if (action.type == "GET_FRIENDS_WANNABES") {
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

    // SOCKETS -  ONLINE
    if (action.type == "GET_VISITORS") {
        //action.type from actions
        state = Object.assign({}, state, {
            visitors: action.visitors //action.users from actions
        });
    }
    if (action.type == "USER_JOINED") {
        //console.log("REDUCER: action.user", action.user);
        return {
            ...state,
            visitors: state.visitors.concat([action.user])
        };
    }
    if (action.type == "USER_LEFT") {
        console.log("IN REDUCER:", action);
        return {
            ...state,
            visitors: state.visitors.filter(visitor => visitor.id !== action.id)
        };
    }

    // EXTRA FEATURES
    if (action.type == "LOOKUP_BY_STRING") {
        state = Object.assign({}, state, {
            users: action.users
        });
    }
    if (action.type == "LOOKUP_COOR") {
        state = Object.assign({}, state, {
            users: action.users //action.users from actions
        });
    }

    return state;
}
