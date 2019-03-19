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
import '../../css/newCurriculumSche/updateCurriculumSchedule.less'

var teacherV;

const RadioItem = Radio.RadioItem;
export default class updateCurriculumSchedule extends React.Component {
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
            indexData: [{value: '1', label: '第一节'},
                {value: '2', label: '第二节'},
                {value: '3', label: '第三节'},
                {value: '4', label: '第四节'},
                {value: '5', label: '第五节'},
                {value: '6', label: '第六节'},
                {value: '7', label: '第七节'},
                {value: '8', label: '第八节'},
                {value: '9', label: '第九节'},
                {value: '10', label: '第十节'},
                {value: '11', label: '第十一节'},
                {value: '12', label: '第十二节'}],
            terData: [],   //教师数组
            classData: [],   //班级数组
            asyncValue: [],   //星期数组
            indexAsyncValue: [],   //课时数组
            ClassTableArr: [],  //课表结构
            ClassTableDataArr: [],  //课表数据
            search_bg: false,   //遮罩显隐
            clientHeight: document.body.clientHeight,
        };
    }

    componentWillMount() {
        document.title = '更改课程表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        window.addEventListener('resize', this.onWindwoResize);
        var clazzroomId = locationSearch.split("&")[0].split('=')[1];
        var classTableId = locationSearch.split("&")[1].split('=')[1];
        var classTableDetilId = locationSearch.split("&")[2].split('=')[1];
        this.setState({clazzroomId, classTableId, classTableDetilId})
        this.viewCourseTableItem(classTableDetilId);
    }

    componentDidMount() {
        Bridge.setShareAble("false");
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

    onIndexPickerChange = (val) => {
        const d = [...this.state.indexData];
        const indexAsyncValue = [...val];
        this.setState({
            indexData: d,
            indexAsyncValue,
        });
    }

    viewCourseTableItem(id) {
        var param = {
            "method": 'viewCourseTableItem',
            "id": id,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    const d = [...this.state.data];
                    var array = []
                    array.push(result.response.week + '')
                    var arra = []
                    // arra.push(result.response.index + '')
                    var arr = [
                        {
                            startTimeData: result.response.openTime,
                            endTimeData: result.response.closeTime,
                            teacherId: result.response.teacher.colUid,
                            tercherName: result.response.teacher.userName,
                            classId: result.response.clazz.id,
                            className: result.response.clazz.name,
                            clazzName: result.response.courseName,
                            nodeDetal: result.response.comment,
                        }
                    ]
                    teacherV.setState({ClassTableDataArr: arr, data: d, asyncValue: array, indexAsyncValue: arra});
                    teacherV.buildClassTable();
                }
            },
            onError: function (error) {
                Toast.fail(error)
            }
        });
    }

    /**
     * 新增课表项
     */
    addCourseTableItem = () => {
        var _this = this;
        if (this.state.asyncValue.length == 0) {
            Toast.fail('请选择星期',2);
            return
        }
        // if (this.state.indexAsyncValue.length == 0) {
        //     Toast.fail('请选择课时');
        //     return
        // }
        if (this.state.ClassTableDataArr.length == 0) {
            Toast.fail('课表不能为空',2);
            return
        }
        for (var i = 0; i < this.state.ClassTableDataArr.length; i++) {
            var v = this.state.ClassTableDataArr[i];
            if (v.startTimeData == '开始时间' || v.endTimeData == '结束时间' || v.clazzName == '' || v.teacherId == '' || v.classId == '') {
                Toast.fail('课表存在空值',2);
                return false
            }
        }
        var param = {
            "method": 'updateCourseTableItem',
            "cti": {
                "id": this.state.classTableDetilId,
                "tableId": this.state.classTableId,
                "week": this.state.asyncValue[0],
                "roomId": this.state.clazzroomId,
                // "index": this.state.indexAsyncValue[0],
                "openTime": this.state.ClassTableDataArr[0].startTimeData,
                "closeTime": this.state.ClassTableDataArr[0].endTimeData,
                "classId": this.state.ClassTableDataArr[0].classId,
                "courseName": this.state.ClassTableDataArr[0].clazzName,
                "teacherId": this.state.ClassTableDataArr[0].teacherId,
            }
        };
        if (WebServiceUtil.isEmpty(this.state.ClassTableDataArr[0].nodeDetal) == false) {
            if (this.state.ClassTableDataArr[0].nodeDetal.trim().length != 0) {
                param.cti.comment = this.state.ClassTableDataArr[0].nodeDetal
            }
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
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
                        style={{'margin-left': '-8px'}}
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
            <div id="updateCurriculumSchedule" style={{height: this.state.clientHeight}}>
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
                    {/*<WhiteSpace size="lg"/>*/}
                    {/*/!*选择课时*!/*/}
                    {/*<Picker*/}
                    {/*data={this.state.indexData}*/}
                    {/*cols={1}*/}
                    {/*value={this.state.indexAsyncValue}*/}
                    {/*onPickerChange={this.onIndexPickerChange}*/}
                    {/*onOk={this.onIndexPickerChange}*/}
                    {/*>*/}
                    {/*<List.Item arrow="horizontal">选择课时</List.Item>*/}
                    {/*</Picker>*/}
                    {/*累加部分*/}
                    <div className='CourseTableArea'>
                        {
                            this.state.ClassTableArr.map((v) => {
                                return <div>{v}</div>
                            })
                        }
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
