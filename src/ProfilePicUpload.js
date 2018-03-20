import React from "react";
import axios from "./axios";

export default class ProfilePicUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: "",
            label: "Choose a file"
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.files[0], //this is ES6
            label: e.target.files[0].name.slice(0, 10) + "..."
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", this.state.file);
        console.log("Doing a post upload");
        axios
            .post("/upload", formData)
            .then(results => {
                console.log("Results from server:", results);
                this.props.setImage(results.data.image);
            })
            .catch(err => console.log(err));
    }

    render() {
        return (
            <div id="pic-uploader">
                <form>
                    <label htmlFor="file">
                        <a>{this.state.label}</a>
                    </label>
                    <input
                        onChange={this.handleChange}
                        name="file"
                        type="file"
                        id="file"
                    />
                    <button
                        disabled={!this.state.file}
                        className="btn btn-upload"
                        onClick={this.handleSubmit}
                    >
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}
//{props.toggleUploader}
