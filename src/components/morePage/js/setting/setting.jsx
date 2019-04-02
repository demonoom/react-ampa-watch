import React from "react";
import {
    Toast, Modal, Popover, NavBar, Icon
} from 'antd-mobile';
const Item = Popover.Item;
const alert = Modal.alert;
var calm;
export default class setting extends React.Component {
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
        var version = locationSearch.split("&")[3].split('=')[1];
        console.log(macAddr, "macAddr")
        this.setState({
            userId,
            watchId,
            macAddr,
            version
        })


    }
    componentDidMount () {

    }


    /**
 * 退出弹出框
 */
    showAlertLogout = (event) => {
        event.stopPropagation();
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定退出登录吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => this.logout() },
        ], phone);
    };


    //退出登录
    logout = () => {
        var data = {
            method: 'loginout',
        };
        console.log(data, "data")
        Bridge.callHandler(data, null, function (error) {
        });
    }
    //清除缓存
    toClearCache = () => {
        var data = {
            method: 'clearCache',
        };
        console.log(data, "data")
        Bridge.callHandler(data, null, function (error) {
        });
    }
    render () {
        return (
            <div id="setting" className='bg_gray publicList_50'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">设置</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className='commonLocation-cont'>
                    <div className='grayBorder'></div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetting}>
                        <div className="am-list-line">
                            <div className="am-list-content">版本号</div>
                            <div className="am-list-extra">{this.state.version}</div>
                        </div>
                    </div>
                    <div onClick={this.toClearCache} className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetting}>
                        <div className="am-list-line">
                            <div className="am-list-content">清除缓存</div>
                            <div className="am-list-extra">{this.state.version}</div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public activeDiv' onClick={this.toSetting}>
                        <div className="am-list-line">
                            <div className="am-list-content">关于</div>
                            <div className="am-list-extra"></div>
                        </div>
                    </div>
                    <div className='submitBtn' onClick={this.showAlertLogout}>退出登录</div>
                </div>
            </div>
        )
    }



}



