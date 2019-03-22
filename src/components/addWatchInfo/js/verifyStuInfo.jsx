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
            watchId:"",
            littleAntName: "",
        };
    }

    componentWillMount () {
        document.title = '验证学生账号';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var loginType = searchArray[0].split('=')[1];
        var macAddr = searchArray[1].split('=')[1];
        var sex = searchArray[2].split('=')[1];
        this.setState({
            loginType,
            macAddr,
            sex
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
    //输入小蚂蚁账号
    littAntOnChange = (value) => {
        console.log(value, "p")
        this.setState({
            littleAntName: value,

        });
    }

    //
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
        if (this.state.littleAntName == "") {
            Toast.info("请输入小蚂蚁账号");
            return
        }
        if (this.state.stuName == "") {
            Toast.info("请输入学生名称");
            return
        }
        if (this.state.schoolName == "") {
            Toast.info("请输入学校名称");
            return
        }
        
        var param = {
            "method": 'bindStudentAccountByAccount',
            "account": this.state.littleAntName,
            "studentName": this.state.stuName,
            "schoolName": this.state.schoolName,
            "watch2gId": this.state.watchId,
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
                    Toast.info(result.msg);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });


    }
    render () {
        return (
            <div id="addWatchInfo" style={{ height: this.state.clientHeight }}>
                <div className="p38 bindStu login-input">
                    <div className="picDiv">
                        <img
                            src={require('../../images/stuAccountPic.png')} alt=""/>
                    </div>
                    <div className="icon_watch line_public stuCont">
                        <InputItem
                            className=""
                            placeholder="请输入小蚂蚁账号"
                            value={this.state.littleAntName}
                            onChange={this.littAntOnChange}
                        ></InputItem>
                    </div>
                    <div className="icon_user line_public">
                        <InputItem
                            className=""
                            placeholder="请输入孩子姓名验证账号信息"
                            value={this.state.stuName}
                            onChange={this.stuOnChange}
                        ></InputItem>
                    </div>
                   <div className="icon_school line_public">
                       <InputItem
                           className=""
                           placeholder="输入此账号所在的学校名称"
                           value={this.state.schoolName}
                           onChange={this.schoolOnChange}
                       ></InputItem>
                   </div>

                </div>

                <div className='submitBtn' onClick={this.submmit}>确定</div>

            </div>
        );
    }
}
