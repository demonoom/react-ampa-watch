import React from "react";
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
        var loginIdent = locationSearch.split("&")[2].split('=')[1];
        this.setState({
            watchId, bindType,loginIdent
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
                if (result.success) {
                    this.setState({
                        watchData: result.response,
                    });
                    this.buildPerson(result.response)
                    this.buildWatchContactsData(result.response.guardians)
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    };
    buildPerson = (data) => {
        var personDiv = <div className="contactBg">
            <div className='mainItem'>
                <div className="icon_bg">
                    <img
                        className="imgP"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "http://60.205.86.217/upload9/2019-03-27/11/e4119535-3a05-4656-9b9f-47baa348392e.png?size=100x100"
                        }}
                        src={data.student ? data.student.avatar + "?size=100x100" : ""}
                        alt="" /></div>
                <span className='text_hidden relate'>{data.watchName}</span>
                <span className='text_hidden tel'>{data.phoneNumber}</span>
            </div>
        </div>
        this.setState({
            personDiv
        })
    }

    //跳转通讯录详情
    toContactDetail=(data)=>{
        var url = WebServiceUtil.mobileServiceURL + "contactDetail?id=" + data.guardianId+"&bindType="+data.bindType+"&watchId="+this.state.watchId+"&loginIdent="+this.state.loginIdent
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    buildWatchContactsData = (data) => {
        var watchContactsData = [];
        data.map((v, i) => {
            watchContactsData.push(
                <div className='item' onClick={this.toContactDetail.bind(this,v)}>
                    <i className='icon_arrow'></i>
                    <img
                        className="imgChild"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "http://www.maaee.com/Excoord_For_Education/userPhoto/default_avatar.png?size=100x100"
                        }}
                        src={v.guardian.avatar + "?size=100x100"}
                        alt="" />
                    <div className="line_public my_flex">
                        <div className='textCont'>
                            <div className='my_flex relateName'>
                                <span className='relate text_hidden'>{v.familyRelate}</span>
                                {/* <span className='code'></span> */}
                                <span className='tag'
                                    style={{ display: v.bindType == 1 ? "block" : "none" }}>管理员</span>
                                <span className='tag redTag'
                                      style={{ display: v.bindType == 1 ? "block" : "none" }}>SOS</span>
                            </div>
                            <div className='tel text_hidden'>{v.guardian.colAccount}</div>
                        </div>
                    </div>
                   {/* {
                        this.state.bindType == 2 ?
                            ""
                            :
                            <div className='deleteBtn'
                                onClick={this.showAlertDelete.bind(this, v.watch2gId, v.guardian.colUid)}
                                style={{ display: v.bindType == 1 ? "none" : "block" }}
                            >删除</div>
                    }*/}
                </div>
            )
        });
        this.setState({ watchContactsData })
    };

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
    };

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    };

    //二维码
    toShowCode = (macAddr) => {
        $('.codePop').show();
        $("#qrcode").html("");
        $('#qrcode').qrcode(macAddr);
    };

    //关闭弹窗
    toClosePop = () => {
        $('.codePop').hide();
    }

    render () {
        return (
            <div id="watchContacts" className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">手表通讯录</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont overScroll">
                    <div className='mask transparent'
                        style={{ display: this.state.bindType == 2 ? "block" : "none" }}></div>
                    <div>
                        {this.state.personDiv}
                    </div>
                    <div>{this.state.watchContactsData}</div>
                </div>
                <div className='addBtn' onClick={this.toShowCode.bind(this, this.state.watchData.macAddress)}>添加联系人</div>
                <div className='codePop'>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toClosePop}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">添加联系人</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className='commonLocation-cont'>
                        <div className="grayBorder"></div>
                        <div className='icon_code'>
                            <div id="qrcode"></div>
                            <div className='dec'>{this.state.watchData.watchName}的二维码</div>
                        </div>
                        <div className="warning">
                            <span>提示</span>
                            扫码下载APP并安装后再次扫描该二维码在管理员同意后即可绑定手表加入家庭。
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}



