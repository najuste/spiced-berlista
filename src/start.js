import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Welcome from "./Welcome";

import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxPromise from "redux-promise";
import reducer from "./reducers";
import { composeWithDevTools } from "redux-devtools-extension";
import initSocket from "./socket.js";

export const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

initSocket();

let element;

//logged out user - redirecting to Welcome /or Login
if (location.pathname === "/welcome") {
    element = <Welcome />;
} else {
    element = (
        <Provider store={store}>
            <App />
        </Provider>
    );
}
ReactDOM.render(element, document.querySelector("main"));
