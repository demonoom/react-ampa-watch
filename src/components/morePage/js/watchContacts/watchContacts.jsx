import React from "react";
import {
    InputItem, Toast, DatePicker, Popover,
    Modal, Picker, List, Tabs
} from 'antd-mobile';
const Item = Popover.Item;
const alert = Modal.alert;
//消息通信js
var calm;

export default class watchContacts extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            watchData: [],
            watchContactsData: [],

        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watchId = locationSearch.split("&")[0].split('=')[1];
        this.setState({
            watchId,
        })
        this.getWatch2gById(watchId)

    }
    componentDidMount () {
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
                        watchData: result.response,
                        watchContactsData: result.response.guardians,
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

    //删除弹出框
    showAlertDelete (wId, ident) {
        var _this = this;
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定删除?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => calm.toDelete(wId, ident) },
        ], phone);

    }
    //删除
    toDelete = (wid, ident) => {
        var param = {
            "method": 'unbindGuardian',
            "watch2gId": wid,
            "guardianId": ident,
            "actionName": "watchAction"
        };

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info('解绑成功', 1, null, false);
                    var data = {
                        method: 'unBindSuccess',
                    };
                    Bridge.callHandler(data, null, function (error) {
                    });
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
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
            <div id="watchContacts" className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">手表通讯录</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div>
                    <img src={this.state.watchData.student ? this.state.watchData.student.avatar : ""} alt="" />
                    <span>{this.state.watchData.watchName}</span>
                    <span>{this.state.watchData.phoneNumber}</span>
                </div>
                {
                    this.state.watchContactsData.map((v, i) => {
                        console.log(v, "V")
                        return (
                            <div>
                                <img src={v.guardian.avatar} alt="" />
                                <span style={{ display: v.bindType == 1 ? "block" : "none" }}>管理员</span>
                                <span>{v.familyRelate}</span>
                                <span>{v.guardian.colAccount}</span>
                                <span onClick={this.showAlertDelete.bind(this, v.watch2gId, v.guardian.colUid)}
                                    style={{ display: v.bindType == 1 ? "none" : "block" }}
                                >删除</span>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}



