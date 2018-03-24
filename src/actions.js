import axios from "./axios";

export function getFriendsAndNot() {
    return axios.get("/friendsAndWannabes").then(function({ data }) {
        console.log(data);
        return {
            type: "GET_FRIENDS_WANNABES",
            users: data.users // var from json what I am returning
        };
    });
}

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

export function updateFriendship(id, status) {
    // var accesed by index.js
    // status= changing tostatus
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
