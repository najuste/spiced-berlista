import axios from "./axios";

export function getFriendsAndNot() {
    return axios.get("/friendsAndWannabes").then(function({ data }) {
        console.log(data);
        return {
            type: "GET_FRIENDS_WANNABES",
            users: data.users
        };
    });
}
export function updateFriendship(id, status) {
    return axios
        .post("/updateFriendshipRequest", { id, status })
        .then(function() {
            return {
                type: "UPDATE_FRIENDSHIP",
                id: id,
                status: status
            };
        });
}

// SOCKETS --- ONLINE USERS
export function getVisitors(users) {
    return {
        type: "GET_VISITORS",
        visitors: users
    };
}

export function userJoined(user) {
    return {
        type: "USER_JOINED",
        user: user
    };
}

export function userLeft(id) {
    return {
        type: "USER_LEFT",
        id: id
    };
}

export function getChatMessages(msgs) {
    return {
        type: "GET_MESSAGES",
        messages: msgs
    };
}

export function singleChatMessage(msg) {
    console.log("in actions: singleChatMessage:", msg);
    return {
        type: "CHAT_MESSAGE",
        msg
    };
}

//EXTRA ------ search
export function getUsersByString(searchString) {
    return axios.get(`/users/${searchString}`).then(function({ data }) {
        return {
            type: "LOOKUP_BY_STRING",
            users: data.users
        };
    });
}

//for map
export function getAllUsersLocation() {
    return axios.get(`/userslocation`).then(function({ data }) {
        return {
            type: "LOOKUP_COOR",
            users: data.users
        };
    });
}
