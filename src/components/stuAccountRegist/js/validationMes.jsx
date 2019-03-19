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
        this.setState({macAddr, classId, schoolId, stuName});
        this.getWatch2gByMacAddress(macAddr);
    }

    /**
     * 根据mac地址查询手表
     * public Watch2g getWatch2gByMacAddress(String macAddress)
     */
    getWatch2gByMacAddress = (macAddr) => {
        var _this = this;
        var param = {
            "method": 'getWatch2gByMacAddress',
            "macAddress": macAddr,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    _this.setState({childSex: result.response.childSex, macId: result.response.id})
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    teNameOnChange = (e) => {
        this.setState({teName: e})
    };

    teNumOnChange = (e) => {
        this.setState({teNumOnChange: e})
    };

    nextStep = () => {
        if (this.state.teName.trim() === '') {
            Toast.fail('请输入教师姓名');
            return
        }
        if (this.state.teNumOnChange.trim() === '') {
            Toast.fail('请输入教师电话');
            return
        }
        this.bindStudentAccountAndSaveStudent()
    };

    /**
     * 关联学生id与手表id(没有学生帐号的情况下先创建帐号)
     * public boolean bindStudentAccountAndSaveStudent(String watch2gId,String userName,String schoolId,String clazzId,String gender,String teacherName,String teacherPhoneNumber)
     */
    bindStudentAccountAndSaveStudent = () => {
        var param = {
            "method": 'bindStudentAccountAndSaveStudent',
            "watch2gId": this.state.macId,
            "schoolId": this.state.schoolId,
            "clazzId": this.state.classId,
            "gender": this.state.childSex,
            "userName": this.state.stuName,
            "teacherName": this.state.teName,
            "teacherPhoneNumber": this.state.teNumOnChange,
            "actionName": "watchAction"
        };
        
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    var url = encodeURI(WebServiceUtil.mobileServiceURL + "loginSuccess??type=1");
                    var data = {
                        method: 'openNewPage',
                        url: url
                    };
                    Bridge.callHandler(data, null, function (error) {
                        window.location.href = url;
                    });
                } else {
                    if (result.msg === '老师电话号码验证错误') {
                        Toast.fail('请核实信息正确性', 2);
                    } else {
                        Toast.fail(result.msg)
                    }
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    render() {
        return (
            <div id="validationMes">
                <h1>验证信息</h1>
                <InputItem
                    className=""
                    placeholder="请输入班级教师姓名"
                    value={this.state.teName}
                    onChange={this.teNameOnChange}
                ></InputItem>
                <InputItem
                    className=""
                    placeholder="请输入该教师电话号码"
                    value={this.state.teNumOnChange}
                    onChange={this.teNumOnChange}
                ></InputItem>
                <Button type='primary' onClick={this.nextStep}>下一步</Button>
            </div>
        )
    }
}



