import React from 'react';
import '../css/verifyBinding.less'
import {Toast} from "antd-mobile";

export default class verifyBinding extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watch2gId = locationSearch.split("&")[0].split('=')[1];
        var guardianId = locationSearch.split("&")[1].split('=')[1];
        var guardianName = locationSearch.split("&")[2].split('=')[1];
        var watch2gName = locationSearch.split("&")[3].split('=')[1];
        this.setState({watch2gId, guardianId, guardianName, watch2gName});
    }

    componentDidMount() {
        this.requestBinding()
    }

    requestBinding = () => {
        var param = {
            "method": 'getWatch2gGuardianById',
            "actionName": "watchAction",
            "guardianId": this.state.guardianId,
            "watchId": this.state.watch2gId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result);
                if (result.success) {
                    if (result.response.valid != 2) {
                        var unprocessed = 'none';
                        this.setState({unprocessed});
                    }
                    var processed = 'none';
                    this.setState({processed});
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
            "watch2gId": this.state.watch2gId,
            "guardianId": this.state.guardianId,
            "status": '1',
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result);
                if (result.success) {

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
            "watch2gId": this.state.watch2gId,
            "guardianId": this.state.guardianId,
            "status": '0',
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result);
                if (result.success) {
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
                <div>
                    <span>{this.state.guardianName}</span>请求绑定<span>{this.state.watch2gName}</span>的手表
                </div>
                <div style={{display: this.state.unprocessed}}>
                    <button onClick={this.agree}>同意</button>
                    <button onClick={this.refuse}>拒绝</button>
                </div>
                <div style={{display: this.state.processed}}>
                    <div>该请求已处理</div>
                </div>
            </div>
        )
    }
};