import React from 'react';
import {
    InputItem, Toast,
    Modal, Picker, List, WhiteSpace
} from 'antd-mobile';

import '../css/addWatchInfo.less'

const alert = Modal.alert;
const prompt = Modal.prompt;
const sexData = [{
    value: '男',
    label: '男'
}, {
    value: '女',
    label: '女'
}]
export default class addWatchInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            macId: "",
            stuName: "",
            sexValue: "",
            showSexDiv:false,
            showRelationiDiv:true,
            relationValue: "",
            flag: true,
            relationData: [
                {
                    value: "父亲",
                    label: '父亲'
                },
                {
                    value: "母亲",
                    label: "母亲"
                },
                {
                    value: "祖父",
                    label: "祖父"
                },
                {
                    value: "祖母",
                    label: "祖母"
                },
                {
                    value: "自定义",
                    label: "自定义"
                },
            ]
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var ident = searchArray[0].split('=')[1];
        // loginType==1  代表主账号
        this.setState({
            ident
        })
    }

    componentDidMount () {
        Bridge.setShareAble("false");
        document.title = '手环绑定学生班级列表';
    }
    //*根据mac地址获取是第几次登录 */
    getWatch2gByMacAddress = (macAdd) => {
        var param = {
            "method": 'getWatch2gByMacAddress',
            "macAddress": macAdd,
            "actionName": "watchAction",
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                if (result.response == null) {
                    this.setState({
                        loginType: 1,
                        showSexDiv:true,
                        showRelationiDiv:true
                    })
                }
                if (result.success && result.response) {
                    this.setState({
                        loginType: 0,
                        showRelationiDiv:true
                    })
                } else {

                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    /**
     * 调用客户端
     */
    scanCode = () => {
        // this.getWatch2gByMacAddress(10)
        var data = {
            method: 'watchBinding'
        };
        Bridge.callHandler(data, (mes)=> {
            this.getWatch2gByMacAddress(mes)
            this.setState({ macId: mes.toUpperCase() });
        }, function (error) {
            console.log(error);
        });
    }

   
    //自定义关系
    showModal () {
        this.setState({
            flag: false
        })
        prompt('请输入关系', '', [
            { text: '取消' },
            {
                text: '确定', onPress: value => {
                    console.log(`输入的内容:${value}`);
                    console.log(value, "value");
                    this.setState({
                        relationValue: [value],

                    }, () => {
                        console.log(this.state.relationValue)
                    });
                }
            },
        ], 'default', '')
    }
    //跳转下一页
    nextPage = () => {
        if (this.state.loginType == 1) {
            if (this.state.macId == "") {
                Toast.info("请扫描手表")
                return
            }
            if (this.state.sexValue == "") {
                Toast.info("请选择孩子性别")
                return
            }
            if (this.state.relationValue == "") {
                Toast.info("请选择您与孩子的关系")
                return
            }
            var param = {
                "method": 'bindWatchGuardian',
                "childSex": this.state.sexValue[0],
                "macAddress": this.state.macId,
                "familyRelate": this.state.relationValue[0],
                "actionName": "watchAction",
                "guardianId": this.state.ident//绑定监护人的userId
            };
            console.log(param, "param")
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    console.log(result, "rerere")
                    if (result.success && result.response) {
                        var url = WebServiceUtil.mobileServiceURL + "bindStudentInfo?loginType=" + this.state.loginType + "&macAddr=" + this.state.macId+"&sex="+this.state.sexValue[0];
                        var data = {
                            method: 'openNewPage',
                            url: url
                        };
                        Bridge.callHandler(data, null, function (error) {
                            window.location.href = url;
                        });
                    } else {
                        // Toast.info('解绑失败');
                    }
                },
                onError: function (error) {
                    Toast.info('请求失败');
                }
            });

        } else {
            console.log(this.state.relationValue, "this.state.familyRelate")
            if (this.state.macId == "") {
                Toast.info("请扫描手表")
                return
            }
            if (this.state.relationValue == "") {
                Toast.info("请选择您与孩子的关系")
                return
            }
            //副监护人
            var param = {
                "method": 'bindWatchGuardian',
                "macAddress": this.state.macId,
                "familyRelate": this.state.relationValue[0],
                "actionName": "watchAction",
                "guardianId": this.state.ident//绑定监护人的userId
            };
            console.log(param, "param")
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    if (result.success && result.response) {
                        var url = WebServiceUtil.mobileServiceURL + "loginSuccess?loginType=" + this.state.loginType;
                        var data = {
                            method: 'openNewPage',
                            url: url
                        };
                        Bridge.callHandler(data, null, function (error) {
                            window.location.href = url;
                        });
                    } else {
                        // Toast.info('解绑失败');
                    }
                },
                onError: function (error) {
                    Toast.info('请求失败');
                }
            });

        }



    }

    //选择器改变事件
    onPickerChange = (val) => {
        console.log(val, "val")
        this.setState({
            sexValue: val,
        });
    };

    //点击picker确定按钮
    clickSure = (val) => {
        console.log(val, "val")
        this.setState({
            sexValue: val,
        });
    }
    //点击取消按钮
    onCancel = () => {
        this.setState({
            sexValue: "",
        });
    }
    //关系改变
    onRelationChange = (val) => {
        console.log(val, "val")
        this.setState({
            relationValue: val,
        });
    };
    //关系点击确定
    clickRelationSure = (val) => {
        console.log(val, "val")
        if (val[0] == "自定义") {
            $(".am-modal-input input").focus();
        } else {
            this.setState({
                relationValue: val,
            });
        }

    }
    //关系取消
    onRelationCancel = () => {
        this.setState({
            relationValue: "",
        });
    }
    render () {
        return (
            <div id="addWatchInfo" style={{ height: document.body.clientHeight }}>
                <div className="p38">
                    <div className="content">
                        <h5 style={{ display: this.state.loginType == 1 ? "block" : "none" }}>沟通从心开始</h5>
                        <h5 style={{ display: this.state.loginType == 0 ? "block" : "none" }}>守护关注一生</h5>
                        <div><span>{this.state.macId}</span><span style={{fontSize: '48px'}} onClick={this.scanCode}>扫描</span></div>
                        <div style={{ display: this.state.showSexDiv ? "block" : "none" }}>
                            <Picker
                                data={sexData}
                                value={this.state.sexValue}
                                cols={1}
                                className="forss"
                                extra="请选择"
                                onChange={this.onPickerChange}
                                onOk={this.clickSure}
                                onDismiss={this.onCancel}
                            >
                                <List.Item arrow="horizontal">请选择孩子的性别</List.Item>
                            </Picker>
                        </div>
                        <div style={{ display: this.state.showRelationiDiv ? "block" : "none" }}>
                            <Picker
                                data={this.state.relationData}
                                value={this.state.relationValue}
                                cols={1}
                                className="forss"
                                extra={this.state.flag ? "请选择" : this.state.relationValue}
                                onChange={this.onRelationChange}
                                onOk={this.clickRelationSure}
                                onDismiss={this.onRelationCancel}
                            >
                                <List.Item arrow="horizontal">请选择你与孩子的关系</List.Item>
                            </Picker>
                        </div>
                    </div>


                <div className='submitBtn' onClick={this.nextPage}>
                    下一步
                </div>
                </div>
            </div>
        );
    }
}