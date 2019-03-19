import React from 'react';
import {
    Toast,
    Picker,
    List,
    WhiteSpace,
    Button,
    WingBlank,
    InputItem,
    DatePicker,
    TextareaItem,
    Radio
} from 'antd-mobile';
import '../../css/newCurriculumSche/addCurriculumSchedule.less'

var teacherV;

const RadioItem = Radio.RadioItem;
export default class addCurriculumSchedule extends React.Component {
    constructor(props) {
        super(props);
        teacherV = this;
        this.state = {
            cols: 1,
            data: [{value: '1', label: '星期一'},
                {value: '2', label: '星期二'},
                {value: '3', label: '星期三'},
                {value: '4', label: '星期四'},
                {value: '5', label: '星期五'},
                {value: '6', label: '星期六'},
                {value: '7', label: '星期日'}],
            terData: [],   //教师数组
            classData: [],   //班级数组
            asyncValue: [],   //星期数组
            ClassTableArr: [],  //课表结构
            ClassTableDataArr: [],  //课表数据
            search_bg: false,   //遮罩显隐
            clientHeight: document.body.clientHeight,
        };
    }

    componentDidMount() {
        Bridge.setShareAble("false");
    }

    componentWillMount() {
        document.title = '添加课程表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        window.addEventListener('resize', this.onWindwoResize);
        var clazzroomId = locationSearch.split("&")[0].split('=')[1];
        var classTableId = locationSearch.split("&")[1].split('=')[1];
        this.setState({clazzroomId, classTableId})
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize() {
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
     * 新增课表项
     */
    addCourseTableItem = () => {
        var _this = this;
        if (this.state.asyncValue.length == 0) {
            Toast.fail('请选择星期', 2);
            return
        }
        if (this.state.ClassTableDataArr.length == 0) {
            Toast.fail('课表不能为空', 2);
            return
        }
        for (var i = 0; i < this.state.ClassTableDataArr.length; i++) {
            var v = this.state.ClassTableDataArr[i];
            if (v.startTimeData == '开始时间' || v.endTimeData == '结束时间' || v.clazzName == '') {
                Toast.fail('课表存在空值', 2);
                return false
            }
            if (v.teacherId == '' || v.classId == '') {
                Toast.fail('授课教室及上课班级需输入并搜索后进行绑定,请检查', 3);
                return false
            }
        }
        var param = {
            "method": 'addCourseTableItem',
            "cti": {
                "week": this.state.asyncValue[0],
                "tableId": this.state.classTableId,
                "roomId": this.state.clazzroomId
            }
        };
        var classArray = [];
        this.state.ClassTableDataArr.forEach(function (v, i) {
            classArray.push({
                "courseName": v.clazzName,
                // "index": i + 1,
                "teacherId": v.teacherId,
                "openTime": v.startTimeData,
                "closeTime": v.endTimeData,
                "comment": v.nodeDetal,
                "classId": v.classId,
            })
        })
        param.cti.scheduleList = classArray;

        console.log(param);

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                console.log(result);
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('成功');
                    //关闭当前窗口，并刷新上一个页面
                    setTimeout(function () {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    }, 1000)
                } else {
                    Toast.fail(result.msg, 3);
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

    /**
     * 搜索老师输入框动态绑定
     * @param i
     * @param e
     */
    teacgerChange(i, e) {
        var tValue = e.target.value;
        teacherV.state.ClassTableDataArr[i].tercherName = tValue
        teacherV.state.ClassTableDataArr[i].teacherId = ''
        teacherV.buildClassTable()
    }

    /**
     * 搜索班级输入框动态绑定
     * @param i
     * @param e
     */
    classChange(i, e) {
        var tValue = e.target.value;
        teacherV.state.ClassTableDataArr[i].className = tValue
        teacherV.state.ClassTableDataArr[i].classId = ''
        teacherV.buildClassTable()
    }

    /**
     * 搜索老师
     */
    getTeacherData(i) {
        teacherV.state.terData = []
        if (teacherV.state.ClassTableDataArr[i].tercherName == '') {
            Toast.fail('请输入老师姓名搜索')
            return
        }
        let param = {
            "method": 'searchTeacher',
            "aid": JSON.parse(localStorage.getItem('classTableIdent')).colUid,
            "keyWord": teacherV.state.ClassTableDataArr[i].tercherName
        }
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
                        teacherV.setState({
                            terData: arr,
                            modelNum: i,
                            search_bg: true,
                            teacherName: arr[0].label,
                            value: arr[0].value,
                        });
                        document.getElementById('searchTerRes').className = 'searchTerRes ding_enter'
                    } else {
                        Toast.fail('未搜到相关老师')
                        teacherV.state.ClassTableDataArr[i].tercherName = '';
                        teacherV.state.ClassTableDataArr[i].teacherId = '';
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 搜索班级
     * classData
     */
    getClassData(i) {
        teacherV.state.classData = []
        if (teacherV.state.ClassTableDataArr[i].className == '') {
            Toast.fail('请输入班级搜索')
            return
        }
        let param = {
            "method": 'searchClazz',
            "aid": JSON.parse(localStorage.getItem('classTableIdent')).colUid,
            "keyWord": teacherV.state.ClassTableDataArr[i].className
        }
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
                        teacherV.setState({
                            classData: arr,
                            modelNum: i,
                            search_bg: true,
                            className: arr[0].label,
                            classValue: arr[0].value
                        });
                        document.getElementById('searchClassRes').className = 'searchClassRes ding_enter'
                    } else {
                        Toast.fail('未搜到相关班级')
                        teacherV.state.ClassTableDataArr[i].className = '';
                        teacherV.state.ClassTableDataArr[i].classId = '';
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 根据数据构建,完成数据的动态绑定
     */
    buildClassTable = () => {

        var _this = this;
        var ClassTableArr = [];
        this.state.ClassTableDataArr.forEach(function (v, i) {
            ClassTableArr.push(<div>
                {/*<div className="cont_communal add_title font_gray">第{i + 1}节</div>*/}
                <WhiteSpace size="lg"/>
                {/*日期*/}
                <div className="flex_container my_flex teacher_list teacher_list_p">
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
                </div>
                {/*搜索老师*/}
                <div className="search_list my_flex">
                    <input type="text"
                           style={{'margin-left': '-8px'}}
                           onChange={teacherV.teacgerChange.bind(this, i)}
                           placeholder="请输入老师姓名并搜索"
                           value={teacherV.state.ClassTableDataArr[i].tercherName}
                    />
                    <img onClick={teacherV.getTeacherData.bind(this, i)} src={require("../../imgs/icon_search.png")}/>
                </div>
                {/*搜索班级*/}
                <div className="search_list my_flex">
                    <input type="text"
                           style={{'margin-left': '-8px'}}
                           onChange={teacherV.classChange.bind(this, i)}
                           placeholder="请输入上课班级并搜索"
                           value={teacherV.state.ClassTableDataArr[i].className}
                    />
                    <img onClick={teacherV.getClassData.bind(this, i)} src={require("../../imgs/icon_search.png")}/>
                </div>
                {/*输入课名*/}
                <div className="flex_container my_flex flex_addElement">
                    <InputItem
                        className="add_element"
                        placeholder="请输入课程名称"
                        value={v.clazzName}
                        onChange={_this.inputOnChange.bind(this, i)}
                    ></InputItem>
                </div>
                {/*输入备注*/}
                <div className="flex_container my_flex flex_addElement">
                    <TextareaItem
                        rows={1}
                        className="add_element"
                        style={{'margin-left': '-8px'}}
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
            teacherId: '',
            tercherName: '',
            classId: '',
            className: '',
            clazzName: '',
            nodeDetal: ''
        });
        this.buildClassTable();
    };

    /**
     * 老师弹出层切换的回调
     * @param i
     */
    radioItemOnChange(i) {
        this.setState({
            value: i.value,
            teacherName: i.label
        });
    }

    /**
     * 班级弹出层切换的回调
     * @param i
     */
    classRadioItemOnChange(i) {
        this.setState({
            classValue: i.value,
            className: i.label
        });
    }

    /**
     * 点击确定
     * 收面板
     * 设置名字,id
     */
    searchTerResLeave() {
        document.getElementById('searchTerRes').className = 'searchTerRes ding_leave'
        var index = teacherV.state.modelNum
        teacherV.state.ClassTableDataArr[index].tercherName = teacherV.state.teacherName;
        teacherV.state.ClassTableDataArr[index].teacherId = teacherV.state.value;
        teacherV.setState({search_bg: false})
        teacherV.buildClassTable()
    }

    /**
     * 点击确定
     * 收面板
     * 设置名字,id
     */
    searchClassResLeave() {
        document.getElementById('searchClassRes').className = 'searchClassRes ding_leave'
        var index = teacherV.state.modelNum
        teacherV.state.ClassTableDataArr[index].className = teacherV.state.className;
        teacherV.state.ClassTableDataArr[index].classId = teacherV.state.classValue;
        teacherV.setState({search_bg: false})
        teacherV.buildClassTable()
    }

    render() {
        return (
            <div id="addCurriculumSchedule" style={{height: this.state.clientHeight}}>
                <div className="search_bg" style={{display: this.state.search_bg ? 'block' : 'none'}}></div>
                {/*灰色遮罩*/}
                <div className="addCurriculum_cont">
                    {/*选择星期*/}
                    <Picker
                        data={this.state.data}
                        cols={1}
                        value={this.state.asyncValue}
                        onPickerChange={this.onPickerChange}
                        onOk={this.onPickerChange}
                    >
                        <List.Item arrow="horizontal">选择星期</List.Item>
                    </Picker>
                    <WhiteSpace size="lg"/>
                    {/*累加部分*/}
                    <div className='CourseTableArea'>
                        {
                            this.state.ClassTableArr.map((v) => {
                                return <div>{v}</div>
                            })
                        }
                        <img onClick={this.addClassTable} className='addClassTable'
                             src={require('../../imgs/addClassTable.png')} alt=""/>
                    </div>

                </div>
                {/*提交按钮*/}
                <div className='addCourseButton'>
                    <WhiteSpace size="lg"/>
                    <WingBlank>
                        <Button type="warning" onClick={this.addCourseTableItem}>提交</Button>
                    </WingBlank>
                </div>
                {/*教师搜索结果弹出层*/}
                <div className='searchTerRes' id='searchTerRes'>
                    <div className="search_btn"><span onClick={this.searchTerResLeave}>确定</span></div>
                    <div className="search_wraplist">
                        <List>
                            {this.state.terData.map(i => (
                                <RadioItem key={i.value} checked={this.state.value === i.value}
                                           onChange={() => this.radioItemOnChange(i)}>
                                    {i.label}
                                </RadioItem>
                            ))}
                        </List>
                    </div>
                </div>
                {/*班级搜索结果弹出层*/}
                <div className='searchClassRes' id='searchClassRes'>
                    <div className="search_btn"><span onClick={this.searchClassResLeave}>确定</span></div>
                    <div className="search_wraplist">
                        <List>
                            {this.state.classData.map(i => (
                                <RadioItem key={i.value} checked={this.state.classValue === i.value}
                                           onChange={() => this.classRadioItemOnChange(i)}>
                                    {i.label}
                                </RadioItem>
                            ))}
                        </List>
                    </div>
                </div>
            </div>
        );
    }
}
