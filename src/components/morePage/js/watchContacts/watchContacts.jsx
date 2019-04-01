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
    showAlertDelete () {
        var _this = this;
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定放弃本次编辑吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => calm.toDelete() },
        ], phone);

    }
    //删除
    toDelete = () => {
        console.log("删除")
    }



    render () {
        return (
            <div id="watchContacts" className='bg_gray'>
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
                                <span onClick={this.showAlertDelete} 
                                    // style={{ display: v.bindType == 1 ? "none" : "block"}}
                                >删除</span>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}



