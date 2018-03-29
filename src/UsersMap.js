import React from "react";
import { connect } from "react-redux";
import { getAllUsersLocation } from "./actions";
const secrets = require("./../googleMAPI.js");

import { Link } from "react-router-dom";

import ProfilePic from "./ProfilePic";
const defaultpic = "./profilepic.svg";

import GoogleMapReact from "google-map-react";

const Marker = ({ marker }) => {
    // console.log("In custom marker: props", marker);
    return (
        <div className="pic-marker">
            <Link to={"/user/" + marker.id}>
                <ProfilePic
                    firstName={marker.firstname}
                    lastName={marker.lastname}
                    profilePic={marker.profilepic || defaultpic}
                />
            </Link>
            <div> {marker.firstname}</div>
        </div>
    );
};

class UsersMap extends React.Component {
    constructor() {
        super();
        this.state = {
            center: { lat: 52.52, lng: 13.409 },
            zoom: 12
        };
        this.createMapMarkers = this.createMapMarkers.bind(this);
    }

    componentDidMount() {
        this.props.getAllUsersLocation();
        console.log(this.state);
    }

    // TO DO: GOOGLE MAP MARKERS NOT WORKING

    createMapMarkers() {
        if (!this.props.all) {
            return null;
        }
        const GoogleMapMarkers = this.props.all.map(marker => {
            return (
                <Marker
                    key={`marker_${marker.id}`}
                    lat={marker.lat}
                    lng={marker.lng}
                    marker={marker}
                />
            );
        });
        return GoogleMapMarkers;
    }

    render() {
        // const { friends } = this.props;
        // const { wannabes } = this.props;
        // const { others } = this.props;
        const { all } = this.props;
        // console.log("In render:", this.props.all);

        return (
            <div
                style={{
                    borderTop: "5px double rgba(0, 188, 212, 0.4)",
                    height: "88vh",
                    display: "-webkit-flex"
                }}
            >
                <GoogleMapReact
                    bootstrapURLKeys={{
                        key: [secrets.googleAPI]
                    }}
                    defaultCenter={this.state.center}
                    defaultZoom={this.state.zoom}
                >
                    <div />
                    {this.createMapMarkers()}
                </GoogleMapReact>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersMap);

function mapStateToProps(state) {
    return {
        all: state.users,
        friends:
            state.users && state.users.filter(friend => friend.status == 2),
        wannabes:
            state.users && state.users.filter(friend => friend.status == 1),
        others:
            state.users &&
            state.users.filter(
                friend => friend.status != 1 && friend.status != 2
            )
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getAllUsersLocation: () => dispatch(getAllUsersLocation())
    };
}
