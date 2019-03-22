import React from "react";

export default class commonLocation extends React.Component {
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

    addNewPos = () => {
        var url = WebServiceUtil.mobileServiceURL + "addNewLocation";
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    render() {

        return (
            <div id="commonLocation">
                <div onClick={this.addNewPos}>添加新地点</div>
            </div>
        )
    }
}



