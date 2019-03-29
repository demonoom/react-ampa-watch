import React from 'react';
import '../css/verifyBinding.less'
import {Toast} from "antd-mobile";

export default class verifyBinding extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            disagree: 'none',
            determine: 'none',
            review: 'none',
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var id = locationSearch.split("&")[0].split('=')[1];
        var guardianName = locationSearch.split("&")[1].split('=')[1];
        var watch2gName = locationSearch.split("&")[2].split('=')[1];
        this.setState({id, guardianName, watch2gName});
    }

    componentDidMount() {
        this.requestBinding()
    }

    requestBinding = () => {
        var param = {
            "method": 'getWatch2gGuardianById',
            "actionName": "watchAction",
            "id": this.state.id,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result);
                if (result.success) {
                    if (result.response.valid == 2) {
                        var review = '';
                        this.setState({review});
                    } else if (result.response.valid == 1) {
                        var determine = '';
                        this.setState({determine});
                    } else if (result.response == 0) {
                        var disagree = '';
                        this.setState({disagree});
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });

    };

    agree = () => {
        var param = {
            "method": 'acceptGuardianApply',
            "actionName": "watchAction",
            "id": this.state.id,
            "status": '1',
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result);
                if (result.success) {
                    var review = 'none'
                    var determine = ''
                    this.setState({review, determine});
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    };

    refuse = () => {
        var param = {
            "method": 'acceptGuardianApply',
            "actionName": "watchAction",
            "id": this.state.id,
            "status": '0',
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result);
                if (result.success) {
                    var review = 'none'
                    var disagree = ''
                    this.setState({review, disagree});
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    };

    render() {
        return (
            <div id="verifyBinding">
                <div className="center verify_Binding" style={{display: this.state.review}}>
                    <div className="verify-cont"><span
                        className="userName">{this.state.guardianName}</span>请求绑定<span
                        className="userName">{this.state.watch2gName}</span>的手表
                    </div>
                    <div>
                        <a className="verify-submitBtn verify-submitBtn-left" onClick={this.refuse}>拒绝</a>
                        <a className="verify-submitBtn verify-submitBtn-right" onClick={this.agree}>同意</a>
                    </div>
                </div>
                <div className="verify-toast center" style={{display: this.state.determine}}>
                    <div className="am-toast-text">
                        <div className="am-toast-text-info">已同意绑定</div>
                    </div>
                </div>
                <div className="verify-toast center" style={{display: this.state.disagree}}>
                    <div className="am-toast-text">
                        <div className="am-toast-text-info">已拒绝绑定</div>
                    </div>
                </div>
            </div>
        )
    }
};