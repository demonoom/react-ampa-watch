import React from "react";
import {WatchWebsocketConnection} from '../../../helpers/watch_websocket_connection';
import "../css/morePage.less"

//消息通信js
window.ms = null;
export default class morePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var sex = locationSearch.split("&")[0].split('=')[1];
        var userId = 23836;
        var macAddr = 1;
        this.getWatchId(macAddr)
        this.setState({
            macAddr,
            userId,
            watchId: 1
        })
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": userId,
                "machineType": "0",
                "version": '1.0',
            }
        };
        ms = new WatchWebsocketConnection();
        console.log(pro, "pro")
        ms.connect(pro);
    }

    componentDidMount() {
        this.watchListener();

    }

    //获取手表id
    getWatchId = (macAddress) => {
        var param = {
            "method": 'getWatch2gByMacAddress',
            "macAddress": macAddress,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                if (result.success && result.response) {
                    this.setState({
                        watchId: result.response.id
                    })
                } else {
                    // Toast.info('');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }


    //消息监听
    watchListener() {
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
                "macAddress": this.state.macAddr
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //推送闹钟
    toPushClock = () => {
        var url = WebServiceUtil.mobileServiceURL + "clockList?userId=" + this.state.userId + "&watchId=" + this.state.watchId;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    /**
     * 推送监护人
     */
    pushContacts = () => {
        var commandJson = {
            "command": "watch2gPushContacts", data: {
                "studentId": this.state.userId,
                "watch2gId": this.state.watchId
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    /**
     * 推送天气
     */
    pushWeather = () => {
        var commandJson = {
            "command": "watch2gPushWeather",
            data: {
                "macAddress": this.state.macAddr
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    };

    render() {
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



