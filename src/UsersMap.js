import React from "react";
import { connect } from "react-redux";
import { getAllUsersLocation } from "./actions";
const googleMAPI = require("./../googleMAPI.js");

import { Link } from "react-router-dom";

import ProfilePic from "./ProfilePic";
const defaultpic = "./profilepic.svg";

import GoogleMapReact from "google-map-react";

const Marker = ({ marker }) => {
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
    }

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
        // TODO: render friends, wanabees and other users with different design
        // const { friends } = this.props;
        // const { wannabes } = this.props;
        // const { others } = this.props;
        const { all } = this.props;

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
                        key: [googleMAPI.googleAPI]
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

export default connect(mapStateToProps, mapDispatchToProps)(UsersMap);
