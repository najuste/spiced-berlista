import * as io from "socket.io-client";
import { store } from "./start.js";
import {
    getVisitors,
    userJoined,
    userLeft,
    getChatMessages,
    singleChatMessage,
    typing
} from "./actions";

let socket;

export default function initSocket() {
    if (!socket) {
        socket = io.connect();
        socket.on("onlineUsers", data => {
            store.dispatch(getVisitors(data.visitors));
        });
        socket.on("chatMessages", msgs => {
            store.dispatch(getChatMessages(msgs));
        });
    }
    socket.on("typing", data => {
        console.log(data.name, " is typing.. ");
        store.dispatch(typing(data.name));
    });

    socket.on("chatMessage", data => {
        store.dispatch(singleChatMessage(data.msg));
    });

    socket.on("userJoined", data => {
        let { id, firstname, lastname, profilepic, status } = data.user;
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

export function emitTyping() {
    socket.emit("typing");
}
