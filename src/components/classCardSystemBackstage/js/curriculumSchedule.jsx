import React from 'react';
import {Picker, List, WhiteSpace, Toast} from 'antd-mobile';
import '../css/curriculumSchedule.less'

var cSchedule;
export default class curriculumSchedule extends React.Component {

    constructor(props) {
        super(props);
        cSchedule = this;
        this.state = {
            data: [{value: '1', label: '星期一'},
                {value: '2', label: '星期二'},
                {value: '3', label: '星期三'},
                {value: '4', label: '星期四'},
                {value: '5', label: '星期五'},
                {value: '6', label: '星期六'},
                {value: '7', label: '星期日'}],
            cols: 1,
            asyncValue: [],
            sValue: ['0', '0'],
            visible: false,
            classTableArray: [],
            clientHeight: document.body.clientHeight,
            seasons: [[
                {
                    label: '请选择',
                    value: '0',
                }
            ],
                [
                    {
                        label: '请选择',
                        value: '0',
                    }
                ],]
        };
        this.addSchedule = this.addSchedule.bind(this);
        this.turnToUpdatePage = this.turnToUpdatePage.bind(this);
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var ident = locationSearch.split("&")[0].split('=')[1];
        var curriculumType = locationSearch.split("&")[1].split('=')[1];
        var loginUser = {
            "colUid": ident,
        };
        localStorage.setItem("loginUserSchedule", JSON.stringify(loginUser));
        this.setState({curriculumType});
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        var curriculumType = this.state.curriculumType;
        document.title = '班级课程表';
        if (curriculumType == 2) {
            document.title = '公共课程表';
        }
        this.getSemesterList(JSON.parse(localStorage.getItem('loginUserSchedule')).colUid)
    }

    setWeek() {
        var that = this;
        var d = new Date();
        var week = d.getDay();
        var noomValue;
        this.state.data.forEach((v, i) => {
            if (week == v.value) {
                noomValue = [v.value]
                that.setState({
                    asyncValue: [v.value],
                })
                that.viewCourseTableItemPage(noomValue)
            }
        })
    }

