import React from "react";
import {
    InputItem, Toast, DatePicker, Popover,
    Modal, Picker, List, Tabs
} from 'antd-mobile';
const Item = Popover.Item;
const alert = Modal.alert;
const prompt = Modal.prompt;

const sexData = [{
    value: '男',
    label: '男'
}, {
    value: '女',
    label: '女'
}]
//消息通信js
var calm;
const nowTimeStamp = Date.now();
//格式化数据
function formatDate (date) {
    var str = date + ""
    str = str.replace(/ GMT.+$/, '');// Or str = str.substring(0, 24)
    var d = new Date(str);
    var a = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
    return str = a[0] + '-' + a[1] + '-' + a[2]
}
export default class studentInfo extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            watchData: [],

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
                        phoneNumber: result.response.phoneNumber,
                        sexValue: [result.response.childSex],
                        userName:result.response.student ? result.response.student.userName : ""
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



    //生日
    birChange = (date) => {
        var str = formatDate(date)
        this.setState({
            date,
            sendData: str,
            birthClassName: "color_3"
        })
    }

    //选择器改变事件
    onSexChange = (val) => {
        this.setState({
            sexValue: val,
            extraClassName: 'color_3'
        });
    };

    //点击取消按钮
    onCancel = () => {
        this.setState({
            sexValue: this.state.sexValue,
            extraClassName: ''
        });
    }


    updatePhoneNumber = () => {
        $(".am-modal-input input").focus();
        this.showModal();
    }


    showModal () {
        prompt('请输入手表号码', '', [
            {
                text: '取消', onPress: value => {
                    this.setState({
                        phoneNumber: this.state.phoneNumber,
                        RelationClassName: 'color_3'
                    }, () => {
                    });
                },
            },
            {
                text: '确定', onPress: value => {
                    this.setState({
                        phoneNumber: [value],
                        RelationClassName: 'color_3'
                    }, () => {
                    });
                }
            },
        ], 'default', this.state.phoneNumber)
    }


    showNameModal () {
        prompt('请输入学生姓名', '', [
            {
                text: '取消', onPress: value => {
                    this.setState({
                        userName: this.state.userName,
                    }, () => {
                    });
                },
            },
            {
                text: '确定', onPress: value => {
                    this.setState({
                        userName: [value],
                    }, () => {
                    });
                }
            },
        ], 'default', this.state.userName)
    }

    //点击picker确定按钮
    clickSure = (val) => {
        this.setState({
            sexValue: val,
            extraClassName: 'color_3'
        });
    }
    toUpdateUserName = ()=>{
        $(".am-modal-input input").focus();
        this.showNameModal()
    }
    render () {
        return (
            <div id="studentInfo" className='bg_gray'>
                <div>
                    <span>宝贝头像</span>
                    <img src={this.state.watchData.student ? this.state.watchData.student.avatar : ""} alt="" />
                </div>
                <div onClick={this.toUpdateUserName}>
                    <span>宝贝名字</span>
                    <span>{this.state.userName} </span>
                </div>
                <div onClick={this.updatePhoneNumber}>
                    <span>手表号码</span>
                    <span>{this.state.phoneNumber} </span>
                </div>
                <div>
                    <span>学生账号</span>
                    <span>{this.state.watchData.student ? this.state.watchData.student.colUid : ""} </span>
                </div>
                <div className={'sex line_publicD ' + this.state.extraClassName}>
                    <Picker
                        data={sexData}
                        value={this.state.sexValue}
                        cols={1}
                        extra="请输入性别"
                        onChange={this.onSexChange}
                        onOk={this.clickSure}
                        onDismiss={this.onCancel}
                    >
                        <List.Item arrow="horizontal">性别</List.Item>
                    </Picker>
                </div>
                <div className={'icon_birth line_publicD ' + this.state.birthClassName}>
                    <DatePicker
                        mode="date"
                        title=""
                        extra={WebServiceUtil.formatYMD(this.state.watchData.bindTime)}
                        maxDate={new Date(nowTimeStamp + 1e7)}
                        value={this.state.date}
                        onChange={this.birChange}
                    >
                        <List.Item arrow="horizontal">生日</List.Item>
                    </DatePicker>
                </div>
                <div>
                    <span>学校</span>
                    <span>{this.state.watchData.student ? this.state.watchData.student.schoolName : ""} </span>
                </div>
                <div>
                    <span>班级</span>
                    <span>{this.state.watchData.student ? this.state.watchData.student.clazzList[0].grade.name + this.state.watchData.student.clazzList[0].name : ""} </span>
                </div>
                
            </div>
        )
    }
}



