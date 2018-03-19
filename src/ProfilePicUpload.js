import React from "react";
import axios from "./axios";

export default class ProfilePicUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.files[0] //this is ES6
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", this.state.file);
        axios
            .post("/upload", formData)
            .then(results => {
                console.log("Rsults from server:", results);
                this.props.setImage(results.data.image);
            })
            .catch(err => console.log(err));
    }

    render() {
        return (
            <div id="pic-uploader">
                <form>
                    <input
                        onChange={this.handleChange}
                        name="file"
                        type="file"
                        id="file"
                    />
                    <button onClick={this.handleSubmit}> Submit</button>
                </form>
            </div>
        );
    }
}
//{props.toggleUploader}
