import React from 'react';
import {Toast, Picker, List, WhiteSpace, Button, WingBlank, InputItem, DatePicker, TextareaItem} from 'antd-mobile';
import '../css/updateCurriculumSchedule.less'

export default class updateCurriculumSchedule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cols: 1,
            data: [{value: '1', label: '星期一'},
                {value: '2', label: '星期二'},
                {value: '3', label: '星期三'},
                {value: '4', label: '星期四'},
                {value: '5', label: '星期五'},
                {value: '6', label: '星期六'},
                {value: '7', label: '星期日'}],
            classData: [],
            posData: [],
            terData: [],
            termData: [{value: '-1', label: '自定义学期'}],
            asyncValue: [],
            termAsyncValue: [],
            classAsyncValue: [],
            posAsyncValue: [],
            terAsyncValue: [],
            ClassTableArr: [],  //课表结构
            ClassTableDataArr: [],  //课表数据
            clientHeight: document.body.clientHeight,
        };
    }

    componentWillMount() {
        document.title = '修改课程表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var currentScheduleId = locationSearch.split("&")[0].split('=')[1];
        var clazzOrRoomId = locationSearch.split("&")[1].split('=')[1];
        var termId = locationSearch.split("&")[2].split('=')[1];
        var week = locationSearch.split("&")[3].split('=')[1];
        var curriculumType = locationSearch.split("&")[4].split('=')[1];
        if(curriculumType==1){
            this.getClazzesByUserId(JSON.parse(localStorage.getItem('loginUserSchedule')).colUid,clazzOrRoomId);
        }else{
            this.getClazzRoomsByUserId(JSON.parse(localStorage.getItem('loginUserSchedule')).colUid,clazzOrRoomId);
        }
        this.chooseTerms(termId);
        var asyncValue = [week];
        var termAsyncValue = [termId];
        this.viewClassRoomPage();
        this.getTeacherByCreator();
        this.viewCourseTableItem(currentScheduleId);
        this.setState({curriculumType,asyncValue,currentScheduleId,termAsyncValue});
        window.addEventListener('resize', this.onWindwoResize);
        
    }
    componentDidMount(){
        Bridge.setShareAble("false");
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindwoResize);
    }
    //监听窗口改变时间
    onWindwoResize() {
        // this
        setTimeout(() => {
            teacherV.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }
    /**
     * 星期切换的回调
     * @param val
     */
    onPickerChange = (val) => {
        const d = [...this.state.data];
        const asyncValue = [...val];
        this.setState({
            data: d,
            asyncValue,
        });
    };

    /**
     * 班级切换的回调
     * @param val
     */
    onClassPickerChange = (val) => {
        const d = [...this.state.classData];
        const classAsyncValue = [...val];
        this.setState({
            classData: d,
            classAsyncValue,
        });
    }

    /**
     * 学期切换的回调
     * @param val
     */
    onTermPickerChange = (val) => {
        const d = [...this.state.termData];
        const termAsyncValue = [...val];
        this.setState({
            termData: d,
            termAsyncValue,
        });
    };

    /**
     * 上课地点切换的回调
     * @param val
     */
    onPosPickerChange = (val) => {
        const d = [...this.state.posData];
        const posAsyncValue = [...val];
        this.setState({
            posData: d,
            posAsyncValue,
        });
    }

    onTerPickerChange = (val) => {
        const d = [...this.state.terData];
        const terAsyncValue = [...val];
        this.setState({
            terData: d,
            terAsyncValue,
        });
    }

    /**
     * 新增课表项
     */
    updateCourseTableItem = () => {
        var _this = this;
        if (this.state.classAsyncValue.length == 0) {
            var tipMessage = "请选择班级";
            if(_this.state.curriculumType == 2){
                tipMessage = "请选择教室";
            }
            Toast.fail(tipMessage,2);
            return
        }
        if (this.state.termAsyncValue.length == 0) {
            Toast.fail('请选择学期',2);
            return
        }
        if (this.state.asyncValue.length == 0) {
            Toast.fail('请选择星期',2);
            return
        }
        if (this.state.ClassTableDataArr.length == 0) {
            Toast.fail('课表不能为空',2);
            return
        }
        for (var i = 0; i < this.state.ClassTableDataArr.length; i++) {
            var v = this.state.ClassTableDataArr[i];
            if (v.startTimeData == '开始时间' || v.endTimeData == '结束时间' || v.clazzName == '' || v.teacherName == '') {
                Toast.fail('课表存在空值',2);
                return false
            }
            if(_this.state.curriculumType == 1 && v.classAd == '上课地点'){
                Toast.fail('课表存在空值',2);
                return false
            }
        }
        var param = {
            "method": 'updateCourseTableItem',
            "cti": {
                "id":parseInt(this.state.currentScheduleId),
                "creator_id": JSON.parse(localStorage.getItem('loginUserSchedule')).colUid,
                "week": this.state.asyncValue[0],
                // "classId": this.state.classAsyncValue[0],
                "semesterId": this.state.termAsyncValue[0]
            }
        };
        var classArray = [];
        this.state.ClassTableDataArr.forEach(function (v, i) {
            //如果是公共教室，则isPublic固定为true
            var isPublic = true;
            //公共教室则以开始选择的教室id为上课地点
            var classRoomId = _this.state.classAsyncValue[0];
            if(_this.state.curriculumType == 1){
                //如果是普通教室，则需要选择上课地点
                classRoomId = _this.state.posAsyncValue[0];
                isPublic = false;
            }
            param.cti.courseName = v.clazzName;
            param.cti.index = v.index;
            param.cti.teacherId = _this.state.terAsyncValue[0] || v.teacherId;
            param.cti.classRoomId = classRoomId;
            param.cti.isPublic = isPublic;
            param.cti.openTime = v.startTimeData;
            param.cti.closeTime = v.endTimeData;
            param.cti.comment = v.nodeDetal;
            /*classArray.push({
                "courseName": v.clazzName,
                "index": i + 1,
                "teacherId": v.teacherName,
                "classRoomId": classRoomId,
                "isPublic": isPublic,
                "openTime": v.startTimeData,
                "closeTime": v.endTimeData,
                "comment": v.nodeDetal
            })*/
        })
        // param.cti.schedules = classArray;
        if(_this.state.curriculumType == 1){
            //班级课程表，只有在给班级定制课程表时才需要给定该参数
            param.cti.classId = _this.state.classAsyncValue[0];
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('成功');
                    //关闭当前窗口，并刷新上一个页面
                    var data = {
                        method: 'finishForRefresh',
                    };

                    Bridge.callHandler(data, null, function (error) {
                        console.log(error);
                    });
                    // _this.state.asyncValue.splice(0);
                    // _this.state.classAsyncValue.splice(0);
                    // _this.state.termAsyncValue.splice(0);
                    // _this.state.ClassTableDataArr.splice(0);
                    // _this.buildClassTable();
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    /**
     * 课程名称数据框动态绑定内容的方法
     * @param index
     * @param value
     */
    inputOnChange = (index, value) => {
        this.state.ClassTableDataArr[index].clazzName = value;
        this.buildClassTable();
        // this.buildClassTableItem(this.state.courseTableItem,this.state.terData);
    }

    /**
     * 备注数据框动态绑定内容的方法
     * @param index
     * @param value
     */
    textareaOnChange = (index, value) => {
        this.state.ClassTableDataArr[index].nodeDetal = value;
        this.buildClassTable();
    }

    /**
     * 开课时间动态绑定内容的方法
     * @param v
     * @param i
     */
    startTimeOnOk(v, i) {
        this.state.ClassTableDataArr[i].startTimeData = WebServiceUtil.formatHM(new Date(v).getTime());
        this.buildClassTable();
    }

    /**
     * 下课时间动态绑定内容的方法
     * @param v
     * @param i
     */
    endTimeOnOk(v, i) {
        this.state.ClassTableDataArr[i].endTimeData = WebServiceUtil.formatHM(new Date(v).getTime());
        this.buildClassTable();
    }

    getTeacherByCreator = () => {
        var _this = this;
        var param = {
            "method": 'getTeacherByCreator',
            "aid": JSON.parse(localStorage.getItem('loginUserSchedule')).colUid
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = [];
                        result.response.forEach(function (v, i) {
                            arr.push({
                                value: v.colUid, label: v.userName
                            })
                        })
                        _this.buildClassTableItem(_this.state.courseTableItem,arr);
                        _this.setState({terData: arr});
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    viewClassRoomPage = () => {
        var _this = this;
        var param = {
            "method": 'viewClassRoomPage',
            "uid": JSON.parse(localStorage.getItem('loginUserSchedule')).colUid,
            "pn": -1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = [];
                        result.response.forEach(function (v, i) {
                            arr.push({
                                value: v.id, label: v.name
                            })
                        })
                        _this.setState({posData: arr});
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    posPickerOnOk(v, i) {
        var classAd = ''
        this.state.posData.forEach(function (item, index) {
            if (item.value == v) {
                classAd = item.label
            }
        })
        this.state.ClassTableDataArr[i].classAd = classAd;
        this.state.ClassTableDataArr[i].classAddress = v[0];
        this.buildClassTable();
    }

    terPickerOnOk(v, i) {
        var terName = ''
        var terId = ''
        this.state.terData.forEach(function (item, index) {
            if (item.value == v) {
                terName = item.label
                terId = item.value
            }
        })
        this.state.ClassTableDataArr[i].teacherId = terId;
        this.state.ClassTableDataArr[i].teacherName = terName;
        this.buildClassTable();
    }

    /**
     * 根据数据构建,完成数据的动态绑定
     */
    buildClassTable = () => {
        var _this = this;
        var ClassTableArr = [];
        this.state.ClassTableDataArr.forEach(function (v, i) {
            ClassTableArr.push(<div>
                <div className="cont_communal add_title font_gray">第{i + 1}节</div>
                <div className="flex_container my_flex teacher_list">
                    <DatePicker
                        mode="time"
                        use24Hours
                        title='开始时间'
                        onOk={(time) => _this.startTimeOnOk(time, i)}
                    >
                        <span className="add_element">{_this.state.ClassTableDataArr[i].startTimeData}<i
                            className="icon_triangle"></i></span>
                    </DatePicker>
                    <DatePicker
                        mode="time"
                        use24Hours
                        title='结束时间'
                        onOk={(time) => _this.endTimeOnOk(time, i)}
                    >
                        <span className="add_element">{_this.state.ClassTableDataArr[i].endTimeData}<i
                            className="icon_triangle"></i></span>
                    </DatePicker>
                    <Picker
                        data={_this.state.terData}
                        cols={1}
                        value={_this.state.terAsyncValue}
                        onPickerChange={_this.onTerPickerChange}
                        onOk={v => _this.terPickerOnOk(v, i)}
                    >
                        <span className="add_element">
                            <span className="text_hidden overflow_width">{_this.state.ClassTableDataArr[i].teacherName}</span>
                            <i className="icon_triangle"></i>
                        </span>
                    </Picker>
                    {/*上课地点*/}
                </div>
                {_this.state.curriculumType == 1?<div className="flex_container my_flex flex_addElement">
                    <Picker
                        data={_this.state.posData}
                        cols={1}
                        value={_this.state.posAsyncValue}
                        onPickerChange={_this.onPosPickerChange}
                        onOk={v => _this.posPickerOnOk(v, i)}
                    >
                        <span className="add_element">
                            <span className="text_hidden overflow_width">{_this.state.ClassTableDataArr[i].classAd}</span>
                            <i className="icon_triangle"></i>
                        </span>
                    </Picker>

                </div>:null}
                <div className="flex_container my_flex flex_addElement">
                    <InputItem
                        className="add_element"
                        placeholder="请输入课程名称"
                        value={v.clazzName}
                        onChange={_this.inputOnChange.bind(this, i)}
                    ></InputItem>
                </div>
                <div className="flex_container my_flex flex_addElement">
                    <TextareaItem
                        rows={2}
                        className="add_element"
                        placeholder="添加备注"
                        labelNumber={2}
                        value={v.nodeDetal}
                        onChange={_this.textareaOnChange.bind(this, i)}
                    />
                </div>
            </div>)
            _this.setState({ClassTableArr})
        })
    };

    /**
     * 新增课表表单
     * 新增只是增加数据,然后到构建的方法中根据数据构建
     */
    addClassTable = () => {
        /**
         * startTimeData开课时间
         * endTimeData结束时间
         * classAd开课地点
         * clazzName课程名称
         */
        this.state.ClassTableDataArr.push({
            startTimeData: '开始时间',
            endTimeData: '结束时间',
            classAd: '上课地点',
            teacherId: '选择老师',
            teacherName: '',
            clazzName: '',
            nodeDetal: ''
        });
        this.buildClassTable();
    };

    /**
     * 选择学期点击确定的回调
     */
    termOnOk(v) {
        if (v[0] == -1) {
            //跳转到编辑学期页面
            var url = WebServiceUtil.mobileServiceURL + "definedTerm";
            var data = {
                method: 'openNewPage',
                url: url
            };

            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        }
    }

    /**
     * 获取学期列表，并设置默认的学期
     * @param currentTerm
     */
    chooseTerms = (currentTerm) => {
        var _this = this;
        var param = {
            "method": 'getSemesterList',
            "uid": JSON.parse(localStorage.getItem('loginUserSchedule')).colUid
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = []
                        result.response.forEach(function (v, i) {
                            arr.push(
                                {
                                    value: v.id,
                                    label: v.name
                                })
                        })
                        var termAsyncValue = [parseInt(currentTerm)];
                        _this.setState({termData: _this.state.termData.concat(arr),termAsyncValue})
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    getClazzesByUserId(id,clazzOrRoomId) {
        var _this = this;
        var param = {
            "method": 'getClazzesByUserId',
            "userId": id
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = [];
                        result.response.forEach(function (v, i) {
                            arr.push({
                                value: v.id, label: v.name
                            })
                        })
                        var classAsyncValue = [parseInt(clazzOrRoomId)];
                        _this.setState({classData: arr,classAsyncValue})
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    /**
     * 获取此用户所管理的教室
     * @param ident
     * @param semesterList
     */
    getClazzRoomsByUserId(ident,clazzOrRoomId) {
        var _this = this;
        var param = {
            "method": 'viewClassRoomPage',
            "uid": ident,
            "pn":-1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = [];
                        result.response.forEach(function (v, i) {
                            arr.push({
                                value: v.id, label: v.name
                            })
                        })
                        var classAsyncValue = [parseInt(clazzOrRoomId)];
                        _this.setState({classData: arr,classAsyncValue})
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    classOnOk(v) {
        this.setState({classAsyncValue: v});
    }

    /**
     * 获取单个课表项
     */
    viewCourseTableItem = (itemId) => {
        var _this = this;
        var param = {
            "method": 'viewCourseTableItem',
            "id": itemId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var courseTableItem = result.response;
                        console.log("courseTableItem:"+courseTableItem);
                        _this.setState({courseTableItem});
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    buildClassTableItem = (courseTableItem,teacherArr) => {
        var _this = this;
        var ClassTableArr = [];
        var ClassTableDataArr = [];
        var tableItemJson = {
            index:courseTableItem.index,
            startTimeData: courseTableItem.openTime,
            endTimeData: courseTableItem.closeTime,
            classRoomId: courseTableItem.classRoom.id,
            classAd: courseTableItem.classRoom.name,
            teacherId: courseTableItem.teacher.colUid,
            teacherName:  courseTableItem.teacher.userName,
            clazzName: courseTableItem.courseName,
            nodeDetal: WebServiceUtil.isEmpty(courseTableItem.comment)==true?"":courseTableItem.comment
        };
        var terAsyncValue = [courseTableItem.teacher.colUid];
        var posAsyncValue = [courseTableItem.classRoom.id];
        ClassTableDataArr.push(tableItemJson);
        ClassTableDataArr.forEach(function (v, i) {
            ClassTableArr.push(<div>
                <div className="cont_communal add_title font_gray">第{ClassTableDataArr[i].index}节</div>
                <div className="flex_container my_flex teacher_list">
                    <DatePicker
                        mode="time"
                        use24Hours
                        title='开始时间'
                        onOk={(time) => _this.startTimeOnOk(time, i)}
                    >
                        <span className="add_element">{ClassTableDataArr[i].startTimeData}<i
                            className="icon_triangle"></i></span>
                    </DatePicker>
                    <DatePicker
                        mode="time"
                        use24Hours
                        title='结束时间'
                        onOk={(time) => _this.endTimeOnOk(time, i)}
                    >
                        <span className="add_element">{ClassTableDataArr[i].endTimeData}<i
                            className="icon_triangle"></i></span>
                    </DatePicker>
                    <Picker
                        data={teacherArr || _this.state.terData}
                        cols={1}
                        value={_this.state.terAsyncValue}
                        onPickerChange={_this.onTerPickerChange}
                        onOk={v => _this.terPickerOnOk(v, i)}
                    >
                        <span className="add_element">
                            <span className="text_hidden overflow_width">{ClassTableDataArr[i].teacherName}</span>
                            <i className="icon_triangle"></i>
                        </span>
                    </Picker>
                    {/*上课地点*/}
                </div>
                {_this.state.curriculumType == 1?<div className="flex_container my_flex flex_addElement">
                    <Picker
                        data={_this.state.posData}
                        cols={1}
                        value={_this.state.posAsyncValue}
                        onPickerChange={_this.onPosPickerChange}
                        onOk={v => _this.posPickerOnOk(v, i)}
                    >
                        <span className="add_element">
                            <span className="text_hidden overflow_width">{ClassTableDataArr[i].classAd}</span>
                            <i className="icon_triangle"></i>
                        </span>
                    </Picker>

                </div>:null}
                <div className="flex_container my_flex flex_addElement">
                    <InputItem
                        className="add_element"
                        placeholder="请输入课程名称"
                        value={v.clazzName}
                        onChange={_this.inputOnChange.bind(this, i)}
                    ></InputItem>
                </div>
                <div className="flex_container my_flex flex_addElement">
                    <TextareaItem
                        rows={2}
                        className="add_element"
                        placeholder="添加备注"
                        labelNumber={2}
                        value={v.nodeDetal}
                        onChange={_this.textareaOnChange.bind(this, i)}
                    />
                </div>
            </div>)
            _this.setState({ClassTableArr})
        })
        this.setState({ClassTableDataArr,posAsyncValue,terAsyncValue});
    };

    render() {
        var clazzOrRoom = <List.Item
            arrow="horizontal"
        >选择班级</List.Item>;
        if(this.state.curriculumType==2){
            clazzOrRoom = <List.Item
                arrow="horizontal"
            >选择教室</List.Item>;
        }

        return (
            <div id="updateCurriculumSchedule" style={{height: document.body.clientHeight}}>
                <div className="addCurriculum_cont">
                    <WhiteSpace size="lg"/>
                    {/*选择班级*/}
                    <Picker
                        data={this.state.classData}
                        cols={1}
                        value={this.state.classAsyncValue}
                        onPickerChange={this.onClassPickerChange}
                        onOk={v => this.classOnOk(v)}
                    >
                        {clazzOrRoom}
                    </Picker>
                    <WhiteSpace size="lg"/>
                    {/*选择学期*/}
                    <Picker
                        data={this.state.termData}
                        cols={1}
                        value={this.state.termAsyncValue}
                        onPickerChange={this.onTermPickerChange}
                        onOk={v => this.termOnOk(v)}
                    >
                        <List.Item arrow="horizontal">选择学期</List.Item>
                    </Picker>
                    <WhiteSpace size="lg"/>
                    {/*选择星期*/}
                    <Picker
                        data={this.state.data}
                        cols={1}
                        value={this.state.asyncValue}
                        onPickerChange={this.onPickerChange}
                        onOk={v => console.log(v)}
                    >
                        <List.Item arrow="horizontal">选择星期</List.Item>
                    </Picker>
                    <WhiteSpace size="lg"/>
                    <div className='CourseTableArea'>
                        {
                            this.state.ClassTableArr.map((v) => {
                                return <div>{v}</div>
                            })
                        }
                        <img onClick={this.addClassTable} className='addClassTable'
                             src={require('../imgs/addClassTable.png')} alt=""/>
                    </div>

                </div>
                <div className='addCourseButton'>
                    <WhiteSpace size="lg"/>
                    <WingBlank>
                        <Button type="warning" onClick={this.updateCourseTableItem}>提交</Button>
                    </WingBlank>
                </div>
            </div>
        );
    }
}
