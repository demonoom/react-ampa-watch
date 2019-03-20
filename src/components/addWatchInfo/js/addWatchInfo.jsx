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
            macId: "1",
            stuName: "",
            sexValue: "",
            showSexBox: false,
            relationBox: false,
            relationValue: "",
            flag:true,
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
        var loginType = searchArray[0].split('=')[1];
        var ident = searchArray[1].split('=')[1];
        // loginType==1  代表主账号
        this.setState({
            loginType,
            ident
        })
    }

    componentDidMount () {
        Bridge.setShareAble("false");
        document.title = '手环绑定学生班级列表';
    }

    /**
     * 调用客户端
     */
    scanCode = () => {
        var data = {
            method: 'watchBinding'
        };
        Bridge.callHandler(data, function (mes) {
            //获取二维码MAC地址
            // var string = mes.replace(/:/g, '');
            // if (string.length > 16) {
            //     Toast.fail('mac地址超过最大字节数', 2)
            //     return
            // }
            //判断返回的ｍａｃ地址是否是以MAC:开头的,如果是,则将原内容的MAC:截掉
            var compareMes = mes.toUpperCase();
            if (compareMes.indexOf("MAC:") == 0) {
                mes = mes.substr(4, mes.length - 1);
            }
            if (mes.indexOf(":") == -1) {
                var string = splitStrTo2(mes).join(":");
                mes = string.substr(0, string.length - 1)
            }
            this.setState({ macId: mes.toUpperCase() });
        }, function (error) {
            console.log(error);
        });
    }


    //显示性别
    showSexBox = () => {
        this.setState({
            showSexBox: true
        })
    }
    //隐藏性别
    hideSexBox = (value) => {
        this.setState({
            showSexBox: false,
            sexValue: value
        })
    }

    //显示关系
    showRelationBox = () => {
        this.setState({
            relationBox: true
        })
    }
    //点击关系选项
    clickRelation = (relation) => {
        this.setState({
            relationBox: false,
            relationValue: relation
        })
        console.log(relation, "q")
        if (relation == "自定义") {
            this.showModal()
        }
    }
    //自定义关系
    showModal () {
        this.setState({
            flag:false
        })
        prompt('请输入关系', '', [
            { text: '取消' },
            {
                text: '确定', onPress: value => {
                    console.log(`输入的内容:${value}`);
                    console.log(value,"value");
                    this.setState({
                        relationValue: [value],
                        
                    },()=>{
                        console.log(this.state.relationValue)
                    });
                }
            },
        ], 'default', "")
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
                        var url = WebServiceUtil.mobileServiceURL + "bindStudentInfo?loginType=" + this.state.loginType + "&macAddr=" + this.state.macId;
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
                "familyRelate": this.state.relationValue,
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
   

    clickSure = (val) => {
        console.log(val, "val")
        this.setState({
            sexValue: val,
        });
    }
   
    onCancel = () => {
        this.setState({
            sexValue: "",
        });
    }
    onRelationChange = (val) => {
        console.log(val, "val")
        this.setState({
            relationValue: val,
        });
    };
    clickRelationSure = (val) => {
        console.log(val, "val")
        if (val[0] == "自定义") {
            this.showModal();
        }else {
            this.setState({
                relationValue: val,
            });
        }
       
    }
    onRelationCancel = () => {
        this.setState({
            relationValue: "",
        });
    }
    render () {
        return (
            <div id="addWatchInfo" style={{ height: document.body.clientHeight }}>
                {
                    this.state.loginType == 1 ?
                        <h5>添加学生信息</h5>
                        :
                        ""
                }
                <div><span>{this.state.macId}</span><span onClick={this.scanCode}>扫描</span></div>
                {
                    this.state.loginType == 1 ?
                        <div>
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
                        :
                        ""
                }
                <div>
                    <Picker
                        data={this.state.relationData}
                        value={this.state.relationValue}
                        cols={1}
                        className="forss"
                        extra={this.state.flag ? "请选择":this.state.relationValue}
                        onChange={this.onRelationChange}
                        onOk={this.clickRelationSure}
                        onDismiss={this.onRelationCancel}
                    >
                        <List.Item arrow="horizontal">请选择你与孩子的关系</List.Item>
                    </Picker>
                </div>
                <div className="p15">
                    <div className='submitBtn' onClick={this.nextPage}>
                        下一步
                    </div>
                </div>
            </div>
        );
    }
}