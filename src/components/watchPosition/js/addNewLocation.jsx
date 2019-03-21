import React from "react";
import {List, Button, Modal} from 'antd-mobile';

const Item = List.Item;
const prompt = Modal.prompt;

export default class addNewLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posName: '未设置',
            pos: '未设置',
        };
    }

    componentWillMount() {
        // var locationHref = decodeURI(window.location.href);
        // var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        // var userId = locationSearch.split("&")[0].split('=')[1];
        // var mac = locationSearch.split("&")[1].split('=')[1];
        // this.setState({userId, mac});
    }

    componentDidMount() {

    }

    posNameClick = () => {
        var _this = this;
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }

        prompt('请输入名称', '', [
            {text: '取消'},
            {
                text: '确定', onPress: value => {
                    if (value.trim() !== '') {
                        _this.setState({posName: value})
                    }
                }
            },
        ], 'default', '', [], phone);
        if (phone == 'ios') {
            document.getElementsByClassName('am-modal-input')[0].getElementsByTagName('input')[0].focus();
        }
    };

    posClick = () => {
        var url = WebServiceUtil.mobileServiceURL + "chooseLocation";
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    saveLocation = () => {
        console.log('saveLocation');
    };

    render() {

        return (
            <div id="addNewLocation">
                <List className="my-list">
                    <Item
                        arrow="horizontal"
                        platform="android"
                        extra={this.state.posName}
                        onClick={() => {
                            this.posNameClick()
                        }}>地点名称</Item>
                </List>

                <List className="my-list">
                    <Item
                        arrow="horizontal"
                        platform="android"
                        extra={this.state.pos}
                        onClick={() => {
                            this.posClick()
                        }}>地点位置</Item>
                </List>

                <Button onClick={this.saveLocation} type="primary" size="small">保存</Button>
            </div>
        )
    }
}



