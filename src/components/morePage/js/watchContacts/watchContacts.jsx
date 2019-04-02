import React from "react";
import QRCode from 'qrcode.react';
import {
    InputItem, Toast, DatePicker, Popover,
    Modal, Picker, List, Tabs
} from 'antd-mobile';
import '../../css/watchContacts.less'
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
        var bindType = locationSearch.split("&")[1].split('=')[1];
        this.setState({
            watchId, bindType
        })
        this.getBindedGuardianByWatch2gId(watchId)

    }
    componentDidMount () {
    }
    //根据手表ID获取手表信息
    getBindedGuardianByWatch2gId = (watchId) => {
        var param = {
            "method": 'getBindedGuardianByWatch2gId',
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
                    Toast.info('删除成功', 1, null, false);
                    var data = {
                        method: 'unBindSuccess',
                    };
                    Bridge.callHandler(data, null, function (error) {
                    });
                    this.getBindedGuardianByWatch2gId(this.state.watchId)
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
                <div className="contactBg">
                    <div className="am-navbar am-navbar-blue whiteBack">
                        <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">手表通讯录</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="p15">
                        <div className='mainItem'>
                            <div className="icon_bg"><img src={this.state.watchData.student ? this.state.watchData.student.avatar : ""} alt="" /></div>
                            <span className='text_hidden relate'>{this.state.watchData.watchName}</span>
                            <span className='text_hidden tel'>{this.state.watchData.phoneNumber}</span>
                        </div>
                    </div>
                </div>
                <div className="contactCont overScroll">
                    <div className='mask transparent' style={{ display: this.state.bindType == 2 ? "block" : "none" }}></div>
                    {
                        this.state.watchContactsData.map((v, i) => {
                            return (
                                <div className='item'>
                                    <img src={v.guardian.avatar} alt="" />
                                    <div className="line_public my_flex">
                                        <div>
                                            <div className='my_flex relateName'>
                                                <span
                                                // className='relate text_hidden'
                                                >{v.familyRelate}</span>
                                                <span className='tag' style={{ display: v.bindType == 1 ? "inline-block" : "none" }}>管理员</span>
                                            </div>
                                            <div className='tel'>{v.guardian.colAccount}</div>
                                        </div>
                                    </div>
                                    {
                                        this.state.bindType == 2 ?
                                            ""
                                            :
                                            <div className='deleteBtn' onClick={this.showAlertDelete.bind(this, v.watch2gId, v.guardian.colUid)}
                                                style={{ display: v.bindType == 1 ? "none" : "block" }}
                                            >删除</div>
                                    }

                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}



