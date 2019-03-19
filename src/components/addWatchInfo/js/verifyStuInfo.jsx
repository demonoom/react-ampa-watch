import React from 'react';
import {
    InputItem, Toast,
    Modal
} from 'antd-mobile';
const alert = Modal.alert;
export default class verifyStuInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stuName: "",
            schoolName: "",
            watchId:""
        };
    }

    componentWillMount () {
        document.title = '验证学生账号';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var loginType = searchArray[0].split('=')[1];
        var sName = searchArray[1].split('=')[1];
        var uName = searchArray[2].split('=')[1];
        var stuId = searchArray[3].split('=')[1];
        var macAddr = searchArray[4].split('=')[1];
        this.setState({
            loginType,
            sName,
            uName,
            stuId,
            macAddr
        })
        this.getWatchId(macAddr)
    }
    componentDidMount () {
        Bridge.setShareAble("false");
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize () {
        // this
        setTimeout(() => {
            this.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }

    getWatchId=(macAddress)=>{
        var param = {
            "method": 'getWatch2gByMacAddress',
            "macAddress": macAddress,
            "actionName":"watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                if (result.success && result.response) {
                   this.setState({
                       watchId:result.response.id
                   })
                } else {
                    // Toast.info('');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //输入学生姓名
    stuOnChange = (value) => {
        console.log(value, "p")
        this.setState({
            stuName: value,

        });
    }
    //输入学校
    schoolOnChange = (value) => {
        console.log(value, "schoolName")
        this.setState({
            schoolName: value,

        });
    }

    //点击提交按钮
    submmit = () => {
        if (this.state.uName != this.state.stuName) {
            Toast.info("请检查学生名称");
            return
        }
        if (this.state.sName != this.state.schoolName) {
            Toast.info("请检查学校名称");
            return
        }
       
        var param = {
            "method": 'bindStudentAccount',
            "studentId": this.state.stuId,
            "watch2gId": this.state.watchId,
            "studentBindType": 0,
            "actionName": "watchAction",
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                if (result.success && result.response) {
                    Toast.info('验证成功');
                    var url = WebServiceUtil.mobileServiceURL + "loginSuccess?loginType=" + this.state.loginType;
                    var data = {
                        method: 'openNewPage',
                        url: url
                    };
                    Bridge.callHandler(data, null, function (error) {
                        window.location.href = url;
                    });
                } else {
                    Toast.info('验证失败');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });


    }
    render () {
        return (
            <div id="verifyStuInfo" style={{ height: this.state.clientHeight }}>
                <h5>验证学生账号</h5>
                <h5>小蚂蚁账号</h5>
                <InputItem
                    className=""
                    placeholder="请输入孩子姓名"
                    value={this.state.stuName}
                    onChange={this.stuOnChange}
                ></InputItem>
                <InputItem
                    className=""
                    placeholder="输入此账号所在的学校名称"
                    value={this.state.schoolName}
                    onChange={this.schoolOnChange}
                ></InputItem>
                <div onClick={this.submmit}>确定</div>
            </div>
        );
    }
}
