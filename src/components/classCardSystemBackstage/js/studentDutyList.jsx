import React from 'react';
import {Picker, List, WhiteSpace, Grid, Button, Icon, Modal} from 'antd-mobile';
import '../css/studentDutyList.less'

const alert = Modal.alert;

/**
 * 值日生查询页
 */
export default class studentDutyList extends React.Component {

    constructor(props) {
        super(props);
        var weekOfTody = new Date().getDay();
        weekOfTody = (weekOfTody == 0 ? 7 : weekOfTody);
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
            asyncValue: [weekOfTody + ''],
            sValue: [],
            visible: false,
            studentList: [],
            clazzId: '',
            week: weekOfTody + '',
            editButtonDisabled: true
        };
        this.getClassBrandStudentDutyList = this.getClassBrandStudentDutyList.bind(this);
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var locationSearchArray = locationSearch.split("&");
        var clazzId = locationSearchArray[0].split("=")[1];
        var clazzName = locationSearchArray[1].split("=")[1];
        var userId = locationSearchArray[2].split("=")[1];
        this.getClassBrandStudentDutyList(userId, clazzId, '', -1);
        this.setState({clazzId, userId, clazzName});
        document.title = clazzName + '班级值日表';
    }
    componentDidMount(){
        Bridge.setShareAble("false");
    }

    /**
     * 查看指定班级的值日列表
     */
    getClassBrandStudentDutyList(userId, clazzId, week, pageNo) {
        var _this = this;
        var param = {
            "method": 'getClassBrandStudentDutyList',
            "userId": userId,
            "clazzId": clazzId,
            "week": week,
            "pageNo": pageNo,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                var dutyTagList = [];
                if (result.msg == '调用成功' && result.success == true) {
                    var studentDutyList = result.response;
                    studentDutyList.forEach(function (studentDuty) {
                        var dutyId = studentDuty.id;
                        var week = studentDuty.week;
                        var users = studentDuty.users;
                        var studentIdStr = "";
                        var studentList = [];
                        if (WebServiceUtil.isEmpty(users) == false) {
                            users.forEach(function (user, index) {
                                var userId = user.colUid;
                                studentIdStr += userId;
                                if (index != users.length - 1) {
                                    studentIdStr += ",";
                                }
                                var userName = user.userName;
                                var avatar = user.avatar;
                                var stuJson = {text: userName, icon: avatar};
                                studentList.push(stuJson)
                            })
                        }
                        var weekChart = _this.weekNumToChart(week);
                        if (WebServiceUtil.isEmpty(week) == false) {
                            var dutyTag = <div>
                                <div className="planTitle line_public">
                                    <div className="top">
                                        <span>星期{weekChart}</span>
                                        <Button className="modifyBtn_common" type="primary" size="small"
                                                onClick={_this.editStudentDuty.bind(_this, week, studentIdStr, dutyId)}></Button>
                                        {/*<Button type="primary" size="small" onClick={_this.editStudentDuty}>修改</Button>*/}
                                        {/*<Button type="primary" size="small" className="btn_del deleteBtn_common" onClick={_this.delStudentDuty.bind(_this,dutyId)}></Button>*/}
                                        <Button type="primary" size="small" className="btn_del deleteBtn_common"
                                                onClick={_this.delConfirm.bind(_this, dutyId)}></Button>
                                    </div>
                                    <Grid data={studentList} columnNum={4} activeStyle={false}/>
                                </div>
                            </div>;
                            dutyTagList.push(dutyTag);
                        }
                    })
                }
                _this.setState({dutyTagList});
            },
            onError: function (error) {
            }
        });
    }

    /**
     * 删除确认操作
     * @param dutyId 待删除的值日id
     */
    delConfirm = (dutyId) => {
        var _this = this;
            alert('确定要删除值日表吗?', '', [
                {text: '取消', onPress: () => console.log('cancel')},
                {text: '确定', onPress: () => _this.delStudentDuty(dutyId)},
            ])
    }

    weekNumToChart = (weekNum) => {
        var weekChart = "";
        switch (weekNum) {
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

    /**
     * 修改班级的值日信息
     * 需要将当前页面的查询数据传递到下个页面，然后构建修改页面的数据
     */
    editStudentDuty = (week, studentIdStr, dutyId) => {
        // var studentIdStr = this.state.studentIdList.join(",");
        var editStudentDutyUrl = WebServiceUtil.mobileServiceURL + "editStudentDuty";
        editStudentDutyUrl += "?clazzId=" + this.state.clazzId + "&week=" + week + "&studentIds=" + studentIdStr + "&dutyId=" + dutyId + "&clazzName=" + this.state.clazzName + "&access_user=" + this.state.userId;
        editStudentDutyUrl = encodeURI(editStudentDutyUrl);
        // location.href = editStudentDutyUrl;

        var data = {
            method: 'openNewPage',
            url: editStudentDutyUrl
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = editStudentDutyUrl;
        });
    };

    delStudentDuty = (delId) => {
        var _this = this;
        var param = {
            "method": 'deleteStudentDuty',
            "id": delId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    _this.getClassBrandStudentDutyList(_this.state.userId, _this.state.clazzId, '', -1);
                }
            },
            onError: function (error) {
            }
        });
    }
    /**
     * 跳转到添加值日生的页面
     */
    turnToAddDutyPage = () => {
        var addStudentDutyUrl = WebServiceUtil.mobileServiceURL + "addStudentDuty?clazzId=" + this.state.clazzId + "&clazzName=" + this.state.clazzName + "&access_user=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            url: addStudentDutyUrl
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = addStudentDutyUrl;
        });
    }

    render() {
        var _this = this;
        return (
            <div id="studentDutyList" style={{height: document.body.clientHeight}}>
                <div className="content">{_this.state.dutyTagList}</div>
                <div className='addBunton' onClick={this.turnToAddDutyPage}>
                    <img src={require("../imgs/addBtn.png")}/>
                </div>
            </div>
        );
    }
}
