//just socket stuff
import * as io from "socket.io-client";
import { store } from "./start.js";
import {
    getVisitors,
    userJoined,
    userLeft,
    getChatMessages,
    singleChatMessage
} from "./actions";

let socket;

export default function initSocket() {
    if (!socket) {
        socket = io.connect(); //we din't want to make this conncetion id user is not logged
        socket.on("onlineUsers", data => {
            store.dispatch(getVisitors(data.visitors));
            //passing here the data, so I access it in actions
        });
        //retrieveing all chat messages as a user is online
        socket.on("chatMessages", msgs => {
            console.log("INITIAL messages loading:", msgs);
            store.dispatch(getChatMessages(msgs));
        });
    }

    //
    socket.on("chatMessage", data => {
        //SENDING A NEW MSG
        console.log("Message in socket.js", data);
        store.dispatch(singleChatMessage(data.msg));
    });

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

export function emitChatMessage(message) {
    socket.emit("chatMessage", message);
}
