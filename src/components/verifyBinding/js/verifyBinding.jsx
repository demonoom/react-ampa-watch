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
        this.setState({title: this.state.guardianName + '请求绑定' + this.state.watch2gName + '的手表'});
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
                <div className="am-modal-mask"></div>
                <div className="am-modal-wrap ">
                    <div className="am-modal am-modal-transparent">
                        <div className="am-modal-content">
                            <div className="am-modal-header">
                                <div className="am-modal-title">{this.state.title}</div>
                            </div>
                            <div className="am-modal-body">
                                <div className="am-modal-propmt-content">
                                </div>
                            </div>
                            <div className="am-modal-footer">
                                <div className="am-modal-button-group-h am-modal-button-group-normal">
                                    <a className="am-modal-button" onClick={this.refuse}>拒绝</a>
                                    <a className="am-modal-button" onClick={this.agree}>同意</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};