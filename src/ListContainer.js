import React from "react";

import ProfilePic from "./ProfilePic";
import { Link } from "react-router-dom";

const ListContainer = props => {
    const defaultpic = "./profilepic.svg";

    let elems =
        props.users &&
        props.users.map((user, i) => {
            return (
                <div className="friend">
                    <Link to={"/user/" + user.id} key={i}>
                        <ProfilePic
                            firstName={user.firstname}
                            lastName={user.lastname}
                            profilePic={user.profilepic || defaultpic}
                        />
                    </Link>

                    <div>
                        {user.firstname} {user.lastname}
                    </div>
                    {props.btn && (
                        <RenderButton
                            updateFriendship={props.updateFriendship}
                            btn={props.btn}
                            u={user.id}
                        />
                    )}
                </div>
            );
        });

    //return (<div>{elems}</div>)
    return elems; //new way of returning
};

const RenderButton = props => {
    let buttons =
        props.btn &&
        props.btn.map((b, i) => {
            return (
                <button
                    key={i}
                    className="btn btn-friends"
                    onClick={() => props.updateFriendship(props.u, b.status)}
                >
                    {b.text}
                </button>
            );
        });
    //return buttons;
    return buttons;
};

export default ListContainer;
