import React from "react";
import {
    Toast
} from 'antd-mobile';
import { WatchWebsocketConnection } from '../../../../helpers/watch_websocket_connection';
//消息通信js
window.ms = null;
export default class pushPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var watchId = locationSearch.split("&")[1].split('=')[1];
        var macAddr = locationSearch.split("&")[2].split('=')[1];
        var studentId = locationSearch.split("&")[3].split('=')[1];
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": userId,
                "machineType": "0",
                "version": '1.0',
            }
        };
        ms = new WatchWebsocketConnection();
        ms.connect(pro);
    }

    //消息监听
    watchListener () {
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {
                console.log(warnMsg, "warnMsg")
                Toast.info(warnMsg, 1, null, false)
            }, onMessage: function (info) {
                console.log(info, "infoWatch")

            }
        }
    };

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });


    }
    //推送课程表
    toPushSchedule = () => {
        var commandJson = {
            "command": "TestPushTimeTable", data: {
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


    /**
   * 推送监护人
   */
    pushContacts = () => {
        var commandJson = {
            "command": "watch2gPushContacts", data: {
                "studentId": this.state.studentId,
                "watch2gId": this.state.watchId
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    render () {
        return (
            <div id="refreshWatch" className='bg_gray publicList_50'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">刷新手表信息</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className='icon_bind am-list-item am-list-item-middle line_public15' onClick={this.pushWeather}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送天气</div>
                        <div className="am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <div className='icon_bind am-list-item am-list-item-middle line_public15' onClick={this.pushContacts}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送联系人</div>
                        <div className="am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <div className='icon_bind am-list-item am-list-item-middle line_public15' onClick={this.toPushSchedule}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送课程表</div>
                        <div className="am-list-arrow-horizontal"></div>
                    </div>
                </div>
            </div>
        )
    }
}



