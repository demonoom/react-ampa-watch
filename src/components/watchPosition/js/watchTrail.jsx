import React from "react";
import {Map} from "react-amap";
import {Toast} from 'antd-mobile';
import {WatchWebsocketConnection} from '../../../helpers/watch_websocket_connection'

export default class watchTrail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        // var locationHref = decodeURI(window.location.href);
        // var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        // var userId = locationSearch.split("&")[0].split('=')[1];
        // var mac = locationSearch.split("&")[1].split('=')[1];
        // this.setState({userId, mac});

    }

    componentDidMount() {

    }

    render() {

        return (
            <div id="watchTrail" style={{height: '100%'}}>
                watchTrail
            </div>
        )
    }
}



