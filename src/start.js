import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(<HelloWorld />, document.querySelector("main"));

function HelloWorld() {
    console.log("Hello from Justina");
    return <div>Hello, World!</div>;
}
