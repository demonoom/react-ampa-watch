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
        console.log(pro,"pro")
        ms.connect(pro);
    }
    componentDidMount () {
        this.watchListener();
        // var commandJson = {"command": "message", "data": {"message": messageJson}};
        // ms.send(commandJson);
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
    render () {
        return (
            <div id="morePage">
                <p>找手表</p>
                <p>推送天气</p>
                <p>推送闹钟</p>
                <p>推送监护人</p>
            </div>
        )
    }
}



