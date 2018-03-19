import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Welcome from "./Welcome";
let element;
// ReactDOM.render(<HelloWorld />, document.querySelector("main"));

//logged out user - redirecting to Welcome /or Login
if (location.pathname === "/welcome") {
    element = <Welcome />;
} else {
    //logged in user
    element = <App />;
}
ReactDOM.render(element, document.querySelector("main"));

// function HelloWorld() {
//     console.log("Hello from Justina");
//     return <div>Hello, World!</div>;
// }
