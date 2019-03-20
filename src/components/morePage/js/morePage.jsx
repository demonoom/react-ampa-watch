import React from "react";
import { WatchWebsocketConnection } from '../../../helpers/watch_websocket_connection';
import "../css/morePage.less"

//消息通信js
window.ms = null;
export default class morePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var sex = locationSearch.split("&")[0].split('=')[1];
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": 23836,
                "machineType": "0",
                "version": '1.0',
                // "webDevice": WebServiceUtil.createUUID()
            }
        };
        ms = new WatchWebsocketConnection();
        console.log(pro, "pro")
        ms.connect(pro);
    }
    componentDidMount () {
        this.watchListener();

    }

    //消息监听
    watchListener () {
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                console.log(info, "info")
            }
        };
    }
    //找手表
    toFindWatch = () => {
        var commandJson = {
            "command": "searchWatch2GAction", data: {
                "macAddress": "1"
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //推送闹钟
    toPushClock = () => {
        var url = WebServiceUtil.mobileServiceURL + "clockList";
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    pushContacts = () =>{
        var commandJson = {
            "command": "watch2gPushContacts", data: {
                "studentId": "",
                "watch2gId": ""
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    pushWeather = () =>{
        var commandJson = {
            "command": "pushWeather", data: {
                "watch2gId": ""
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    render () {
        return (
            <div id="morePage">
                <p onClick={this.toFindWatch}>找手表</p>
                <p onClick={this.pushWeather}>推送天气</p>
                <p onClick={this.toPushClock}>推送闹钟</p>
                <p onClick={this.pushContacts}>推送监护人</p>
            </div>
        )
    }
}



