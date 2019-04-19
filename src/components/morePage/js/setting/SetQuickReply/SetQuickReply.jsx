import React from "react";
import {
    Toast, Modal, Popover, NavBar, Icon
} from 'antd-mobile';
import './setQuickReply.less'
const prompt = Modal.prompt;

const Item = Popover.Item;
const alert = Modal.alert;
var calm;
export default class SetQuickReply extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {

        };
    }

    componentWillMount () {
        document.title = "手表快捷回复"
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watchId = locationSearch.split("&")[0].split('=')[1];
        var studentId = locationSearch.split("&")[1].split('=')[1];
        this.setState({
            studentId,
            watchId,
        })
        this.getQuickContent()

    }
    componentDidMount () {

    }

    //获取列表数据
    getQuickContent = () => {
        var param = {
            "method": "getWatch2GQuickMessageList",
            "actionName": "watch2GQuickMessageAction",
            "pageNo": -1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.success) {
                    if(result.response.length == 0){
                        this.setState({
                            hidePage:true
                        })
                    }
                    this.buildList(result.response)
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    //创建列表
    buildList = (data) => {
        var listArr = [];
        data.forEach((v, i) => {
            listArr.push(
                <div class='am-list-item am-list-item-middle line_public15'>
                    <div class="am-list-line">
                        <div class='am-list-content'>
                            {v.content}
                        </div>
                        <div class='deleteBtn' onClick={this.showAlert.bind(this, v.id)}>删除</div>
                    </div>
                </div>
            )
        });
        this.setState({
            quickReplyData: listArr
        })
    }


    /**
    * 退出弹出框
    */
    showAlert = (id) => {
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定删除吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => this.todelete(id) },
        ], phone);
    };


    //删除闹钟
    todelete = (id) => {
        var param = {
            "method": 'deleteQuickMessage',
            "id": id,
            "actionName": "watch2GQuickMessageAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info("删除成功", 1, null, false)
                    this.useabledData(this.state.watchId, 0)
                    //关闭当前窗口，并刷新上一个页面
                    setTimeout(function () {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    }, 1000)
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
        })
    }
    //添加快捷回复
    toAddQuickReply = () => {
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        prompt('快捷回复内容', '', [
            { text: '取消' },
            {
                text: '确定', onPress: value =>
                    new Promise((resolve, reject) => {

                        if (value.length == 0) {
                            Toast.info("内容不能为空", 1, null, false);
                            return
                        } else if (value.length >= 11) {
                            Toast.info("内容不能超过10个字", 1, null, false);
                            return
                        } else {
                            resolve();
                            this.saveQuickReply(value)
                        }
                    }),
            },
        ], 'default', '', [], phone)
        if (phone == 'ios') {
            document.getElementsByClassName('am-modal-input')[0].getElementsByTagName('input')[0].focus();
        }
    }
    //保存快捷回复
    saveQuickReply = (value) => {
        var param = {
            "method": 'addQuickMessage',
            "studentId": this.state.studentId,
            "content": value,
            "actionName": "watch2GQuickMessageAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info("添加成功", 1, null, false)
                    //关闭当前窗口，并刷新上一个页面

                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    render () {
        return (
            <div id="setQuickReply" className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">自定义回复设置</span>
                    <span className="am-navbar-right"></span>
                </div>
                {/*空页面*/}
                <div style={{ display: this.state.hidePage ? "block" : "none" }}>
                    <div className="emptyCont emptyContNone">
                        <div className="p38 my_flex">
                            <div>
                                <i></i>
                                <span>
                                    暂无数据
                                    </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='commonLocation-cont overScroll'>
                    <div className='grayBorder'></div>
                    <div className="publicList_50">
                        {this.state.quickReplyData}
                    </div>
                </div>
                <div className='addBtn' onClick={this.toAddQuickReply}></div>
            </div>
        )
    }



}



