import React from 'react';
import {
    InputItem, Toast,
    Modal, Picker, List
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
            extraClassName: "",
            RelationClassName: "",
            showSexDiv: false,
            showRelationiDiv: false,
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
        window.addEventListener('resize', this.onWindwoResize);
    }

    componentDidMount () {
        Bridge.setShareAble("false");
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize = () => {
        // this
        setTimeout(() => {
            this.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }

    //*根据mac地址获取是第几次登录 */
    getWatch2gByMacAddress = (macAdd) => {
        var param = {
            "method": 'getWatch2gByMacAddress',
            "macAddress": macAdd,
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.response == null) {
                    this.setState({
                        loginType: 1,
                        showSexDiv: true,
                        showRelationiDiv: true
                    })
                }
                if (result.success && result.response) {
                    this.setState({
                        loginType: 0,
                        showRelationiDiv: true
                    })
                } else {
                    Toast.fail(result.msg, 1);
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
        // this.getWatch2gByMacAddress("aa");
        var data = {
            method: 'watchBinding'
        };
        Bridge.callHandler(data, (mes) => {
            this.setState({ macId: mes.toUpperCase() });
            this.getWatch2gByMacAddress(mes)
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
                    this.setState({
                        relationValue: [value],
                        RelationClassName: 'color_3'
                    }, () => {
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
            if (this.state.relationValue == "") {
                Toast.info("请选择您与孩子的关系")
                return
            }
            if (this.state.phonenumber == undefined) {
                Toast.info("请输入手表号码")
                return
            }
            var url = WebServiceUtil.mobileServiceURL + "babyInfo?macAddr=" + this.state.macId + "&relation=" + this.state.relationValue[0] + "&phonenumber=" + this.state.phonenumber + "&ident=" + this.state.ident
            var data = {
                method: 'openNewPage',
                selfBack: true,
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
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
                        Toast.fail(result.msg, 1);
                    }
                },
                onError: function (error) {
                    Toast.info('请求失败');
                }
            });

        }



    }

    //关系改变
    onRelationChange = (val) => {
        this.setState({
            relationValue: val,
            RelationClassName: 'color_3'
        });
    };
    //关系点击确定
    clickRelationSure = (val) => {
        if (val[0] == "自定义") {
            $(".am-modal-input input").focus();
            this.showModal()
        } else {
            this.setState({
                relationValue: val,
                RelationClassName: 'color_3'
            });
        }

    }
    //关系取消
    onRelationCancel = () => {
        this.setState({
            relationValue: "",
            RelationClassName: "",
        });
    }

    //phoneNumber
    phoneNumber = (value) => {
        this.setState({
            phonenumber: value,

        });
    }

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }
    render () {
        return (
            <div id="addWatchInfo" style={{ height: this.state.clientHeight }}>
                <div className="icon_back" onClick={this.toBack}></div>
                <div className="p38 innerCont">
                    <div className="infoContent">
                        <div className='picDiv'><img
                            src={require('../../images/bindPic.png')} alt="" /></div>
                        <div className='line_publicD'>
                            <div className="p10 scanDiv">
                                <span className='text_hidden color_c' style={{ display: this.state.macId ? "none" : "inline-block" }}>请扫描手表二维码</span>
                                <span className='text_hidden' style={{ display: this.state.macId ? "inline-block" : "none" }}>{this.state.macId}</span>
                                <span className='scanBtn' onClick={this.scanCode}>扫描</span>
                            </div>
                        </div>
                        <div className={'selectDown relation line_publicD ' + this.state.RelationClassName} style={{ display: this.state.showRelationiDiv ? "block" : "none" }}>
                            <Picker
                                data={this.state.relationData}
                                value={this.state.relationValue}
                                cols={1}
                                extra={this.state.flag ? "请选择你与孩子的关系" : this.state.relationValue}
                                onChange={this.onRelationChange}
                                onOk={this.clickRelationSure}
                                onDismiss={this.onRelationCancel}
                            >
                                <List.Item arrow="horizontal"></List.Item>
                            </Picker>
                        </div>
                        <div className='login-input line_publicD icon_watch' style={{ display: this.state.showSexDiv ? "block" : "none" }}>
                            <InputItem
                                value={this.state.phonenumber}
                                onChange={this.phoneNumber}
                                type="phone"
                                placeholder="请输入手表号码"
                            ></InputItem>
                        </div>
                    </div>
                </div>
                <div className='submitBtn' onClick={this.nextPage}>
                    下一步
                </div>
            </div>
        );
    }
}
