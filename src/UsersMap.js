import React from "react";
import { connect } from "react-redux";
import { getAllUsersLocation } from "./actions";
const googleMAPI = require("./../googleMAPI.js");

import { Link } from "react-router-dom";

import ProfilePic from "./ProfilePic";
const defaultpic = "./profilepic.svg";

import GoogleMapReact from "google-map-react";
import supercluster from "points-cluster";
import styled from "styled-components";

// MARKERS
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

const ClusterMarkerStyle = styled.div`
    display: flex;
    width: ${props => (props.length === 2 ? "45px" : "80px")};
`;
const ClusterMarker = ({ marker }) => {
    console.log("Cluster Marker:", marker);
    return (
        <ClusterMarkerStyle length={this.props.all}>
            {this.props.all.map(marker => (
                <Marker
                    key={marker.id}
                    lat={marker.lat}
                    lng={marker.lng}
                    name={marker.id}
                />
            ))}
        </ClusterMarkerStyle>
    );
};

const MAP = {
    defaultZoom: 12,
    defaultCenter: { lat: 52.52, lng: 13.409 }
};

class UsersMap extends React.Component {
    constructor() {
        super();
        this.state = {
            mapOptions: {
                center: MAP.defaultCenter,
                zoom: MAP.defaultZoom
            },
            clusters: []
        };
        this.createMapMarkers = this.createMapMarkers.bind(this);
        this.createMapClusters = this.createMapClusters.bind(this);
        this.createClusters = this.createClusters.bind(this);
        this.handleMapChange = this.handleMapChange.bind(this);
        this.getClusters = this.getClusters.bind(this);
    }

    componentDidMount() {
        this.props.getAllUsersLocation();
    }
    //function only for the markers
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
    //functions only for the CLUSTERS
    createMapClusters() {
        console.log("In the function createMapClusters");
        if (!this.props.all) {
            return null;
        }

        const GoogleMapMarkers = this.props.all.map(marker => {
            console.log("Marker:", marker);
            if (marker.numPoints === 1) {
                return (
                    <Marker
                        key={marker.id}
                        lat={marker.points[0].lat}
                        lng={marker.points[0].lng}
                    />
                );
            }

            return (
                <ClusterMarker
                    key={marker.id}
                    lat={marker.lat}
                    lng={marker.lng}
                    points={marker.points}
                />
            );
        });
        return GoogleMapMarkers;
    }

    getClusters() {
        console.log("Ggetting clusters from this.props.all", this.props.all);
        const clusters = supercluster(this.props.all, {
            minZoom: 0,
            maxZoom: 16,
            radius: 60
        });

        return clusters(this.state.mapOptions);
    }

    createClusters() {
        console.log("inside create clusters");
        this.setState({
            clusters: this.state.mapOptions.bounds
                ? this.getClusters().map(({ wx, wy, numPoints, points }) => ({
                      lat: wy,
                      lng: wx,
                      numPoints,
                      id: `${numPoints}_${points[0].id}`,
                      points
                  }))
                : []
        });
        console.log("State was updated:", this.state);
    }
    handleMapChange({ center, zoom, bounds }) {
        console.log("handleMapChange", this.state);
        this.setState(
            {
                mapOptions: {
                    center,
                    zoom,
                    bounds
                }
            },
            () => {
                this.createClusters(this.props.all);
            }
        );
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
                    defaultCenter={MAP.defaultCenter}
                    defaultZoom={MAP.defaultZoom}
                    onChange={this.handleMapChange}
                >
                    {this.createMapMarkers()}
                </GoogleMapReact>
            </div>
        );
    }
}
//within google map react
//{this.createMapMarkers()} // option with markers only
// still under implementation
//{this.createMapClusters()} /// for clusters

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
