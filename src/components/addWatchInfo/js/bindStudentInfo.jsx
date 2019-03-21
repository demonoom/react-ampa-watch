import React from 'react';
import {
    InputItem, Toast, Modal
} from 'antd-mobile';

const alert = Modal.alert;
export default class bindStudentInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            littleAntName: "",
            stuInfoData: null
        };
    }

    componentWillMount() {
        document.title = '绑定学生账号';
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
    }

    componentDidMount() {
        Bridge.setShareAble("false");
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize() {
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
    //下一页
    nextPage = () => {
        if (this.state.littleAntName == "") {
            Toast.info("请输入小蚂蚁账号")
            return;
        }
        var param = {
            "method": 'getUserByAccount',
            "account": this.state.littleAntName,
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "rerere")
                if (result.success && result.response) {
                    this.setState({
                        stuInfoData: result.response
                    })
                    var url = WebServiceUtil.mobileServiceURL + "verifyStuInfo?loginType=" + this.state.loginType + "&schoolName=" + result.response.schoolName + "&uName=" + result.response.userName + "&stuId=" + result.response.colUid + "&macAddr=" + this.state.macAddr;
                    var data = {
                        method: 'openNewPage',
                        url: url
                    };
                    Bridge.callHandler(data, null, function (error) {
                        window.location.href = url;
                    });
                } else {
                    Toast.info('请注册学生账号');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });

    }

    //跳注册页面
    toRegPage = () => {
        var url = WebServiceUtil.mobileServiceURL + "stuAccountRegist?sex=" + this.state.sex + "&macAddr=" + this.state.macAddr;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    render() {
        return (
            <div id="addWatchInfo" style={{height: this.state.clientHeight}}>
                <div className="p38 bindStu login-input">
                    <div className="picDiv">
                        <img
                            src={require('../../images/bindStuPic.png')} alt=""/>
                    </div>
                    <div className="icon_user line_public stuCont">
                        <InputItem
                            className=""
                            placeholder="请输入小蚂蚁账号"
                            value={this.state.littleAntName}
                            onChange={this.littAntOnChange}
                        ></InputItem>
                    </div>
                    <div className='applyAccount'><span onClick={this.toRegPage}>*申请新账号</span></div>
                    <div className='submitBtn' onClick={this.nextPage}>下一步</div>
                </div>

            </div>
        );
    }
}
