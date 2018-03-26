//just socket stuff
import * as io from "socket.io-client";
import { store } from "./start.js";
import { getVisitors, userJoined, userLeft } from "./actions";

let socket;

export default function initSocket() {
    if (!socket) {
        socket = io.connect(); //we din't want to make this conncetion id user is not logged
        socket.on("onlineUsers", data => {
            store.dispatch(getVisitors(data.visitors));
            //passing here the data, so I access it in actions
        });
    }

    socket.on("userJoined", data => {
        // console.log(`New user joined:`, data.user);
        let { id, firstname, lastname, profilepic, status } = data.user; //getting data from cookies, so much more data then this
        store.dispatch(
            userJoined({ id, firstname, lastname, profilepic, status })
        );
    });

    socket.on("userLeft", data => {
        store.dispatch(userLeft(data.id));
    });
}
