import React from 'react';
import {
    InputItem, Toast, Modal
} from 'antd-mobile';
const alert = Modal.alert;
export default class verifyStuInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stuName: "",
            schoolName: "",
            littleAntName: "",
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var macAddr = searchArray[0].split('=')[1];
        var sex = searchArray[1].split('=')[1];
        var relation = searchArray[2].split('=')[1];
        var phoneNumber = searchArray[3].split('=')[1];
        var ident = searchArray[4].split('=')[1];
        var birthDay = searchArray[5].split('=')[1];
        this.setState({
            macAddr,
            sex,
            relation,
            phoneNumber,
            ident,
            birthDay
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
    //输入小蚂蚁账号
    littAntOnChange = (value) => {
        this.setState({
            littleAntName: value,

        });
    }
    //输入学生姓名
    stuOnChange = (value) => {
        this.setState({
            stuName: value,

        });
    }
    //输入学校
    schoolOnChange = (value) => {
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
        var json = {
            "account": this.state.littleAntName,
            "studentName": this.state.stuName,
            "schoolName": this.state.schoolName,
            "childSex": this.state.sex,
            "macAddress": this.state.macAddr,
            "familyRelate": this.state.relation,
            "guardianId": this.state.ident,
            "phoneNumber": this.state.phoneNumber,
            "birthTime": this.state.birthDay,
            "hasStudentAccount": true,
        }
        var param = {
            "method": 'bindWatchGuardian',
            "json": JSON.stringify(json),
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info('验证成功');
                    var url = WebServiceUtil.mobileServiceURL + "loginSuccess?loginType=1";
                    var data = {
                        method: 'openNewPage',
                        selfBack: true,
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

    //点击输入学生账号
    studentClick = () => {
        this.inputRef.focus();
    }
    //点击输入学生姓名
    nameClick = () => {
        this.nameInput.focus();
    }
    //点击输入学校名称
    schooleNameClick = () => {
        this.schoolNameInput.focus();
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
                <div className="topPadding"></div>
                <div className="icon_back" onClick={this.toBack}></div>
                <div className="p38 innerCont bindStu login-input">
                    <div className="picDiv">
                        <img
                            src={require('../../images/stuAccountPic.png')} alt="" />
                    </div>
                    <div onClick={this.handleClick} className="icon_account line_publicD stuCont">
                        <InputItem
                            className=""
                            placeholder="请输入小蚂蚁账号"
                            value={this.state.littleAntName}
                            onChange={this.littAntOnChange}
                            ref={el => this.inputRef = el}
                        ></InputItem>
                    </div>
                    <div onClick={this.nameClick} className="icon_user line_publicD">
                        <InputItem
                            className=""
                            placeholder="请输入孩子姓名"
                            value={this.state.stuName}
                            onChange={this.stuOnChange}
                            ref={el => this.nameInput = el}
                        ></InputItem>
                    </div>
                    <div onClick={this.schooleNameClick} className="icon_school line_publicD">
                        <InputItem
                            className=""
                            placeholder="输入此账号所在的学校名称"
                            value={this.state.schoolName}
                            onChange={this.schoolOnChange}
                            ref={el => this.schoolNameInput = el}
                        ></InputItem>
                    </div>
                </div>
                <div className='submitBtn' onClick={this.submmit}>确定</div>
            </div>
        );
    }
}
