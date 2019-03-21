import React from "react";

export default class chooseLocation extends React.Component {
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
            <div id="chooseLocation">
                选择地点
            </div>
        )
    }
}



