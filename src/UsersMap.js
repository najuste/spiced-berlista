import React from "react";
import { connect } from "react-redux";
import { getAllUsersLocation } from "./actions";
const secrets = require("./../googleMAPI.js");
//
// import MakeFriendsButton from "./MakeFriendsButton";
// import ProfilePic from "./ProfilePic";

import GoogleMapReact from "google-map-react";
//
// const AnyReactComponent = ({ mapplace }) => <div id="map">{mapplace}</div>;
const CustomMarker = ({ text }) => <div>{text}</div>;

class UsersMap extends React.Component {
    constructor() {
        super();
        this.state = {
            center: { lat: 52.52, lng: 13.409 },
            zoom: 12
        };
    }

    componentDidMount() {
        this.props.getAllUsersLocation();
        console.log(this.state);
    }

    render() {
        // const { friends } = this.props;
        // const { wannabes } = this.props;
        // const { others } = this.props;
        const { all } = this.props;
        console.log("In render:", this.props.all);

        const GoogleMapMarkers =
            this.props.all &&
            this.props.all.map(marker => (
                <CustomMarker
                    key={`marker_${marker.id}`}
                    lat={marker.lat}
                    lng={marker.lng}
                    text={marker.firstname}
                />
            ));

        return (
            <div
                style={{
                    height: "88vh",
                    paddingTop: "9em",
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
                </GoogleMapReact>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersMap);

function mapStateToProps(state) {
    console.log("state", state);
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