    /**
     *  获得定义的学期列表
     * @param ident
     */
    getSemesterList(ident) {
        var _this = this;
        var param = {
            "method": 'getSemesterList',
            "uid": ident
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (_this.state.curriculumType == 1) {
                        _this.getClazzesByUserId(ident, result.response)
                    } else {
                        _this.getClazzRoomsByUserId(ident, result.response)
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    /**
     * 获取此用户所在班级
     * @param ident
     * @param semesterList
     */
    getClazzesByUserId(ident, semesterList) {
        var _this = this;
        var param = {
            "method": 'getClazzesByUserId',
            "userId": ident
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                
                if (result.msg == '调用成功' || result.success == true) {
                    _this.buildSeasons(result.response, semesterList)
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
    getClazzRoomsByUserId(ident, semesterList) {
        var _this = this;
        var param = {
            "method": 'viewClassRoomPage',
            "uid": ident,
            "pn": -1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    _this.buildSeasons(result.response, semesterList)
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    buildSeasons(cList, sList) {
        var cListArr = [];
        var sListArr = [];
        // var cListArr = [{
        //     label: '请选择',
        //     value: '0',
        // }]
        // var sListArr = [{
        //     label: '请选择',
        //     value: '0',
        // }];
        if (WebServiceUtil.isEmpty(cList) == false) {
            cList.forEach(function (v, i) {
                cListArr.push({
                    label: v.name,
                    value: v.id,
                })
            })
        }
        if (WebServiceUtil.isEmpty(sList) == false) {
            sList.forEach(function (item, index) {
                sListArr.push({
                    label: item.name,
                    value: item.id,
                })
            })
        }
        var array = [cListArr[0].value, sListArr[0].value];
        var arr = [cListArr, sListArr];
        this.setState({seasons: arr, sValue: array})
        cSchedule.setWeek();
    }

    /**
     * 星期切换的回调
     * @param val
     */
    onPickerChange = (val) => {
        const d = [...this.state.data];
        const asyncValue = [...val];
        console.log(d);
        console.log(asyncValue);
        this.setState({
            data: d,
            asyncValue,
        });
    };

    /**
     * 增加课程表的回调
     */
    addSchedule() {
        var url = WebServiceUtil.mobileServiceURL + "addCurriculumSchedule?curriculumType=" + this.state.curriculumType;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    /**
     * 查看课表项管理页
     * @param v
     */
    viewCourseTableItemPage(v) {
        // console.log("v",v);
        var _this = this;
        this.setState({asyncValue: v})
        if (this.state.sValue[0] == 0) {
            if (this.state.curriculumType == 1) {
                Toast.fail('请选择班级')
            } else {
                Toast.fail('请选择教室')
            }
            return
        }
        if (this.state.sValue[1] == 0) {
            Toast.fail('请选择学期')
            return
        }
        var cid = -1;
        var rid = -1;
        if (this.state.curriculumType == 1) {
            //班级课程表
            cid = this.state.sValue[0];
            rid = -1;
        } else {
            //公共教室课程表
            cid = -1;
            rid = this.state.sValue[0];
        }

        var param = {
            "method": 'viewCourseTableItemPage',
            "sid": this.state.sValue[1],
            "w": v[0],
            "cid": cid,
            "rid": rid,
            "uid": JSON.parse(localStorage.getItem('loginUserSchedule')).colUid
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                console.log(result);
                if (result.msg == '调用成功' || result.success == true) {
                    var arr;
                    if(result.response.length === 0){
                        arr = result.response;
                    }else {
                        arr = result.response[0].courseList
                    }
                    _this.setState({classTableArray: arr});
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    /**
     * 跳转到课程表更新页面
     */
    turnToUpdatePage(currentSchedule) {
        var currentScheduleId = currentSchedule.id;
        var clazzOrRoomId = this.state.sValue[0];
        var termId = this.state.sValue[1];
        var week = this.state.asyncValue[0];
        var url = WebServiceUtil.mobileServiceURL + "updateCurriculumSchedule?currentScheduleId=" + currentScheduleId + "&clazzOrRoomId=" + clazzOrRoomId + "&termId=" + termId + "&week=" + week + "&curriculumType=" + this.state.curriculumType;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    /**
     * 根据ID删除课表
     */
    delSchedule(sId) {
        var _this = this;
        var param = {
            "method": 'deleteCourseTableItem',
            "id": sId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('删除成功', 1);
                    var arr = cSchedule.state.classTableArray
                    arr.forEach((v, i) => {
                        if (v.id == sId) {
                            arr.splice(i, 1);
                        }
                    })
                    cSchedule.setState({classTableArray: arr})
                } else {
                    Toast.fail(result.msg)
                }
            },
            onError: function (error) {
                Toast.info('删除失败');
            }
        });
    }

    render() {
        var pickerTip = "班级";
        if (this.state.curriculumType == 2) {
            pickerTip = "教室";
        }
        return (
            <div id="curriculumSchedule" style={{height: document.body.clientHeight}}>
                <WhiteSpace size="lg"/>
                {/*班级,学期*/}
                <Picker
                    data={this.state.seasons}
                    cascade={false}
                    value={this.state.sValue}
                    onChange={v => this.setState({sValue: v})}
                    onOk={v => this.setState({sValue: v})}
                >
                    <List.Item
                        arrow="horizontal"
                        // onClick={this.getSemesterList.bind(this, JSON.parse(localStorage.getItem('loginUserSchedule')).colUid)}
                    >{pickerTip},学期</List.Item>
                </Picker>
                <WhiteSpace size="lg"/>
                {/*日期*/}
                <Picker
                    data={this.state.data}
                    cols={1}
                    value={this.state.asyncValue}
                    onPickerChange={this.onPickerChange}
                    onOk={v => this.viewCourseTableItemPage(v)}
                >
                    <List.Item arrow="horizontal">日期</List.Item>
                </Picker>
                <WhiteSpace size="lg"/>
                <div className="curriculum_cont cont_communal">
                    {this.state.classTableArray.map((v, i) => {
                        return <li>
                            <div className="add_title">
                                <span className="font_gray">第{i + 1}节</span>
                                <span className="amend_btn modifyBtn_common" onClick={this.turnToUpdatePage.bind(this, v)}></span>
                                <span className="delete deleteBtn_common" onClick={this.delSchedule.bind(this, v.id)}></span>
                            </div>

                            <div className="list_high list textOver">
                                <span className="text_hidden text_cont1">{v.openTime + '-' + v.closeTime}</span>
                                <span className="text_hidden text_cont2">{v.courseName}</span>
                            </div>
                            <div className="list_high list lineList textOver">
                                <span className="text_hidden text_cont3">{v.classRoom.name}</span>
                            </div>
                        </li>
                    })}
                </div>
                <div className='addBunton' onClick={this.addSchedule}>
                    <img src={require("../../ringBindInformation/imgs/addBtn.png")}/>
                </div>
            </div>
        );
    }
}
