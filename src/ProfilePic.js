import React from "react";

export default function ProfilePic(props) {
    return (
        <div className="userpic-wrapper">
            <img
                className="userpic"
                src={props.profilePic}
                alt={props.firstName + "_" + props.lastName}
                onClick={props.toggleUploader}
            />
        </div>
    );
}
