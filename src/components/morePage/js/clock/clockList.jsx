import React from "react";
import {
    List, Toast, Modal, Switch, Flex
} from 'antd-mobile';
import { WatchWebsocketConnection } from '../../../../helpers/watch_websocket_connection';
import '../../css/clockList.less'
window.ms = null;
export default class clockList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clockList: [],
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var ident = searchArray[0].split('=')[1];
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": ident,
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
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var ident = searchArray[0].split('=')[1];
        var watchId = searchArray[1].split('=')[1];
        var macAddr = searchArray[2].split('=')[1];
        var bindType = searchArray[3].split('=')[1];
        this.setState({
            watchId,
            ident,
            macAddr,
            bindType
        })
        this.getClockList(watchId);
        this.watchListener();

    }


    //消息监听
    watchListener () {
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {
                Toast.info(warnMsg, 1, null, false)
            }, onMessage: function (info) {
                console.log(info, "info")
            }
        };
    }

    //跳转闹钟列表
    toAddClockList = () => {
        var url = WebServiceUtil.mobileServiceURL + "addClock?watchId=" + this.state.watchId + "&userId=" + this.state.ident + "&macAddr=" + this.state.macAddr;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //获取闹钟列表
    getClockList = (watchId) => {
        var param = {
            "method": 'getWatch2gClocksByWatchId',
            "watchId": watchId,
            "actionName": "watchAction",
            "pageNo": -1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.response) {
                    this.setState({
                        clockList: result.response,
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {

            }
        });
    }

    //开关项点击
    offChange = (index, isOpen, data) => {
        if (isOpen == 1) {
            this.state.clockList[index].valid = 0;
            this.setState({
                clockList: this.state.clockList
            })
        } else {
            this.state.clockList[index].valid = 1;
            this.setState({
                clockList: this.state.clockList
            })
        }
        var param = {
            "method": 'switchWatch2gClock',
            "clockId": data.id,
            "isOpen": isOpen == 1 ? 0 : 1,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    var commandJson = {
                        "command": "watch2GClock",
                        data: {
                            "macAddress": this.state.macAddr,
                            "clockStatus": isOpen == 1 ? 0 : 1,
                            "watch2gClock": data,
                        }
                    };
                    console.log(commandJson, "commandJson")
                    ms.send(commandJson);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //跳转编辑页面
    toUpdate = (data) => {
        var url = WebServiceUtil.mobileServiceURL + "updateClock?watchId=" + this.state.watchId + "&id=" + data.id + "&macAddr=" + this.state.macAddr + "&ident=" + this.state.ident;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }
    render () {
        return (
            <div id="clockList" className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">闹钟列表</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className='mask transparent' style={{ display: this.state.bindType == 2 ? "block" : "none" }}>遮罩层</div>
                <div className="commonLocation-cont overScroll">
                    <div className="mask transparent"></div>
                    <div className='grayBorder'></div>
                    <div className="publicList_50">
                        {
                            this.state.clockList.map((v, i) => {
                                return (
                                    <div className='line_public15 bg_white clockItem'>
                                        <span onClick={this.toUpdate.bind(this, v)}>
                                            <span className='time'>{WebServiceUtil.formatHM(v.noticeTime)}</span>
                                            <span>{v.clockType}</span>
                                        </span>
                                        <Switch
                                            checked={v.valid == 1 ? "true" : false}
                                            onChange={this.offChange.bind(this, i, v.valid, v)}
                                        />
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className='addBtn' onClick={this.toAddClockList}></div>
                </div>
            </div>
        )
    }
}



