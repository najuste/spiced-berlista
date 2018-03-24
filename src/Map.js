import React from "react";
import { connect } from "react-redux";
import { getAllUsersLocation } from "./actions";

import MakeFriendsButton from "./MakeFriendsButton";
import ProfilePic from "./ProfilePic";

import { Map, TileLayer, Marker, Popup } from '../../src'


class UsersMap extends React.Component {
    constructor(){
        this.state={
            lat: 51.505,
            lng: -0.09,
            zoom: 13,
        }
    }
    componentDidMount() {
        this.props.getAllUsersLocation();
        initMap([59, 0], 2);
    }

    render() {

        const position = [this.state.lat, this.state.lng]

        const defaultpic = "./profilepic.svg";

        const { friends } = this.props;
        const { wannabes } = this.props;
        const { others } = this.props;

        return (
            <div>
                <h1>test</h1>
                {friends}
            </div>
            <div id="map">
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("state", state);
    return {
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
        // updateFriendship: (id, status) => dispatch(updateFriendship(id, status))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersMap);

var map = L.map('map').setView([51.505, -0.09], 13);

// var map;
// function initMap(coor, z) {
//     map = L.map("map", {
//         zoomControl: false,
//         attributionControl: false
//     }).setView(coor, z);
//
//     var Stamen_Toner = L.tileLayer(
//         "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}",
//         {
//             attribution:
//                 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//             subdomains: "abcd",
//             minZoom: 0,
//             maxZoom: 20,
//             ext: "png"
//         }
//     );
//     Stamen_Toner.addTo(map);
//     map.scrollWheelZoom.disable();
//
//     setMapRect();
//     window.onresize = function() {
//         setMapRect();
//     };
// }
//
// function setMapRect() {
//     document.getElementById('map')
//         .height(window.innerHeight - 100)
//         .width(window.innerWidth);
//     map.invalidateSize();
//     //console.log("window size:", $(window).height(), $(window).width());
// }
