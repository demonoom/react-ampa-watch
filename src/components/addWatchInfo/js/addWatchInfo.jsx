import React from 'react';
import {
    InputItem, Toast, DatePicker,
    Modal, Picker, List, Tabs
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

const tabs = [
    { title: '小蚂蚁账号同步', label: "has" },
    { title: '手动完善信息', label: "notHas" },
];

//格式化数据
function formatDate (date) {
    var str = date + ""
    str = str.replace(/ GMT.+$/, '');// Or str = str.substring(0, 24)
    var d = new Date(str);
    var a = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
    return str = a[0] + '-' + a[1] + '-' + a[2]
}
var calm;
export default class addWatchInfo extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            macAddress: "qaz",
            stuName: "",
            extraClassName: "",
            RelationClassName: "",
            relationValue: "",
            flag: true,
            jump: "check",
            relationData: [
                {
                    value: "爸爸",
                    label: '爸爸'
                },
                {
                    value: "妈妈",
                    label: "妈妈"
                },
                {
                    value: "爷爷",
                    label: "爷爷"
                },
                {
                    value: "奶奶",
                    label: "奶奶"
                },
                {
                    value: "哥哥",
                    label: "哥哥"
                },
                {
                    value: "姐妹",
                    label: "姐姐"
                },
                {
                    value: "叔叔",
                    label: "叔叔"
                },
                {
                    value: "阿姨",
                    label: "阿姨"
                },
                {
                    value: "自定义",
                    label: "自定义"
                },
            ],
            sexValue: "",
            extraClassName: "",
            RelationClassName: "",
            birthClassName: "",
            schName: "",
            littleAntName: "",
            studentName: '',
            classId: '',
            schoolId: '',
            schoolName: '',
            inputValue: '',
            responseList: [],
            data: [],
            cols: 1,
            stuClassName: '',
            schoolClassName: '',
            teName: '',
            teNumOnChange: '',
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
    }

    componentDidMount () {
        Bridge.setShareAble("false");
        window.addEventListener('resize', calm.onWindwoResize);
        /**
      * 防止软键盘挡住页面
      */
        var winHeight = $(window).height(); // 获取当前页面高度  
        $(window).resize(function () {
            var resizeHeight = $(this).height();
            if (winHeight - resizeHeight > 50) {
                // 软键盘弹出  
                $('body').css('height', $(window).height() + 'px');
                $(".button_preNext").hide()
            } else {
                //软键盘收起
                $('body').css('height', '100%');
                $(".button_preNext").show()
            }
        });

    }
    componentWillUnmount () {
        window.removeEventListener('resize', calm.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize = () => {
        // this
        setTimeout(() => {
            calm.setState({
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
                if (result.success) {
                    if (result.response == null) {
                        this.setState({
                            loginType: 1,
                        })
                    } else {
                        this.setState({
                            loginType: 0,
                        })
                    }

                } else {
                    Toast.fail(result.msg, 1, null, false);
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
        this.getWatch2gByMacAddress("qq1");
        var data = {
            method: 'watchBinding'
        };
        Bridge.callHandler(data, (mes) => {
            this.setState({ macAddress: mes });
            this.getWatch2gByMacAddress(mes)
        }, function (error) {
        });
    }


    //自定义关系
    showModal () {
        this.setState({
            flag: false
        })
        prompt('请输入关系', '', [
            {
                text: '取消', onPress: value => {
                    this.setState({
                        relationValue: "",
                        RelationClassName: 'color_3'
                    }, () => {
                    });
                },
            },
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
    nextFirPage = () => {
        if (this.state.loginType == 1) {
            if (this.state.macAddress == "") {
                Toast.info("请扫描手表", 1, null, false)
                return
            }
            if (this.state.relationValue == "") {
                Toast.info("请选择您与孩子的关系", 1, null, false)
                return
            }
            $(".firDiv").hide();
            $(".secDiv").show();
        } else {
            if (this.state.macAddress == "") {
                Toast.info("请扫描手表", 1, null, false)
                return
            }
            if (this.state.relationValue == "") {
                Toast.info("请选择您与孩子的关系", 1, null, false)
                return
            }
            //副监护人
            var param = {
                "method": 'bindWatchGuardian',
                "macAddress": this.state.macAddress,
                "familyRelate": this.state.relationValue[0],
                "actionName": "watchAction",
                "guardianId": this.state.ident//绑定监护人的userId
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    if (result.success) {
                        var url = WebServiceUtil.mobileServiceURL + "loginSuccess?loginType=" + this.state.loginType;
                        var data = {
                            method: 'openNewPage',
                            url: url
                        };
                        Bridge.callHandler(data, null, function (error) {
                            window.location.href = url;
                        });
                    } else {
                        Toast.fail(result.msg, 1, null, false);
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
        console.log(data, "data")
        Bridge.callHandler(data, null, function (error) {
        });
    }
    showAlertExit () {
        var _this = this;
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定放弃本次编辑吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => calm.toBack() },
        ], phone);

    }


    //input聚焦
    handleClick = () => {
        this.inputLittantRef.focus();
    }
    //input聚焦
    handlePhoneClick = () => {
        this.inputPhoneRef.focus();
    }


    //第二个div
    //自定义关系


    //上一步
    preSenPage = () => {
        $(".firDiv").show();
        $(".secDiv").hide();
    }
    //跳转下一页
    nextSenPage = () => {
        if (this.state.sexValue == "") {
            Toast.info("请选择孩子性别", 1, null, false)
            return
        }
        if (this.state.sendData == undefined) {
            Toast.info("请选择孩子生日", 1, null, false)
            return
        }
        if (this.state.phonenumber == undefined) {
            Toast.info("请输入手表号码", 1, null, false)
            return
        }
        $(".secDiv").hide();
        $(".thirDiv").show();

    }
    //选择器改变事件
    onSexChange = (val) => {
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

    //第三个div
    preThirPage = () => {

        $(".thirDiv").hide();
        $(".secDiv").show();
    }

    //第三个div的下一步
    nextThirPage = () => {
        if (this.state.jump == "check") {
            if (this.state.littleAntName == "") {
                Toast.info("请输入小蚂蚁账号", 1, null, false);
                return
            }
            $(".thirDiv").hide();
            $(".forDiv").show();
        } else {
            if (this.state.studentName.trim() === '') {
                Toast.fail('请输入学生姓名', 1, null, false);
                return
            }
            if (this.state.classId === '') {
                Toast.fail('请选择学生所在班级', 1, null, false);
                return
            }

            $(".thirDiv").hide();
            $(".regiForDiv").show();
        }
    }

    onTabsChange = (v) => {
        if (v.label == "has") {
            this.setState({
                jump: "check"
            })
        } else {
            this.setState({
                jump: "write"
            })
        }
    }

    //第四个div
    //输入小蚂蚁账号
    littAntOnChange = (value) => {
        this.setState({
            littleAntName: value,

        });
    }
    //输入学生姓名
    stuOnChangeHas = (value) => {
        this.setState({
            stuName: value,

        });
    }
    //输入学校
    schoolOnChange = (value) => {
        this.setState({
            schName: value,
        });
    }

    preForPage = () => {
        $(".forDiv").hide();
        $(".thirDiv").show();
    }

    //点击提交按钮
    nextForPage = () => {
        if (this.state.stuName == "") {
            Toast.info("请输入学生名称", 1, null, false);
            return
        }
        if (this.state.schName == "") {
            Toast.info("请输入学校名称", 1, null, false);
            return
        }
        var json = {
            "account": this.state.littleAntName,
            "studentName": this.state.stuName,
            "schoolName": this.state.schName,
            "childSex": this.state.sexValue[0],
            "macAddress": this.state.macAddress,
            "familyRelate": this.state.relationValue[0],
            "guardianId": this.state.ident,
            "phoneNumber": this.state.phonenumber,
            "birthTime": this.state.sendData,
            "hasStudentAccount": true,
        }
        var param = {
            "method": 'bindWatchGuardian',
            "json": JSON.stringify(json),
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info('绑定成功', 1, null, false);
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
                    Toast.fail(result.msg, 1, null, false);
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


    /**
     * 注册输入
     */

    /**
   * 改变学生姓名
   * @param e
   */
    stuOnChange = (e) => {
        this.setState({ studentName: e })
    };

    schoolOnClick = () => {
        $('.updateModel').slideDown();
        $('.mask').show();
    };

    /**
     * 根据学校名称搜索学校
     * getSchoolsBySchoolName(String schoolName,String pageNo)
     */
    getSchoolsBySchoolName = () => {
        var _this = this;
        if (this.state.inputValue === '') {
            Toast.fail('请输入内容', 1, null, false);
            return
        }
        var param = {
            "method": 'getSchoolsBySchoolName',
            "schoolName": this.state.inputValue,
            "pageNo": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.response.length === 0) {
                        Toast.info('未找到相关学校', 1, null, false)
                    } else {
                        _this.buildSchoolList(result.response)
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    buildSchoolList = (data) => {
        var _this = this;
        var arr = [];
        data.forEach(function (v, i) {
            arr.push(<li
                className='line_publicD noomPowerList textOver'
                onClick={() => {
                    _this.schoolItemOnClick(v);
                }}>{v.name}</li>)
        });
        this.setState({ responseList: arr })
    };

    schoolItemOnClick = (data) => {
        this.exitSchoolInput();
        this.setState({ schoolName: data.name, schoolId: data.id, schoolClassName: 'color_3' })
    };

    schoolNameOnChange = (e) => {
        this.setState({ inputValue: e.target.value })
    };

    exitSchoolInput = () => {
        this.setState({ responseList: [] });
        $('.updateModel').slideUp();
        $('.mask').hide();
        this.setState({ inputValue: '' })
    };

    classOnClick = () => {
        if (this.state.schoolId === '') {
            Toast.fail('请先选择学校', 1, null, false);
            return
        }
        this.getGradesBySchoolId(this.state.schoolId);
    };

    /**
     * 根据学校id查询所有年级
     * getGradesBySchoolId(String schoolId,String pageNo)
     */
    getGradesBySchoolId = (schoolId) => {
        var _this = this;
        var param = {
            "method": 'getGradesBySchoolId',
            "schoolId": schoolId,
            "pageNo": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    var arr = result.response.map((v) => {
                        return {
                            "value": v.id,
                            "label": v.name
                        }
                    });
                    _this.setState({
                        data: arr,
                    }, () => {
                        _this.onPickerChange([arr[0].value])
                    });
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    onPickerChange = (val) => {
        var _this = this;
        let colNum = 1;

        let par = new Promise((resolve, reject) => {
            this.getClazzesByGradeId(val, function (obj) {
                resolve(obj);
            });
        });
        Promise.all([par]).then((result) => {
            var arr = _this.state.data;
            arr.map((v) => {
                if (v.value === [...val][0]) {
                    v.children = result[0]
                }
            });
            const d = arr;
            const asyncValue = [...val];

            d.forEach((i) => {
                if (i.children && i.value === val[0]) {
                    colNum = 2;
                    asyncValue.push(i.children[0].value);
                }
            });
            this.setState({
                data: d,
                cols: colNum,
                asyncValue,
            });

        });
    };

    /**
     * 查询此年级的所有的班级
     * @param data
     * getClazzesByGradeId(String gradeId)
     */
    getClazzesByGradeId = (data, resolve) => {
        var param = {
            "method": 'getClazzesByGradeId',
            "gradeId": data[0],
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    resolve(result.response.map((v) => {
                        return {
                            "label": v.name,
                            "value": v.id
                        }
                    }))
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };


    /**
   * 注册验证
   */
    teNameOnChange = (e) => {
        this.setState({ teName: e })
    };

    teNumOnChange = (e) => {
        this.setState({ teNumOnChange: e })
    };

    nextForRegPage = () => {
        if (this.state.teName.trim() === '') {
            Toast.fail('请输入教师姓名', 1, null, false);
            return
        }
        if (this.state.teNumOnChange.trim() === '') {
            Toast.fail('请输入教师电话', 1, null, false);
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
            "studentName": this.state.studentName,
            "schoolName": this.state.schoolName,
            "childSex": this.state.sexValue[0],
            "macAddress": this.state.macAddress,
            "familyRelate": this.state.relationValue[0],
            "guardianId": this.state.ident,
            "phoneNumber": this.state.phonenumber,
            "birthTime": this.state.sendData,
            "schoolId": this.state.schoolId,
            "clazzId": this.state.classId,
            "userName": this.state.studentName,
            "teacherName": this.state.teName,
            "teacherPhoneNumber": this.state.teNumOnChange,
            "hasStudentAccount": false,
        };
        var param = {
            "method": 'bindWatchGuardian',
            "json": JSON.stringify(obj),
            "actionName": "watchAction"
        };
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
                        Toast.fail('请核实信息正确性', 2, null, false);
                    } else {
                        Toast.fail(result.msg, 1, null, false)
                    }
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    preForRegPage = () => {
        $(".thirDiv").show();
        $(".regiForDiv").hide();
    }


    render () {
        return (
            <div id="addWatchInfo" style={{ height: this.state.clientHeight }}>
                <div className="am-navbar-blue whiteBack">
                    <div className="am-navbar am-navbar-light">
                        <div onClick={this.showAlertExit} className="am-navbar-left" role="button">
                            <i className='icon-back'></i>
                        </div>
                        <div className="am-navbar-title">完善手表信息</div>
                        <div className="am-navbar-right"></div>
                    </div>
                </div>
                <div className="commonLocation-cont bg_white">
                    <div className="firDiv">
                        <div className="p38 innerCont">
                            <div className="infoContent">
                                <div className='line_publicD'>
                                    <div className="p10 scanDiv">
                                        <span className='text_hidden color_c' style={{ display: this.state.macAddress ? "none" : "inline-block" }}>请扫描手表二维码</span>
                                        <span className='text_hidden' style={{ display: this.state.macAddress ? "inline-block" : "none" }}>{this.state.macAddress}</span>
                                        <span className='scanBtn' onClick={this.scanCode}>扫描</span>
                                    </div>
                                </div>
                                <div className={'selectDown relation line_publicD ' + this.state.RelationClassName}>
                                    <Picker
                                        data={this.state.relationData}
                                        value={this.state.relationValue}
                                        cols={1}
                                        extra={this.state.flag ? "我是他的" : this.state.relationValue}
                                        onChange={this.onRelationChange}
                                        onOk={this.clickRelationSure}
                                        onDismiss={this.onRelationCancel}
                                    >
                                        <List.Item arrow="horizontal"></List.Item>
                                    </Picker>
                                </div>
                            </div>
                        </div>
                        <div className='submitBtn' onClick={this.nextFirPage}>下一步</div>
                    </div>
                    <div className="secDiv" style={{ display: "none" }}>
                        <div className="p38">
                            <div className='dec'>手表初次绑定，请完善相关信息</div>
                            <img className='progressPic' src={require('../../images/progress1.png')} alt="" />
                            <div className="infoContent selectDown">
                                <div className={'sex line_publicD ' + this.state.extraClassName}>
                                    <Picker
                                        data={sexData}
                                        value={this.state.sexValue}
                                        cols={1}
                                        extra="请选择孩子的性别"
                                        onChange={this.onSexChange}
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
                            </div>
                            <div>
                                <div onClick={this.handlePhoneClick} className='login-input line_publicD icon_watch'>
                                    <InputItem
                                        value={this.state.phonenumber}
                                        onChange={this.phoneNumber}
                                        type="phone"
                                        placeholder="请输入手表号码"
                                        ref={el => this.inputPhoneRef = el}
                                    ></InputItem>
                                </div>
                            </div>
                        </div>
                        <div className="button_preNext">
                            <div className='prev' onClick={this.preSenPage}>上一步</div>
                            <div className='next' onClick={this.nextSenPage}>下一步</div>
                        </div>

                    </div>
                    <div className="thirDiv" style={{ display: "none" }}>
                        <div className="p38 stuAccountRegist">
                            <div className='dec'>手表初次绑定，请完善相关信息</div>
                            <img className='progressPic' src={require('../../images/progress2.png')} alt="" />
                            <div className="p29">
                                <Tabs onChange={this.onTabsChange} tabs={tabs} initialPage={0} animated={false} useOnPan={false}>
                                    <div className="tabCont">
                                        <div onClick={this.handleClick} className="icon_account login-input line_publicD stuCont">
                                            <InputItem
                                                className=""
                                                placeholder="请输入小蚂蚁账号"
                                                value={this.state.littleAntName}
                                                onChange={this.littAntOnChange}
                                                ref={el => this.inputLittantRef = el}
                                            ></InputItem>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <div className="innerCont tabCont">
                                                <div className="infoContent selectDown">
                                                    <div className='am-list-item am-list-item-middle line_publicD icon-graySchool '
                                                        onClick={this.schoolOnClick}>
                                                        <div className="am-list-line">
                                                            <div className="am-list-content"></div>
                                                            <div
                                                                className={'am-list-extra ' + this.state.schoolClassName}>{this.state.schoolName == '' ? '学生所在学校' : this.state.schoolName}</div>
                                                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                                                        </div>
                                                    </div>
                                                    <div id='stuClazz' className={'line_publicD icon-grayClass ' + this.state.stuClassName}>
                                                        <Picker
                                                            data={this.state.data}
                                                            cols={this.state.cols}
                                                            value={this.state.asyncValue}
                                                            onPickerChange={this.onPickerChange}
                                                            onOk={v => this.setState({ classId: this.state.asyncValue[1], stuClassName: 'color_3' })}
                                                            extra='学生所在班级'
                                                        >
                                                            <List.Item arrow="horizontal" onClick={this.classOnClick}> </List.Item>
                                                        </Picker>
                                                    </div>
                                                </div>
                                                <div className="line_publicD login-input icon-grayStudent">
                                                    <InputItem
                                                        className=""
                                                        placeholder="请输入学生姓名"
                                                        value={this.state.studentName}
                                                        onChange={this.stuOnChange}
                                                    ></InputItem>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tabs>
                            </div>

                        </div>
                        <div className="button_preNext">
                            <div className='prev' onClick={this.preThirPage}>上一步</div>
                            <div className='next' onClick={this.nextThirPage}>下一步</div>
                        </div>
                    </div>
                    <div className="forDiv" style={{ display: "none" }}>
                        <div className="p38">
                            <div className='dec'>手表初次绑定，请完善相关信息</div>
                            <img className='progressPic' src={require('../../images/progress3.png')} alt="" />
                            <div className="p29 login-input">
                                <div className='accountName'>
                                    {this.state.littleAntName}
                                </div>
                                <div onClick={this.nameClick} className="icon_user line_publicD">
                                    <InputItem
                                        className=""
                                        placeholder="请输入孩子姓名"
                                        value={this.state.stuName}
                                        onChange={this.stuOnChangeHas}
                                        ref={el => this.nameInput = el}
                                    ></InputItem>
                                </div>
                                <div onClick={this.schooleNameClick} className="icon_school line_publicD">
                                    <InputItem
                                        className=""
                                        placeholder="输入此账号所在的学校名称"
                                        value={this.state.schName}
                                        onChange={this.schoolOnChange}
                                        ref={el => this.schoolNameInput = el}
                                    ></InputItem>
                                </div>
                            </div>
                        </div>
                        <div className="button_preNext">
                            <div className='prev' onClick={this.preForPage}>上一步</div>
                            <div className='next' onClick={this.nextForPage}>下一步</div>
                        </div>
                    </div>
                    <div className="regiForDiv" style={{ display: "none" }}>
                        <div className="p38">
                            <div className='dec'>手表初次绑定，请完善相关信息</div>
                            <img className='progressPic' src={require('../../images/progress3.png')} alt="" />
                            <div id="validationMes">
                                <div className="p29">
                                    <div className="infoContent">
                                        <div className="School-information text_hidden">
                                            <span className="school">{this.state.schoolName}</span>
                                            <span className="class">{$('#stuClazz .am-list-extra').html() != undefined ? $('#stuClazz .am-list-extra').html().split(",").join("") : ""}</span>
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
                            </div>
                        </div>
                        <div className="button_preNext">
                            <div className='prev' onClick={this.preForRegPage}>上一步</div>
                            <div className='next' onClick={this.nextForRegPage}>下一步</div>
                        </div>
                    </div>
                </div>

                <div className="stuAccountRegist">
                    <div className="mask" onClick={this.exitSchoolInput} style={{ display: 'none' }}></div>
                    <div className='updateModel' style={{ display: 'none' }}>
                        <div className='searchDiv'>
                            <input type="text" value={this.state.inputValue} onChange={this.schoolNameOnChange}
                                placeholder='请输入搜索内容' />
                            <span onClick={this.getSchoolsBySchoolName}>搜索</span>
                        </div>
                        <div className='cont'>
                            {this.state.responseList}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
