export default function(state = {}, action) {
    if (action.type == "GET_FRIENDS_WANNABES") {
        state = Object.assign({}, state, {
            users: action.users
        });
    }

    if (action.type == "UPDATE_FRIENDSHIP") {
        return {
            ...state,
            users: state.users.map(function(friend) {
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
        state = Object.assign({}, state, {
            visitors: action.visitors
        });
    }
    if (action.type == "USER_JOINED") {
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

    // chat MESSAGES //getChatMessages
    if (action.type === "GET_MESSAGES") {
        state = Object.assign({}, state, {
            messages: action.messages
        });
    }
    if (action.type === "CHAT_MESSAGE") {
        console.log("In reducer chat message:", state);
        state = Object.assign({}, state, {
            messages: state.messages
                ? [...state.messages, action.msg]
                : [action.msg]
        });
    }

    // EXTRA FEATURES
    if (action.type == "LOOKUP_BY_STRING") {
        state = Object.assign({}, state, {
            users: action.users
        });
    }
    if (action.type == "LOOKUP_COOR") {
        state = Object.assign({}, state, {
            users: action.users
        });
    }

    return state;
}
