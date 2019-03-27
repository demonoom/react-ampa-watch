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
        this.setState({
            userId,
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
                            watchId: result.response[0].id,
                            macAddr: result.response[0].macAddress,
                            studentId: result.response[0].studentId
                        }, () => {
                            this.getWatch2gById(this.state.watchId)
                            this.getWatchId(this.state.macAddr)
                            this.WatchList(this.state.watchData)
                        })
                    }
                } else {
                    Toast.fail(result.msg,1,null,false);
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
                if (result.success && result.response) {
                    this.setState({
                        watchId: result.response.id
                    })
                } else {
                    Toast.fail(result.msg,1,null,false);
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
                    Toast.fail(result.msg,1,null,false);
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
                console.log(warnMsg, "warnMsg")
                Toast.info(warnMsg,1,null,false)
            }, onMessage: function (info) {
                console.log(info, "info")
            }
        };
    }

    //找手表
    toFindWatch = () => {
        if (this.state.toBind) {
            Toast.info("请先绑定手表",1,null,false)
            return
        }
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
        if (this.state.toBind) {
            Toast.info("请先绑定手表",1,null,false)
            return
        }
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
        if (this.state.toBind) {
            Toast.info("请先绑定手表",1,null,false)
            return
        }
        var commandJson = {
            "command": "watch2gPushContacts", data: {
                "studentId": this.state.studentId,
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
        if (this.state.toBind) {
            Toast.info("请先绑定手表",1,null,false)
            return
        }
        var commandJson = {
            "command": "watch2gPushWeather",
            data: {
                "macAddress": this.state.macAddr
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    };

    //选择
    onSelect = (opt) => {
        this.setState({
            visible: false,
            watchId: opt.props.macId,
            watchName: opt.props.children
        }, () => {
            this.getWatch2gById(this.state.watchId)
        });
    };

    //气泡
    handleVisibleChange = (visible) => {
        this.setState({
            visible,
        });
    };

      /**
     * 删除弹出框
     */
    showAlert = (event) => {
        event.stopPropagation();
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定解绑吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => this.unbindGuardian() },
        ], phone);
    };

    //解绑监护人
    unbindGuardian = () => {
        var param = {
            "method": 'unbindGuardian',
            "watch2gId": this.state.watchId,
            "guardianId": this.state.userId,
            "actionName": "watchAction"
        };

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info('解绑成功',1,null,false);
                    var data = {
                        method: 'unBindSuccess',
                    };
                    Bridge.callHandler(data, null, function (error) {
                    });
                    this.getWatch2gsByGuardianUserId(this.state.userId);
                } else {
                    Toast.fail(result.msg,1,null,false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    //解绑手表
    deleteWatch2g = () => {
        var param = {
            "method": 'deleteWatch2g',
            "watch2gId": this.state.watchId,
            "guardianId": this.state.userId,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info('解绑成功',1,null,false);
                    this.getWatch2gsByGuardianUserId(this.state.userId);
                } else {
                    Toast.fail(result.msg,1,null,false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    //手表列表
    WatchList = (data) => {
        var watchListData = [];
        data.forEach((v) => {
            watchListData.push(
                (<Item macId={v.id} mac={v.macAddress} key={v.id}>{v.watchName}</Item>)
            );
        });
        this.setState({
            watchListData
        })

    };

    //退出登录
    logout = () => {
        var data = {
            method: 'loginout',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }

    //toJupmBind
    toJupmBind = () => {
        var url = WebServiceUtil.mobileServiceURL + "addWatchInfo?userId=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }


    onImgError = ()=>{
        this.setState({
            imgSrc:"http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png"
        })
    }
    render () {
        return (
            <div id="morePage" className='bg_gray'>
                <div>
                    <Popover mask
                        overlayClassName="fortest"
                        placement="bottomLeft"
                        overlayStyle={{ color: 'currentColor' }}
                        visible={this.state.visible}
                        overlay={this.state.watchListData}
                        align={{
                            overflow: { adjustY: 0, adjustX: 0 },
                            offset: [10, 0],
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
                            <Icon type="down" />
                            <span>{this.state.watchName}</span>
                        </div>
                    </Popover>
                </div>
                <div className='personMsg'>
                    <div className="topPadding"></div>
                    <span className='icon_add' onClick={this.toJupmBind}
                    // style={{ display: this.state.toBind ? "block" : "none" }}
                    >添加手表</span>
                    <div className="clear"></div>
                    <div className="wrap">
                        <img src={this.state.imgSrc} alt="" onError={this.onImgError.bind(this)} />
                        <span className='text_hidden'>
                            {
                                this.state.toBind ? "未绑定" : this.state.watchName
                            }
                        </span>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.toPushClock}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送闹钟</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.toFindWatch}>
                    <div className="am-list-line">
                        <div className="am-list-content">找手表</div>
                    </div>
                </div>
                <div className="grayBorder"></div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.pushWeather}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送天气</div>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.pushContacts}>
                    <div className="am-list-line">
                        <div className="am-list-content">推送监护人</div>
                    </div>
                </div>
                <div className="grayBorder"></div>
                <div style={{display:this.state.toBind ? "none":"flex"}} className='am-list-item am-list-item-middle line_public' onClick={this.showAlert}>
                    <div className="am-list-line">
                        <div className="am-list-content">解绑</div>
                    </div>
                </div>
                <div className='am-list-item am-list-item-middle line_public' onClick={this.logout}>
                    <div className="am-list-line">
                        <div className="am-list-content">退出登录</div>
                    </div>
                </div>
            </div>
        )
    }
}



