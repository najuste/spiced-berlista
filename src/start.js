import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Welcome from "./Welcome";

import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxPromise from "redux-promise";
import reducer from "./reducers";
import { composeWithDevTools } from "redux-devtools-extension";
// import * as io from "socket.io-client";

// const socket = io.connect();

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

let element;

//logged out user - redirecting to Welcome /or Login
if (location.pathname === "/welcome") {
    element = <Welcome />;
} else {
    //logged in user
    element = (
        <Provider store={store}>
            <App />
        </Provider>
    );

    // socket.on("welcome", function(data) {
    //     console.log(data);
    //     socket.emit("thanks", {
    //         message: "Thank you. It is great to be here."
    //     });
    // });
}
ReactDOM.render(element, document.querySelector("main"));
