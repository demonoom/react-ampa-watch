import React from "react";

export default class clockList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
    }
    componentDidMount () {

    }
    //跳转闹钟列表
    toAddClockList = () => {
        var url = WebServiceUtil.mobileServiceURL + "addClock";
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    render () {
        return (
            <div id="clockList">
                clockList
                <span onClick={this.toAddClockList}>添加</span>
            </div>
        )
    }
}



