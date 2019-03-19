import React from 'react';
import {
    Toast,
    WhiteSpace,
    Button,
    WingBlank,
    InputItem,
    DatePicker,
} from 'antd-mobile';

var UpdateAT;

export default class newAttendanceTime extends React.Component {
    constructor(props) {
        super(props);
        UpdateAT = this;
        this.state = {
            teachBuildValue: "",
            cols: 1,
            initData:[],
            attendanceTimeArr: [],  //时间结构
            attendanceTimeDataArr: [],  //时间数据
            search_bg: false,
            clientHeight: document.body.clientHeight,
            comeExtra:"请选择",
            leaveExtra:"请选择",
        };
    }

    componentWillMount() {
        document.title = '编辑考勤时段';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var uid = locationSearch.split("&")[0].split("=")[1];
        var classId = locationSearch.split("&")[1].split("=")[1];
        this.setState({ uid, "classId":classId });
        this.viewSchoolAttendance(classId);
        window.addEventListener('resize', this.onWindwoResize);
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
            UpdateAT.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }

    /**
     * 数据回显
     * aId  班级ID
     */
    viewSchoolAttendance = (classId) => {
        var param = {
            "method":"viewSchoolAttendance",
            "aId":classId
        }
        console.log(param)
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                console.log("resutl",result)
                if (result.msg == '调用成功' || result.success == true) {
                    UpdateAT.setState({
                        initData:result.response,
                        teachBuildValue:result.response.name,
                        comeExtra:result.response.itemList[0].checkIn,
                        leaveExtra:result.response.itemList[0].checkOut,
                        initStatus:result.response.status

                    })
                } else {
                    Toast.fail(result.msg, 5);
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    /**
     * 更新提交
     */
    updateSchoolAttendance = () => {
        var _this = this;
        if (UpdateAT.state.teachBuildValue == "") {
            Toast.info("考勤时段名不能为空")
        }
       
        var param;
        if(UpdateAT.state.comeTimeValue == undefined ){
            if(UpdateAT.state.leaveTimeValue == undefined){
                param = {
                    "method": 'updateSchoolAttendance',
                    "schoolAttendance": {
                        "id": UpdateAT.state.classId,
                        "creatorId": UpdateAT.state.uid,
                        "name": UpdateAT.state.teachBuildValue,
                        "status": UpdateAT.state.initStatus,
                        "itemList": [
                            {
                                "index": 0,
                                "checkIn": UpdateAT.state.comeExtra,
                                "checkOut":UpdateAT.state.leaveExtra,
                            }
                        ]
                    }
        
                }
            }else {
                param = {
                    "method": 'updateSchoolAttendance',
                    "schoolAttendance": {
                        "id": UpdateAT.state.classId,
                        "creatorId": UpdateAT.state.uid,
                        "name": UpdateAT.state.teachBuildValue,
                        "status": UpdateAT.state.initStatus,
                        "itemList": [
                            {
                                "index": 0,
                                "checkIn": UpdateAT.state.comeExtra,
                                "checkOut":WebServiceUtil.formatHM(UpdateAT.state.leaveTimeValue.getTime()),
                            }
                        ]
                    }
        
                }
            }
        }else if(UpdateAT.state.leaveTimeValue == undefined){
            if(UpdateAT.state.comeTimeValue == undefined){
                param = {
                    "method": 'updateSchoolAttendance',
                    "schoolAttendance": {
                        "id": UpdateAT.state.classId,
                        "creatorId": UpdateAT.state.uid,
                        "name": UpdateAT.state.teachBuildValue,
                        "status": UpdateAT.state.initStatus,
                        "itemList": [
                            {
                                "index": 0,
                                "checkIn": UpdateAT.state.comeExtra,
                                "checkOut":UpdateAT.state.leaveExtra,
                            }
                        ]
                    }
        
                }
            }else {
                param = {
                    "method": 'updateSchoolAttendance',
                    "schoolAttendance": {
                        "id": UpdateAT.state.classId,
                        "creatorId": UpdateAT.state.uid,
                        "name": UpdateAT.state.teachBuildValue,
                        "status": UpdateAT.state.initStatus,
                        "itemList": [
                            {
                                "index": 0,
                                "checkIn": WebServiceUtil.formatHM(UpdateAT.state.comeTimeValue.getTime()),
                                "checkOut":UpdateAT.state.leaveExtra,
                            }
                        ]
                    }
        
                }
            }
        }else  {
            let comeTime = UpdateAT.state.comeTimeValue.getTime()
            let leaveTime = UpdateAT.state.leaveTimeValue.getTime()
            param = {
                "method": 'updateSchoolAttendance',
                "schoolAttendance": {
                    "id": UpdateAT.state.classId,
                    "creatorId": UpdateAT.state.uid,
                    "name": UpdateAT.state.teachBuildValue,
                    "status": UpdateAT.state.initStatus,
                    "itemList": [
                        {
                            "index": 0,
                            "checkIn": WebServiceUtil.formatHM(comeTime),
                            "checkOut": WebServiceUtil.formatHM(leaveTime),
                        }
                    ]
                }
    
            }
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    console.log(result)
                    Toast.success('成功');
                    //关闭当前窗口，并刷新上一个页面
                    var data = {
                        method: 'finishForRefresh',
                    };

                    Bridge.callHandler(data, null, function (error) {
                        console.log(error);
                    });
                } else {
                    Toast.fail(result.msg, 5);
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    render() {
        const ComeChildren = ({ extra, onClick, children }) => (
            <div className="am-list-item am-list-item-middle">
                <div className="am-list-line">
                    <div className="am-list-content">{children}<i className="redStar">*</i></div>
                    <div className="am-list-extra" onClick={onClick}>{extra}</div>
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>
        );
        const LeaveChildren = ({ extra, onClick, children }) => (
            <div className="am-list-item am-list-item-middle">
                <div className="am-list-line">
                    <div className="am-list-content">{children}<i className="redStar">*</i></div>
                    <div className="am-list-extra" onClick={onClick}>{extra}</div>
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>
        );
        return (
            <div id="newAttendanceTime" style={{ height: this.state.clientHeight }}>
                <div className="search_bg" style={{ display: this.state.search_bg ? 'block' : 'none' }}></div>
                <div className="addCurriculum_cont">
                    <WhiteSpace size="lg" />
                    <div className='teachBuild'>
                        <InputItem
                            placeholder="请选择教学楼"
                            data-seed="logId"
                            onChange={v => {
                                UpdateAT.setState({
                                    "teachBuildValue": v
                                })
                            }}
                            value={this.state.teachBuildValue}
                        >考勤时段名称<i className='redStar'>*</i></InputItem>
                    </div>
                    <WhiteSpace size="lg" />
                    <DatePicker
                        mode="time"
                        format="HH:mm"
                        title="入校时间"
                        value={this.state.comeTimeValue}
                        onChange={v => this.setState({ comeTimeValue: v })}
                        extra={UpdateAT.state.comeExtra}
                    >
                        <ComeChildren>入校时间</ComeChildren>
                    </DatePicker>
                    <WhiteSpace size="lg" />
                    <DatePicker
                        mode="time"
                        format="HH:mm"
                        title="离校时间"
                        value={this.state.leaveTimeValue}
                        onChange={v => this.setState({ leaveTimeValue: v })}
                        extra={UpdateAT.state.leaveExtra}
                    >
                        <LeaveChildren>离校时间</LeaveChildren>
                    </DatePicker>
                </div>
                <div className='addCourseButton'>
                    <WhiteSpace size="lg" />
                    <WingBlank>
                        <Button type="warning" onClick={this.updateSchoolAttendance}>提交</Button>
                    </WingBlank>
                </div>

            </div>
        );
    }
}
