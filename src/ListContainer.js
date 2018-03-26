import React from "react";

import ProfilePic from "./ProfilePic";
import { Link } from "react-router-dom";

const ListContainer = props => {
    const defaultpic = "./profilepic.svg";

    console.log("Users in List Container:", props.users);
    let elems =  (
        props.users &&
        props.users.map(user => {
            return (
                <Link to={"/user/" + user.id}>
                    <div className="friend" key={user.id}>
                        <ProfilePic
                            firstName={user.firstname}
                            lastName={user.lastname}
                            profilePic={user.profilepic || defaultpic}
                        />

                        <div>
                            {user.firstname} {user.lastname}
                        </div>
                    </div>
                </Link>
                )
            })
        )
    // console.log('Elems', elems);

    //return (<div>{elems}</div>)
    return (elems) //new way of returning

};

export default ListContainer;
