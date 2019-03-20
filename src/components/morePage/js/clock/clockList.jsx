import React from "react";
import {
    DatePicker, List, Picker, InputItem, Toast,
    Modal, WhiteSpace, Switch, Checkbox, Flex
} from 'antd-mobile';
import { WatchWebsocketConnection } from '../../../../helpers/watch_websocket_connection';
window.ms = null;
export default class clockList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clockList: []
        };
    }
    componentWillMount () {
        var userId = 23836;
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId":userId,
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
        var watchId = 1;
        this.getClockList(watchId);
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

    getClockList = (watchId) => {
        var param = {
            "method": 'getWatch2gClocksByWatchId',
            "watchId": watchId,
            "actionName": "watchAction",
            "pageNo": -1
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                this.setState({
                    clockList: result.response,
                })
            },
            onError: function (error) {
            }
        });
    }

    offChange = (index, isOpen, id,data) => {
        console.log(isOpen, "isOpen")
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
            "clockId": id,
            "isOpen": isOpen == 1 ? 0 : 1,
            "actionName": "watchAction"
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                
                if (result.success && result.response) {
                    var commandJson = {
                        "command": "watch2GClock", 
                        data: {
                            "macAddress": "1",
                            "clockStatus":isOpen == 1 ? 0 : 1,
                            "watch2gClock":data,
                        }
                    };
                    console.log(commandJson, "commandJson")
                    ms.send(commandJson);
                } else {

                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    render () {
        return (
            <div id="clockList">
                {
                    this.state.clockList.map((v, i) => {
                        return (
                            <div>
                                <span>{WebServiceUtil.formatHM(v.noticeTime)}</span>
                                <span>{v.clockType}</span>
                                <List.Item
                                    extra={<Switch
                                        checked={v.valid == 1 ? "true" : false}
                                        onChange={this.offChange.bind(this, i, v.valid, v.id,v)}
                                    />}
                                >Off</List.Item>
                            </div>
                        )
                    })
                }
                <span onClick={this.toAddClockList}>添加</span>
            </div>
        )
    }
}



