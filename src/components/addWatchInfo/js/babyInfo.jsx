import React from 'react';
import {
    Toast, DatePicker,
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

//格式化数据
function formatDate (date) {
    var str = date + ""
    str = str.replace(/ GMT.+$/, '');// Or str = str.substring(0, 24)
    var d = new Date(str);
    var a = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
    return str = a[0] + '-' + a[1] + '-' + a[2]
}
export default class babyInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            macId: "",
            stuName: "",
            sexValue: "",
            extraClassName: "",
            RelationClassName: "",
            birthClassName: "",
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
        var macAddr = searchArray[0].split('=')[1];
        var relation = searchArray[1].split('=')[1];
        var phonenumber = searchArray[2].split('=')[1];
        var ident = searchArray[3].split('=')[1];
        // loginType==1  代表主账号
        this.setState({
            macAddr, relation, phonenumber, ident
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
                    Toast.fail(result.msg,1,null,false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
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
        if (this.state.sexValue == "") {
            Toast.info("请选择孩子性别",1,null,false)
            return
        }
        if (this.state.sendData == undefined) {
            Toast.info("请选择孩子生日",1,null,false)
            return
        }
        var url = WebServiceUtil.mobileServiceURL + "schoolInfo?macAddr=" + this.state.macAddr + "&sex=" + this.state.sexValue[0]+"&relation="+this.state.relation+"&phoneNumber="+this.state.phonenumber+"&ident="+this.state.ident+"&birthDay="+this.state.sendData;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });

    }
    //选择器改变事件
    onPickerChange = (val) => {
        this.setState({
            sexValue: val,
            extraClassName: 'color_3'
        });
    };

    //点击picker确定按钮
    clickSure = (val) => {
        this.setState({
            sexValue: val,
            extraClassName: 'color_3'
        });
    }
    //点击取消按钮
    onCancel = () => {
        this.setState({
            sexValue: "",
            extraClassName: ''
        });
    }
 
    //生日
    birChange = (date) => {
        var str = formatDate(date)
        this.setState({
            date,
            sendData: str,
            birthClassName: "color_3"
        })
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
            <div id="addWatchInfo" style={{ height: document.body.clientHeight }}>
                <div className="topPadding"></div>
                <div className="icon_back" onClick={this.toBack}></div>
                <div className="p38 innerCont">
                    <div className="infoContent selectDown">
                        <div className='picDiv'><img
                            src={require('../../images/bindPic.png')} alt="" />
                        </div>
                        <div className={'sex line_publicD ' + this.state.extraClassName}>
                            <Picker
                                data={sexData}
                                value={this.state.sexValue}
                                cols={1}
                                extra="请选择孩子的性别"
                                onChange={this.onPickerChange}
                                onOk={this.clickSure}
                                onDismiss={this.onCancel}
                            >
                                <List.Item arrow="horizontal"></List.Item>
                            </Picker>
                        </div>
                        <div className={'icon_birth line_publicD ' + this.state.birthClassName}>
                            <DatePicker
                                mode="date"
                                title=""
                                extra="请选择孩子生日"
                                value={this.state.date}
                                onChange={this.birChange}
                            >
                                <List.Item arrow="horizontal">请选择孩子生日</List.Item>
                            </DatePicker>
                        </div>
                        <div>
                        <div onClick={this.handleClick} className='login-input line_publicD icon_watch'>
                            <InputItem
                                value={this.state.phonenumber}
                                onChange={this.phoneNumber}
                                type="phone"
                                placeholder="请输入手表号码"
                                ref={el => this.inputRef = el}
                            ></InputItem>
                        </div>
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