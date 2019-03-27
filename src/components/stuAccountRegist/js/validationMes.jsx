import React from "react";
import {Toast, InputItem, Button} from 'antd-mobile';
import '../css/validationMes.less'

export default class validationMes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teName: '',
            teNumOnChange: '',
        };
    }

    componentDidMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var macAddr = locationSearch.split("&")[0].split('=')[1];
        var classId = locationSearch.split("&")[1].split('=')[1];
        var schoolId = locationSearch.split("&")[2].split('=')[1];
        var stuName = locationSearch.split("&")[3].split('=')[1];
        var schName = locationSearch.split("&")[4].split('=')[1];
        var clazzName = locationSearch.split("&")[5].split('=')[1];
        var sex = locationSearch.split("&")[6].split('=')[1];
        var relation = locationSearch.split("&")[7].split('=')[1];
        var phoneNumber = locationSearch.split("&")[8].split('=')[1];
        var ident = locationSearch.split("&")[9].split('=')[1];
        var birthDay = locationSearch.split("&")[10].split('=')[1];
        this.setState({
            macAddr,
            classId,
            schoolId,
            stuName,
            schName,
            clazzName,
            sex,
            relation,
            phoneNumber,
            ident,
            birthDay
        });
    }

    teNameOnChange = (e) => {
        this.setState({teName: e})
    };

    teNumOnChange = (e) => {
        this.setState({teNumOnChange: e})
    };

    nextStep = () => {
        if (this.state.teName.trim() === '') {
            Toast.fail('请输入教师姓名',1,null,false);
            return
        }
        if (this.state.teNumOnChange.trim() === '') {
            Toast.fail('请输入教师电话',1,null,false);
            return
        }
        this.bindStudentAccountAndSaveStudent()
    };

    /**
     * 关联学生id与手表id(没有学生帐号的情况下先创建帐号)
     * public boolean bindStudentAccountAndSaveStudent(String watch2gId,String userName,String schoolId,String clazzId,String gender,String teacherName,String teacherPhoneNumber)
     */
    bindStudentAccountAndSaveStudent = () => {
        var obj = {
            "studentName": this.state.stuName,
            "schoolName": this.state.schName,
            "childSex": this.state.sex,
            "macAddress": this.state.macAddr,
            "familyRelate": this.state.relation,
            "guardianId": this.state.ident,
            "phoneNumber": this.state.phoneNumber,
            "birthTime": this.state.birthDay,
            "schoolId": this.state.schoolId,
            "clazzId": this.state.classId,
            "userName": this.state.stuName,
            "teacherName": this.state.teName,
            "teacherPhoneNumber": this.state.teNumOnChange,
            "hasStudentAccount": false,
        };

        var param = {
            "method": 'bindWatchGuardian',
            "json": JSON.stringify(obj),
            "actionName": "watchAction"
        };

        console.log(param);

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    var url = encodeURI(WebServiceUtil.mobileServiceURL + "loginSuccess??type=1");
                    var data = {
                        method: 'openNewPage',
                        selfBack: true,
                        url: url
                    };
                    Bridge.callHandler(data, null, function (error) {
                        window.location.href = url;
                    });
                } else {
                    if (result.msg === '老师电话号码验证错误') {
                        Toast.fail('请核实信息正确性',2,null,false);
                    } else {
                        Toast.fail(result.msg,1,null,false)
                    }
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }

    render() {
        return (
            <div id="validationMes">
                <div className="topPadding"></div>
                <div className="icon_back" onClick={this.toBack}></div>
                <div className="p38 innerCont">
                    <div className="infoContent">
                        <div className="bindStudent">
                            <img src={require('../../images/bindTeacher.png')} alt=""/>
                        </div>
                        <div className="School-information">
                            <span className="school text_hidden">{this.state.schName}</span>
                            <span className="class text_hidden">{this.state.clazzName}</span>
                        </div>
                        <div className="line_publicD login-input icon-grayTeacher">
                            <InputItem
                                className=""
                                placeholder="请输入班级教师姓名"
                                value={this.state.teName}
                                onChange={this.teNameOnChange}
                            ></InputItem>
                        </div>
                        <div className="line_publicD login-input icon-grayPhone">
                            <InputItem
                                className=""
                                placeholder="请输入该教师电话号码"
                                value={this.state.teNumOnChange}
                                onChange={this.teNumOnChange}
                            ></InputItem>
                        </div>
                    </div>
                </div>
                <div className="submitBtn" onClick={this.nextStep}>下一步</div>
            </div>
        )
    }
}



