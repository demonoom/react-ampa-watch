import React from "react";
import { WatchWebsocketConnection } from '../../../helpers/watch_websocket_connection';
import "../css/morePage.less"
import {
    Toast, Modal, Popover, NavBar, Icon
} from 'antd-mobile';
const Item = Popover.Item;
const alert = Modal.alert;
//消息通信js
window.ms = null;
export default class morePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgSrc: "",
            watchName: "",
            visible: false,
            selected: '',
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var macAddr = locationSearch.split("&")[1].split('=')[1];
        var watchId = locationSearch.split("&")[2].split('=')[1];
        this.getWatchId(macAddr)
        this.setState({
            macAddr,
            userId,
            watchId: watchId
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
        ms.connect(pro);
        this.getWatch2gsByGuardianUserId(userId);

    }
    componentDidMount () {
        this.watchListener();
    }
    //获取手表列表
    getWatch2gsByGuardianUserId = (userId) => {
        var param = {
            "method": 'getWatch2gsByGuardianUserId',
            "userId": userId,
            "pageNo": -1,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "123")
                if (result.success) {
                    if (result.response.length == 0) {
                        this.setState({
                            toBind: true,
                        })
                    } else {
                        this.setState({
                            watchData: result.response,
                            imgSrc: result.response[0].student.avatar,
                            watchName: result.response[0].watchName,
                            watchId: result.response[0].id
                        }, () => {
                            this.getWatch2gById(this.state.watchId)
                        })
                    }
                } else {
                    // Toast.info('');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
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
    //根据手表ID获取手表信息
    getWatch2gById = (watchId) => {
        var param = {
            "method": 'getWatch2gById',
            "watchId": watchId,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    this.setState({
                        imgSrc: result.response.student.avatar,
                        watchName: result.response.watchName,
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
                "macAddress": this.state.macAddr
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //推送闹钟
    toPushClock = () => {
        var url = WebServiceUtil.mobileServiceURL + "clockList?userId=" + this.state.userId + "&watchId=" + this.state.watchId + "&macAddr=" + this.state.macAddr;
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

    onSelect = (opt) => {
        this.setState({
            visible: false,
            selected: opt.props.value,
        }, () => {
            console.log(this.state.selected);

        });
    };
    handleVisibleChange = (visible) => {
        this.setState({
            visible,
        });
    };

    render () {
        console.log(this.state.toBind,"totoo")
        return (
            <div id="morePage">
                <div style={{ display: "none" }}>
                    <Popover mask
                        overlayClassName="fortest"
                        overlayStyle={{ color: 'currentColor' }}
                        visible={this.state.visible}
                        overlay={[
                            (<Item key="4" value="scan" icon="" data-seed="logId">Scan</Item>),
                            (<Item key="5" value="special" icon="" style={{ whiteSpace: 'nowrap' }}>My Qrcode</Item>),
                            (<Item key="6" value="button ct" icon="">
                                <span style={{ marginRight: 5 }}>Help</span>
                            </Item>),
                        ]}
                        align={{
                            overflow: { adjustY: 0, adjustX: 0 },
                            offset: [-100, 0],
                        }}
                        onVisibleChange={this.handleVisibleChange}
                        onSelect={this.onSelect}
                    >
                        <div style={{
                            height: '100%',
                            padding: '0 15px',
                            marginRight: '-15px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        >
                            <Icon type="ellipsis" />ppp
                    </div>
                    </Popover>
                </div>
                <div>
                    <span>添加</span>
                    <img src={this.state.imgSrc} alt="" />
                    {
                        this.state.toBind ? "未绑定":this.state.watchName
                    }
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.toFindWatch}>
                    <div className="am-list-line">
                        <div className="am-list-content">找手表</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.pushWeather}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送天气</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.toPushClock}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送闹钟</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.pushContacts}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送监护人</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>
            </div>
        )
    }
}



