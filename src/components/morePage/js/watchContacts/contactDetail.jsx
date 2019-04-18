import React from "react";
import {
    Switch,
    Modal,
} from 'antd-mobile';

const alert = Modal.alert;
//消息通信js
var calm;

export default class contactDetail extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            isSOS: false,
            personData: {}
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var guardianId = locationSearch.split("&")[0].split('=')[1];
        var bindType = locationSearch.split("&")[1].split('=')[1];
        var watchId = locationSearch.split("&")[2].split('=')[1];
        var loginIdent = locationSearch.split("&")[3].split('=')[1];
        this.setState({
            guardianId, bindType, watchId, loginIdent
        })
        this.getWatch2gGuardianByGuardianId(watchId, guardianId)

    }

    componentDidMount () {
    }

    //根据手表ID获取手表信息
    getWatch2gGuardianByGuardianId = (watchId, guardianId) => {
        var param = {
            "method": 'getWatch2gGuardianByGuardianId',
            "watchId": watchId,
            "guardianId": guardianId,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    this.setState({
                        personData: result.response
                    })
                    this.buildPerson(result.response)
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
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

    //开关项点击
    offChange = (i) => {
        this.setState({
            isSOS: i
        })
        console.log(i, "i")
        // if (isOpen == 1) {
        //     this.state.clockList[index].valid = 0;
        //     this.setState({
        //         clockList: this.state.clockList
        //     })
        // } else {
        //     this.state.clockList[index].valid = 1;
        //     this.setState({
        //         clockList: this.state.clockList
        //     })
        // }
        // var param = {
        //     "method": 'switchWatch2gClock',
        //     "clockId": data.id,
        //     "isOpen": isOpen == 1 ? 0 : 1,
        //     "actionName": "watchAction"
        // };
        // WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
        //     onResponse: (result) => {
        //         if (result.success && result.response) {
        //            this.useabledData(this.state.watchId,isOpen)
        //         } else {
        //             Toast.fail(result.msg, 1, null, false);
        //         }
        //     },
        //     onError: function (error) {
        //         Toast.info('请求失败');
        //     }
        // });
    }
    //跳转编辑页面
    toUpdatePersonData = () => {
        var url = WebServiceUtil.mobileServiceURL + "pCenter?loginIdent=" + this.state.loginIdent;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    //
    buildPerson = (v) => {
        console.log(v, "v")
        var personDetail = <div>
            <div className='am-list-item am-list-item-middle line_public15'>
                <div className="am-list-line photo">
                <div className="am-list-content">头像</div>
                <img
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "http://www.maaee.com/Excoord_For_Education/userPhoto/default_avatar.png?size=100x100"
                    }}
                    src={v.guardian.avatar} alt="" />
                </div>
            </div>
            <div className='am-list-item am-list-item-middle line_public15'>
                <div className="am-list-line">
                    <div className="am-list-content">关系</div>
                    <div className="am-list-extra">
                        {v.familyRelate}
                    </div>
                </div>
            </div>
            <div className='am-list-item am-list-item-middle line_public15'>
                <div className="am-list-line">
                    <div className="am-list-content">类型</div>
                    <div className="am-list-extra">
                        {v.bindType == 1 ? "管理员" : "家庭成员"}
                    </div>
                </div>
            </div>
            <div className='am-list-item am-list-item-middle line_public15'>
                <div className="am-list-line">
                    <div className="am-list-content">手机号码</div>
                    <div className="am-list-extra">
                        {v.guardian.phoneNumber}
                    </div>
                </div>
            </div>
        </div>
        this.setState({
            personDetail
        })
    }


    render () {
        console.log(this.state.personData.bindType, "this.state.personData.bindType")
        return (
            <div id="studentInfo" className='bg_gray publicList_50'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">详细资料</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="grayBorder"></div>
                <div>
                    {
                        this.state.personDetail
                    }
                    <div className='am-list-item am-list-item-middle line_public' style={{display: (this.state.loginIdent != this.state.guardianId) && this.state.bindType == 2 ? "none":"flex"}}>
                        <div className="am-list-line">
                            <div className="am-list-content">设为紧急联系人</div>
                            <Switch
                                checked={this.state.isSOS}
                                onChange={this.offChange.bind(this)}
                            />
                        </div>
                    </div>
                    {

                        this.state.loginIdent == this.state.guardianId ?
                            <div className='submitBtn' onClick={this.toUpdatePersonData}>编辑个人资料</div>
                            :
                            ""
                    }
                    {
                        (this.state.loginIdent != this.state.guardianId) && this.state.bindType == 1 ?
                            <div className='submitBtn'>删除</div>
                            :
                            ""
                    }

                </div>
            </div>
        )
    }
}



