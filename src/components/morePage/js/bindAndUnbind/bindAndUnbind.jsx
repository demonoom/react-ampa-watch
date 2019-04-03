import React from "react";
import {
    Toast, Modal, Popover, NavBar, Icon
} from 'antd-mobile';
import '../../css/bindAndUnbind.less'
const Item = Popover.Item;
const alert = Modal.alert;
var calm;
export default class bindAndUnbind extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {

        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watchId = locationSearch.split("&")[0].split('=')[1];
        var userId = locationSearch.split("&")[1].split('=')[1];
        var macAddr = locationSearch.split("&")[2].split('=')[1];
        var watchName = locationSearch.split("&")[3].split('=')[1];
        var studentId = locationSearch.split("&")[4].split('=')[1];
        console.log(macAddr, "macAddr")
        this.setState({
            userId,
            watchId,
            macAddr,
            watchName,
            studentId
        })


    }
    componentDidMount () {
        this.showCode(this.state.macAddr)

    }


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
                    Toast.info('解绑成功', 1, null, false);
                    var data = {
                        method: 'unBindSuccess',
                        studentId:this.state.studentId
                    };
                    console.log(data, "data")
                    Bridge.callHandler(data, null, function (error) {
                    });
                    setTimeout(() => {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        console.log(data, "data")
                        Bridge.callHandler(data, null, function (error) {
                        });
                    }, 500)
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    showCode (macAddr) {
        $("#qrcode").html("");
        $('#qrcode').qrcode(macAddr);
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
            <div id="bindAndUnbind" className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">绑定与解绑</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont">
                    <div className='icon_code'>
                        <div id="qrcode"></div>
                        <div className='dec'>{this.state.watchName}的二维码</div>
                    </div>
                    <div className='submitBtn' onClick={this.showAlert}>解除绑定</div>
                </div>
            </div>
        )
    }

}



