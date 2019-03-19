import React from 'react';
import {Picker, List, WhiteSpace,Button,Toast, Checkbox} from 'antd-mobile';
import '../css/addStudentDuty.less'
const CheckboxItem = Checkbox.CheckboxItem;

const seasons = [
    [

    ]
];

var studentCheckedArray=[];

export default class editStudentDuty extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [{value: '1', label: '星期一'},
                {value: '2', label: '星期二'},
                {value: '3', label: '星期三'},
                {value: '4', label: '星期四'},
                {value: '5', label: '星期五'},
                {value: '6', label: '星期六'},
                {value: '7', label: '星期日'}],
            cols: 1,
            pickerValue: [],
            asyncValue: ['1'],
            sValue: [],
            visible: false,
            studentList:[],
            clazzId: '',
            week: '1',
        };
        this.studentCheckboxOnChange = this.studentCheckboxOnChange.bind(this);
        this.isHaveSameStudentId = this.isHaveSameStudentId.bind(this);
        this.getClazzesByUserId = this.getClazzesByUserId.bind(this);
    }

    componentDidMount(){
        Bridge.setShareAble("false");
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var locationSearchArray = locationSearch.split("&");
        var clazzId = locationSearchArray[0].split("=")[1];
        var week = locationSearchArray[1].split("=")[1];
        var studentIds = locationSearchArray[2].split("=")[1];
        var dutyId = locationSearchArray[3].split("=")[1];
        var clazzName = locationSearchArray[4].split("=")[1];
        var userId = locationSearchArray[5].split("=")[1];
        this.getStudentListByClazz(clazzId,studentIds);
        this.getClazzesByUserId(userId);
        var sValue = [clazzId];
        var asyncValue = [week];
        this.setState({clazzId,week,studentIds,dutyId,sValue,asyncValue});
        document.title = "修改"+clazzName+"值日生";
    }

    onPickerChange = (val) => {
        const d = [...this.state.data];
        const asyncValue = [...val];
        var week = val[0];

        this.setState({
            data: d,
            cols: 1,
            asyncValue,
            week
        });
    };

    onClassChange = (val) => {
        var clazzId = val[0];
        this.setState({sValue: val, clazzId});
    };


    studentCheckboxOnChange(val){
        this.buildStudentCheckedArray(val);
    }

    /**
     * 进入学生值日页面时，根据用户id获取当前用户的班级
     * @param userId
     */
    getClazzesByUserId(userId){
        var _this = this;
        var param = {
            "method": 'getClazzesByUserId',
            "userId": userId
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.success == true && result.msg == "调用成功") {
                    var response = result.response;
                    if (response != null && response != undefined) {
                        response.forEach(function (clazz) {
                            var clazzId = clazz.id;
                            //班级
                            var clazzName = clazz.name;
                            //年级
                            var grade = clazz.grade;
                            var gradeName = grade.name;
                            var clazzJson = {
                                label: gradeName+clazzName,
                                value: clazzId+"",
                            };
                            if(seasons[0]!=null && seasons[0]!=undefined){
                                seasons[0].push(clazzJson);
                            }
                        })

                    }
                }else{
                    Toast.fail(result.msg, 2);
                }
                _this.setState({seasons});
            },
            onError: function (error) {
            }
        });
    }

    /**
     * 构建已选学生id的数组
     * @param checkedValue
     */
    buildStudentCheckedArray(checkedValue){
        var studentIdIndex = this.isHaveSameStudentId(checkedValue);
        if(studentIdIndex!=-1){
            studentCheckedArray.splice(studentIdIndex,1);
        }else{
            studentCheckedArray.push(checkedValue);
        }
    }

    /**
     * 因为mobile的checkbox组件没有选中状态的判断，只能获取到当前点击的item项目
     * 所以此处需要提供该函数判断当前选中的值在数组中是否存在，用来在buildStudentCheckedArray中进行判断，
     * 如果存在，则移除，否则则向数组中添加
     * @param checkedValue
     * @returns {number}
     */
    isHaveSameStudentId(checkedValue){
        var studentIdIndex = -1;
        for(var i=0;i<studentCheckedArray.length;i++){
            var stuId = studentCheckedArray[i];
            if(stuId == checkedValue){
                studentIdIndex = i;
                break;
            }
        }
        return studentIdIndex;
    }

    /**
     * 构建考勤数据json，保存学生的考勤数据
     */
    updateClassBrandStudentDuty=()=>{
        var stuStr = studentCheckedArray.join(",");
        var param = {
            "method": 'updateClassBrandStudentDuty',
            "dutyId": this.state.dutyId,
            "clazzId": this.state.clazzId,
            "week": this.state.week,
            "dutyStudent": stuStr
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.success == true && result.msg == "调用成功") {
                    var response = result.response;
                    if (response != null && response != undefined) {
                        Toast.success('修改成功！', 1);
                        studentCheckedArray.splice(0);
                        //关闭当前窗口，并刷新上一个页面
                        var data = {
                            method: 'finishForRefresh',
                        };

                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    }
                }else{
                    Toast.fail(result.msg, 2);
                }
            },
            onError: function (error) {
            }
        });
    }

    /**
     * 获取班级的学生列表
     * @param clazzId
     */
    getStudentListByClazz=(clazzId,studentIds)=>{
        var _this = this;
        var studentCheckboxItemList = [];
        studentCheckedArray = studentIds.split(",");

        var param = {
            "method": 'getClassStudents',
            "clazzId": clazzId
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.success == true && result.msg == "调用成功") {
                    var response = result.response;
                    if (response != null && response != undefined) {
                        response.forEach(function (student) {
                            var studentId = student.colUid+'';
                            var isDefaultChecked = false;
                            if(studentCheckedArray.indexOf(studentId)!=-1){
                                isDefaultChecked = true;
                            }
                            var checkBoxItem = <CheckboxItem key={studentId} defaultChecked={isDefaultChecked} onChange={() => _this.studentCheckboxOnChange(studentId)}>
                                {student.userName}
                            </CheckboxItem>;
                            studentCheckboxItemList.push(checkBoxItem);
                        })
                    }
                }else{
                    Toast.fail(result.msg, 2);
                }
                _this.setState({seasons});
            },
            onError: function (error) {
            }
        });
        this.setState({studentCheckboxItemList});
    }

    weekNumToChart=(weekNum)=>{
        var weekChart = "";
        switch (weekNum){
            case "0":
                weekChart = "日";
                break;
            case "1":
                weekChart = "一";
                break;
            case "2":
                weekChart = "二";
                break;
            case "3":
                weekChart = "三";
                break;
            case "4":
                weekChart = "四";
                break;
            case "5":
                weekChart = "五";
                break;
            case "6":
                weekChart = "六";
                break;
            case "7":
                weekChart = "日";
                break;
        }
        return weekChart;
    }

    render() {
        var _this = this;
        var weekChart = _this.weekNumToChart(_this.state.week);
        return (
            <div id="addStudentDuty" style={{height: document.body.clientHeight}}>
                <WhiteSpace size="lg"/>
                <div className="dutyTime">值日时间：星期{weekChart}</div>
                <WhiteSpace size="lg"/>
                <div className="bg_white">
                    <List renderHeader={() => '学生列表'}>
                        {_this.state.studentCheckboxItemList}
                    </List>
                </div>
                <div className="submitBtn">
                    <Button type="primary" onClick={this.updateClassBrandStudentDuty}>提交</Button>
                </div>
            </div>
        );
    }
}
