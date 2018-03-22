import axios from "./axios";

export function getFriendsAndNot() {
    return axios.get("/friendsAndWannabes").then(function({ data }) {
        return {
            type: "GET_FRIENDS_WANNABES",
            users: data.friends // var from json what I am returning
        };
    });
}

export function updateFriendship(id, status) {
    // var accesed by index.js
    // status= changing to status
    // let status = 2; // accept
    // let status = 3; //reject
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
// export function makeFriends(other_id) {
//     // .post(route, { id, status })
//     let status = 2; // accept
//     return axios
//         .post("/updateFriendshipRequest", { other_id, status })
//         .then(function() {
//             return {
//                 type: "MAKE_FRIENDS",
//                 id: other_id
//             };
//         });
// }
//
// export function endFriends(other_id) {
//     let status = 3; //reject
//     return axios
//         .post("/updateFriendshipRequest", { other_id, status })
//         .then(function() {
//             return {
//                 type: "END_FRIENDS",
//                 id: other_id
//             };
//         });
// }
