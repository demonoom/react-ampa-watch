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
var calm;
export default class morePage extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            childSex: "",
            watchName: "",
            visible: false,
            selected: '',
            guardians: [],
            bindType: "",  //bindType==1  是主监护人  2是副监护人   //valid==1是正常  == 2是未通过
            guardianData: {},
            watchData: [],
            manageData: []
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var version = locationSearch.split("&")[1].split('=')[1];
        this.setState({
            userId,
            version
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
        $(".pullToRefresh .loading").html("松开即可刷新")
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
                        }, () => {
                            $(".moreList").show();
                        })
                    } else {
                        result.response[0].guardians.forEach((v, i) => {
                            if (v.guardian.colUid == this.state.userId) {
                                this.setState({
                                    guardianData: v,
                                }, () => {
                                    $(".moreList").show();
                                })
                            }
                        })
                        this.setState({
                            watchData: result.response,
                            childSex: result.response[0].childSex,
                            watchName: result.response[0].watchName,
                            manageData: result.response[0].guardians[0],
                            phoneNumber: result.response[0].phoneNumber,
                            watchId: result.response[0].id,
                            macAddr: result.response[0].macAddress,
                            studentId: result.response[0].studentId,
                        }, () => {
                            this.getWatch2gById(this.state.watchId)
                            this.getWatchId(this.state.macAddr)
                            this.WatchList(this.state.watchData)
                        })
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
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
                if (result.success) {
                    this.setState({
                        watchId: result.response.id
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
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
                        childSex: result.response.childSex,
                        watchName: result.response.watchName,
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
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
                Toast.info(warnMsg, 1, null, false)
            }, onMessage: function (info) {
                console.log(info, "infoWatch")
                if (info.command == "userOperateResponse") {
                    calm.getWatch2gsByGuardianUserId(calm.state.userId);
                    calm.state.watchData.forEach((value, i) => {
                        if (value.id == info.data.watchId) {
                            calm.setState({
                                guardians: value.guardians,
                                studentId: value.studentId,
                                manageData: value.guardians[0],
                            }, () => {
                                calm.state.guardians.forEach((v, i) => {
                                    if (v.guardian.colUid == calm.state.userId) {
                                        calm.setState({
                                            guardianData: v,
                                        }, () => {
                                            $(".moreList").show();
                                            calm.setState({
                                                visible: false,
                                                phoneNumber: value.phoneNumber,
                                                watchId: value.id,
                                                watchName: value.watchName,
                                                macAddr: value.macAddress
                                            }, () => {
                                                calm.getWatch2gById(calm.state.watchId)
                                            });
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            }
        };
    }

    //找手表
    toFindWatch = () => {
        var commandJson = {
            "command": "findWatch2GAction", data: {
                "macAddress": this.state.macAddr
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //推送闹钟
    toPushClock = () => {
        var url = WebServiceUtil.mobileServiceURL + "clockList?userId=" + this.state.userId + "&watchId=" + this.state.watchId + "&macAddr=" + this.state.macAddr + "&bindType=" + this.state.guardianData.bindType
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
        this.state.watchData.forEach((v, i) => {
            if (v.id == opt.props.macId) {
                this.setState({
                    guardians: v.guardians,
                    studentId: v.studentId,
                    manageData: v.guardians[0],
                }, () => {
                    this.state.guardians.forEach((v, i) => {
                        if (v.guardian.colUid == this.state.userId) {
                            this.setState({
                                guardianData: v,
                            }, () => {
                                $(".moreList").show();
                                this.setState({
                                    visible: false,
                                    phoneNumber: opt.props.phoneNumber,
                                    watchId: opt.props.macId,
                                    watchName: opt.props.children,
                                    macAddr: opt.props.mac
                                }, () => {
                                    this.getWatch2gById(this.state.watchId)
                                });
                            })
                        }
                    })
                })
            }
        })

    };

    //气泡
    handleVisibleChange = (visible) => {
        this.setState({
            visible,
        });
    };




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
                    Toast.info('解绑成功', 1, null, false);
                    this.getWatch2gsByGuardianUserId(this.state.userId);
                } else {
                    Toast.fail(result.msg, 1, null, false);
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
                (<Item style={{ color: '#333' }} phoneNumber={v.phoneNumber} macId={v.id} mac={v.macAddress} key={v.id}>{v.watchName}</Item>)
            );
        });
        this.setState({
            watchListData
        })

    };


    //toJupmBind
    toJupmBind = () => {
        var url = WebServiceUtil.mobileServiceURL + "addWatchInfo?userId=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            navType: 2,
            url: url,
            backAlertInfo: "是否放弃本次编辑？"
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //跳转学生名片
    toStudentInfo = () => {
        var url = WebServiceUtil.mobileServiceURL + "studentInfo?watchId=" + this.state.watchId + "&bindType=" + this.state.guardianData.bindType
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url,
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //跳转手表通讯录
    toWatchContacts = () => {
        var url = WebServiceUtil.mobileServiceURL + "watchContacts?watchId=" + this.state.watchId + "&bindType=" + this.state.guardianData.bindType + "&loginIdent=" + this.state.userId
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url,
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    //爱心奖励设置
    toSetStar = () => {
        var url = WebServiceUtil.mobileServiceURL + "loveRewards?watchId=" + this.state.watchId + "&studentId=" + this.state.studentId + "&bindType=" + this.state.guardianData.bindType
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url,
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //跳转解绑页面
    toUnbind = () => {
        var url = WebServiceUtil.mobileServiceURL + "bindAndUnbind?watchId=" + this.state.watchId + "&studentId=" + this.state.userId + "&macAddr=" + this.state.macAddr + "&watchName=" + this.state.watchName + "&sId=" + this.state.studentId
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url,
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    //跳转设置页面
    toSetting = () => {
        var url = WebServiceUtil.mobileServiceURL + "setting?watchId=" + this.state.watchId + "&studentId=" + this.state.userId + "&macAddr=" + this.state.macAddr + "&version=" + this.state.version+ "&studentId=" + this.state.studentId
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url,
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }



    //toPushLove推送爱心排行
    toPushLove = () => {
        var commandJson = {
            "command": "Watch2GRanking", data: {
                "studentId": this.state.studentId,
                "rankingType": 1
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }
    //toPushStep推送运动排行
    toPushStep = () => {
        var commandJson = {
            "command": "Watch2GRanking", data: {
                "studentId": this.state.studentId,
                "rankingType": 2
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //toPushAnswer推送答题排行
    toPushAnswer = () => {
        var commandJson = {
            "command": "Watch2GRanking", data: {
                "studentId": this.state.studentId,
                "rankingType": 3
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //toPushQuickReply推送快捷回复
    toPushQuickReply = () => {
        var commandJson = {
            "command": "TestPushReply", data: {
                "watch2gId": this.state.watchId
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //toPushSchedule推送课程表
    toPushSchedule = () => {
        var commandJson = {
            "command": "TestPushTimeTable", data: {
                "watch2gId": this.state.watchId
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }

    //开启GPStoOpenGPS
    toOpenGPS = () => {
        var commandJson = {
            "command": "Watch2GPushGPS", data: {
                "watch2gId": this.state.watchId
            }
        };
        console.log(commandJson, "commandJson")
        ms.send(commandJson);
    }


    render () {
        return (
            <div id="morePage" className='bg_gray publicList_50'>

                <div className='watchSelect am-navbar-blue' style={{ display: this.state.toBind ? "none" : "block" }}>
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
                        <div className='watchSelectBtn'
                        >
                            <span className="icon-back"></span>
                            <span className='text_hidden watchName'>{this.state.watchName}</span>
                        </div>
                    </Popover>
                </div>
                <div className='personMsg'>
                    <div className="topPadding"></div>
                    <span className='icon_add' onClick={this.toJupmBind}
                        style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "block" }}
                    >添加手表</span>
                    <div className="wrap">
                        <img src={this.state.childSex == "女" ? "http://60.205.86.217/upload9/2019-03-27/11/33ac8e20-5699-4a94-a80c-80adb4f050e3.png" : "http://60.205.86.217/upload9/2019-03-27/11/e4119535-3a05-4656-9b9f-47baa348392e.png"} alt="" />
                        {

                            this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "待绑定" : <div><span className='text_hidden'>{this.state.watchName}</span><div className='text_hidden relation'>我与宝贝的关系：{this.state.guardianData.familyRelate} ( {this.state.phoneNumber} )</div></div>
                        }
                    </div>
                </div>
                <div className='moreList overScroll' style={{ display: "none" }}>
                    <div className="grayBorder"></div>
                    <div
                        style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }}
                        onClick={this.toStudentInfo} className='icon_card am-list-item am-list-item-middle line_public15 activeDiv'>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">学生名片</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div
                        style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }}
                        onClick={this.toWatchContacts} className='icon_contact am-list-item am-list-item-middle line_public15 activeDiv'
                    >
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">手表通讯录</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_clock am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toPushClock}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">设置闹钟</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div
                        style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }}
                        onClick={this.toSetStar} className='icon_heart am-list-item am-list-item-middle line_public activeDiv'>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">爱心奖励</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div className="grayBorder" style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "block" }}></div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_find am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toFindWatch}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">找手表</div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_find am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.pushWeather}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送天气</div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_find am-list-item am-list-item-middle line_public activeDiv' onClick={this.pushContacts}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送监护人</div>
                        </div>
                    </div>
                    <div className="grayBorder" style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }}></div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_find am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toPushLove}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送爱心排行</div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_find am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toPushStep}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送运动排行</div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_find am-list-item am-list-item-middle line_public activeDiv' onClick={this.toPushAnswer}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送答题排行</div>
                        </div>
                    </div>
                    {/* <div className="grayBorder" style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }}></div> */}
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_bind am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toPushSchedule}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送课程表</div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_bind am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toPushQuickReply}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">推送快捷回复</div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_bind am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toOpenGPS}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">开启GPS</div>
                        </div>
                    </div>
                    <div className="grayBorder"></div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "flex" : "none" }} className='icon_addWatch am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toJupmBind}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">添加手表</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "flex" }} className='icon_bind am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toUnbind}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">绑定与解绑</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div className='icon_setting am-list-item am-list-item-middle line_public activeDiv' onClick={this.toSetting}>
                        <i></i>
                        <div className="am-list-line">
                            <div className="am-list-content">设置</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div className="grayBorder"></div>
                    {/*绑定后未验证空页面*/}
                    <div className="personEmptyCont" style={{ display: calm.state.toBind || ((this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) == false) ? "none" : "block" }}>
                        <div className="emptyCont emptyContBind">
                            <div className="p38 my_flex">
                                <div>
                                    <i></i>
                                    <span>
                                        申请已提交<br />
                                        请等待管理员（{this.state.manageData.familyRelate} ）验证通过
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



