import React from "react";
import {
    Toast, Modal, Popover, NavBar, Icon
} from 'antd-mobile';
import ReactPullToRefresh from "react-pull-to-refresh";
import { callbackify } from "util";
import "./setting.less"

const Item = Popover.Item;
const alert = Modal.alert;
var calm;

export default class setting extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            flag: true
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
        $(".loading").html("下拉可以刷新");
        $(".loading").show();
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
        console.log("opopop")
        var data = {
            method: 'clearCache',
        };
        console.log(data, "data")
        Bridge.callHandler(data, null, function (error) {
        });
    }

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        })
    }


    toPCenter = () => {
        var url = WebServiceUtil.mobileServiceURL + "pCenter?userid=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }


    handleRefresh = (resolve, reject) => {
        if (this.state.flag) {
            $(".loading").html("正在刷新");
        }
        // this.setState({
        //     flag: false
        // }, () => {
        //     $(".loading").html("刷新完成");
        //     setTimeout(() => {
        //         $(".loading").hide();
        //     }, 30000);
        // })
        // do some async code here
        // if (success) {
        //   resolve();
        // } else {
        //   reject();
        // }
    }


    render () {
        return (
            <div id="setting" className='bg_gray publicList_50' >
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">设置</span>
                    <span className="am-navbar-right"></span>
                </div>
                {/* <div id="ptr">
                    <span class="genericon genericon-next"></span>
                    <div class="loading">
                        <span id="l1">1</span>
                        <span id="l2">2</span>
                        <span id="l3">3</span>
                    </div>
                </div> */}

                <ReactPullToRefresh
                    onRefresh={this.handleRefresh}
                    className="your-own-class-if-you-want"
                    style={{
                        textAlign: 'center'
                    }}>

                    <div className='commonLocation-cont'>
                        <div className='grayBorder'></div>
                        <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toPCenter}>
                            <div className="am-list-line">
                                <div className="am-list-content">个人信息设置</div>
                                <div className="am-list-extra"></div>
                                <div className="am-list-arrow am-list-arrow-horizontal"></div>
                            </div>
                        </div>
                        <div className='am-list-item am-list-item-middle line_public15 activeDiv'>
                            <div className="am-list-line">
                                <div className="am-list-content">版本号</div>
                                <div className="am-list-extra">{this.state.version}</div>
                            </div>
                        </div>
                        <div onClick={this.toClearCache} className='am-list-item am-list-item-middle line_public15 activeDiv'>
                            <div className="am-list-line">
                                <div className="am-list-content">清除缓存</div>
                                <div className="am-list-extra"></div>
                            </div>
                        </div>
                        <div className='am-list-item am-list-item-middle line_public activeDiv'>
                            <div className="am-list-line">
                                <div className="am-list-content">关于</div>
                                <div className="am-list-extra"></div>
                            </div>
                        </div>
                        <div className='submitBtn' onClick={this.showAlertLogout}>退出登录</div>
                    </div>
                </ReactPullToRefresh>

            </div>
        )
    }



}



