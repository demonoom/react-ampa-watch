import React from "react";
import {
    InputItem, Toast, DatePicker, Popover,
    Modal, Picker, List, Tabs
} from 'antd-mobile';
import '../../css/studentInfo.less'
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
            photoAddr: ""

        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watchId = locationSearch.split("&")[0].split('=')[1];
        var bindType = locationSearch.split("&")[1].split('=')[1];

        this.setState({
            watchId, bindType
        })
        this.getWatch2gById(watchId)

    }
    componentDidMount () {
        if (this.state.bindType == 2) {
            $("#sexValue .am-list-arrow").removeClass("am-list-arrow-horizontal")
        }
        if (this.state.bindType == 2) {
            $("#birthValue .am-list-arrow").removeClass("am-list-arrow-horizontal")
        }
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
                        studentId: result.response.studentId,
                        phoneNumber: result.response.phoneNumber,
                        sexValue: [result.response.childSex],
                        photoAddr: result.response.student ? result.response.student.avatar : "",
                        userName: result.response.student ? result.response.student.userName : "",
                        birthTime: result.response.birthTime,
                        sendData: result.response.birthTime,
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
        this.showModal();
    }

    showModal () {
        $(".am-modal-input input").focus();
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
                        phoneNumber: value,
                        RelationClassName: 'color_3'
                    }, () => {
                        this.updateWatch2g();
                        // setTimeout(() => {
                        //     this.getWatch2gById(this.state.watchId)
                        // }, 300)
                    });
                }
            },
        ], 'default', "")
    }


    //点击picker确定按钮
    clickSure = (val) => {
        this.setState({
            sexValue: val,
            extraClassName: 'color_3'
        }, () => {
            this.updateWatch2g();
            // setTimeout(() => {
            //     this.getWatch2gById(this.state.watchId)
            // }, 300)
        });
    }

    //修改头像---调用客户端
    updatePhoto = () => {
        // var str = "http://60.205.86.217/upload8/2018-10-30/13/bb67bfb7-f04f-42f5-8435-fc8659c96cc1.jpeg";
        // this.setState({
        //     photoAddr: str
        // }, () => {
        //     this.updateWatch2g()
        // })
        var data = {
            method: 'selectedImage'
        };
        Bridge.callHandler(data, (photoAddr) => {
            this.setState({ photoAddr: photoAddr }, () => {
                this.updateWatch2g();
                // setTimeout(() => {
                //     this.getWatch2gById(this.state.watchId)
                // }, 300)
            });
        }, function (error) {
        });
    }



    //修改手表信息
    updateWatch2g = () => {
        var param = {
            "method": 'updateWatch2g',
            "birthTime": this.state.sendData,
            "watch2gId": this.state.watchId,
            "childSex": this.state.sexValue[0],
            "avatar": this.state.photoAddr,
            "phoneNumber": this.state.phoneNumber,
            "actionName": "watchAction",
        };
        console.log(param)
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info("修改成功", 1, null, false);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //确认修改生日
    sureBirthTime = (date) => {
        var str = formatDate(date)
        this.setState({
            date,
            sendData: str,
            birthClassName: "color_3"
        }, () => {
            this.updateWatch2g();
            // setTimeout(() => {
            //     this.getWatch2gById(this.state.watchId)
            // }, 300)
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
            <div id="studentInfo" className='bg_gray publicList_50'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">学生名片</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont overScroll">
                    <div className='mask transparent' style={{ display: this.state.bindType == 2 ? "block" : "none" }}></div>
                    <div onClick={this.updatePhoto} className='am-list-item am-list-item-middle line_public15 activeDiv'>
                        <div className="am-list-line photo">
                            <div className="am-list-content">宝贝头像</div>
                            <img src={this.state.photoAddr} alt="" />
                            <div className={this.state.bindType == 2 ? "am-list-arrow" : "am-list-arrow am-list-arrow-horizontal"}></div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toUpdateUserName}>
                        <div className="am-list-line">
                            <div className="am-list-content">宝贝名字</div>
                            <div className="am-list-extra">
                                {this.state.userName}
                            </div>
                            <div className="am-list-arrow"></div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.updatePhoneNumber}>
                        <div className="am-list-line">
                            <div className="am-list-content">手表号码</div>
                            <div className="am-list-extra">
                                {this.state.phoneNumber}
                            </div>
                            <div className={this.state.bindType == 2 ? "am-list-arrow" : "am-list-arrow am-list-arrow-horizontal"}></div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public activeDiv'>
                        <div className="am-list-line">
                            <div className="am-list-content">学生账号</div>
                            <div className="am-list-extra">
                                {this.state.watchData.student ? this.state.watchData.student.colUid : ""}
                            </div>
                            <div className="am-list-arrow"></div>
                        </div>
                    </div>
                    <div className="grayBorder"></div>
                    <div id="sexValue" className='line_public15'>
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
                    <div id="birthValue" className='icon_birth line_public15'>
                        <DatePicker
                            mode="date"
                            title=""
                            extra={this.state.birthTime}
                            maxDate={new Date(nowTimeStamp + 1e7)}
                            value={this.state.date}
                            onOk={this.sureBirthTime}
                            onChange={this.birChange}
                        >
                            <List.Item arrow="horizontal">生日</List.Item>
                        </DatePicker>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv'>
                        <div className="am-list-line">
                            <div className="am-list-content">学校</div>
                            <div className="am-list-extra">
                                {this.state.watchData.student ? this.state.watchData.student.schoolName : ""}
                            </div>
                            <div className="am-list-arrow"></div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public activeDiv'>
                        <div className="am-list-line">
                            <div className="am-list-content">班级</div>
                            <div className="am-list-extra">
                                {this.state.watchData.student ? this.state.watchData.student.clazzList[0].grade.name + this.state.watchData.student.clazzList[0].name : ""}
                            </div>
                            <div className="am-list-arrow"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



