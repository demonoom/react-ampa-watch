import React from 'react';
import {
    Toast,
    WhiteSpace,
    Button,
    WingBlank,
    InputItem,
    DatePicker,
} from 'antd-mobile';
import '../css/newAttendanceTime.less'

var addAT;

export default class newAttendanceTime extends React.Component {
    constructor(props) {
        super(props);
        addAT = this;
        this.state = {
            teachBuildValue: "",
            cols: 1,
            terAsyncValue: [],
            attendanceTimeArr: [],  //时间结构
            attendanceTimeDataArr: [],  //时间数据
            search_bg: false,
            clientHeight: document.body.clientHeight,
        };
    }

    componentWillMount() {
        document.title = '添加考勤时段';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var uid = locationSearch.split("&")[0].split("=")[1];
        this.setState({ uid });
        window.addEventListener('resize', this.onWindwoResize);
    }
    componentDidMount() {
        Bridge.setShareAble("false");
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    /**
     * 监听窗口改变时间
     */
    onWindwoResize() {
        setTimeout(() => {
            addAT.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }

    /**
     * 提交
     */
    subAttendanceTime = () => {
       
        if (addAT.state.teachBuildValue == "") {
            Toast.info("考勤时段名不能为空")
        }
        let comeTime = addAT.state.comeTimeValue.getTime()
        let leaveTime = addAT.state.leaveTimeValue.getTime()
        var param = {
            "method": 'addSchoolAttendance',
            "schoolAttendance": {
                "name": addAT.state.teachBuildValue,
                "creatorId": addAT.state.uid,
                "itemList": [
                    {
                        "index": 0,
                        "checkIn": WebServiceUtil.formatHM(comeTime),
                        "checkOut": WebServiceUtil.formatHM(leaveTime),
                    }
                ]
            }
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
                            placeholder="请输入考勤时段名称"
                            data-seed="logId"
                            onChange={v => {
                                addAT.setState({
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
                        extra="请选择"
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
                        extra="请选择"
                    >
                        <LeaveChildren>离校时间</LeaveChildren>
                    </DatePicker>

                </div>
                <div className='addCourseButton'>
                    <WhiteSpace size="lg" />
                    <WingBlank>
                        <Button type="warning" onClick={this.subAttendanceTime}>提交</Button>
                    </WingBlank>
                </div>
            </div>
        );
    }
}
