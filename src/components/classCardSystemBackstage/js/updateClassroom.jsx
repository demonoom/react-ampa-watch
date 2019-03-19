import React from 'react';
import {
    Toast,
    WhiteSpace,
    InputItem,
    List,
    Radio,
    Modal,
    Flex,
    Picker
} from 'antd-mobile';

import { ucs2 } from 'punycode';

const Item = List.Item;
const Brief = Item.Brief;
const alert = Modal.alert;
const RadioItem = Radio.RadioItem;
var updateCM;

export default class updateClassroom extends React.Component {
    constructor(props) {
        super(props);
        updateCM = this;
        this.state = {
            clientHeight: document.body.clientHeight,
            searchData: [],
            teachBuildData: [],
            buildingId: [],
            gradeValue: [],
            showPicker: true
        };
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var classIdBynoom = locationSearch.split("&")[0].split("=")[1];
        var uid = locationSearch.split("&")[1].split("=")[1];
        this.setState({
            "uid": uid,
            classIdBynoom
        })
        this.viewSchoolBuildingPage(uid, true);
    }

    componentDidMount() {
        
        Bridge.setShareAble("false");
        document.title = '编辑教室信息';
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', updateCM.onWindowResize)
    }

    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', updateCM.onWindowResize)
    }
    /**
     * 根据教室ID显示对应的信息
     * @param {*} roomId 
     */
    viewClassRoom(roomId, arr) {
        var _this = this;
        var param = {
            "method": 'viewClassRoom',
            "id": roomId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    var clazzRoom = result.response
                    var roomName = clazzRoom.name;
                    var gradeName = clazzRoom.defaultBindedClazz.name;
                    var defaultId = clazzRoom.defaultBindedClazz.id;
                    var teachBuildValue = clazzRoom.building ? clazzRoom.building.name : "";
                    var buildingId = [clazzRoom.building ? clazzRoom.building.id : ""];
                    _this.setState({
                        'classroomValue': roomName,
                        "gradeValue": gradeName,
                        "classId": defaultId,
                        buildingId,
                        teachBuildData: arr
                    });
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }
    /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            updateCM.setState({ clientHeight: document.body.clientHeight });
        }, 100)
    }
    /**
     * searchClassroomName搜索班级的名称
     */
    searchClassroomName() {
        if (updateCM.state.showPicker) {
            Toast.fail("请输入班级关键字")
        }
        var _this = this;
        var param = {
            "method": 'searchClazz',
            "aid": updateCM.state.uid,
            "keyWord": updateCM.state.gradeValue,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.response.length === 0) [
                    Toast.fail("没有找到该班级")
                ]
                if (result.msg == '调用成功' && result.success == true) {
                    var arr = [];
                    result.response.forEach(function (v, i) {
                        arr.push({
                            value: v.id, label: v.name
                        })
                    })
                    updateCM.setState({ searchData: arr });
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.info(error);
            }
        });
    }
    /**
   * 班级点击确定按钮事件
   */
    gradeOk = (val) => {
        const d = [...this.state.searchData];
        const gradeValueByNoom = [...val];
        this.setState({
            data: d,
            gradeValueByNoom,
            classId: gradeValueByNoom[0]
        });
        var newName;
        updateCM.state.data.forEach((v) => {
            if (v.value == val) {
                newName = v.label
                updateCM.setState({
                    gradeValue: newName
                })
            }
        })
    };

    //选择器改变事件
    onPickerChange = (val) => {
        
        const d = [...this.state.teachBuildData];
        const buildingId = [...val];
        this.setState({
            teachBuildData: d,
            buildingId,
        });
    };

    //取消事件
    onCancle = () => {
         updateCM.setState({
            "buildingId": updateCM.state.classIdBynoom
        })
        this.viewSchoolBuildingPage(updateCM.state.uid, true);
    }

    //选择器确定事件
    viewCourseTableItemPage = (val) => {
        const d = [...this.state.teachBuildData];
        const buildingId = [...val];
        this.setState({
            data: d,
            buildingId,
        });
    };
    /**
    * 班级选择改变事件
    */
    onGradeChange = (val) => {
        const d = [...this.state.searchData];
        const gradeValueByNoom = [...val];
        this.setState({
            data: d,
            gradeValueByNoom,
            classId: gradeValueByNoom[0]
        });
    }
    /**
     * 点击提交时，确认绑定教室和班级
     */
    binding = () => {
        var _this = this;
        if (_this.state.gradeName == '' || _this.state.classroomValue == '') {
            Toast.fail('请填写教室名称和班级名称', )
            return
        }
        var param;
        if (updateCM.state.buildingId) {
            param = {
                "method": 'updateClassRoom',
                "cr": {
                    "classId": updateCM.state.classId,
                    "creatorId": updateCM.state.uid,
                    "name": updateCM.state.classroomValue,
                    "id": updateCM.state.classIdBynoom,
                    "buildingId": updateCM.state.buildingId[0]
                }
            };
        } else {
            param = {
                "method": 'updateClassRoom',
                "cr": {
                    "creatorId": updateCM.state.uid,
                    "name": updateCM.state.classroomValue,
                    "classId": updateCM.state.classId,
                    "id": updateCM.state.classIdBynoom
                }
            };
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    _this.state.gradeValue = '';
                    _this.state.classroomValue = '';
                    Toast.success('修改成功');
                    setTimeout(function () {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                        });
                    }, 1000)
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    }

    /**
      * 查看教学楼列表
      */
    viewSchoolBuildingPage = (uid, flag) => {
        var param = {
            "method": 'viewSchoolBuildingPage',
            "uid": uid,
            "pn": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    var arr = [];
                    result.response.forEach(function (v, i) {
                        arr.push({
                            value: v.id, label: v.name
                        })
                    })
                    if (flag) {
                        updateCM.viewClassRoom(updateCM.state.classIdBynoom, arr)
                    } else {
                        updateCM.setState({ teachBuildData: arr });
                    }
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.info(error);
            }
        });
    }
    /**
   * 增加教学楼
   */
    toAddTeachBuild = () => {
        var url = WebServiceUtil.mobileServiceURL + "addTeachBuild?uid=" + updateCM.state.uid;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    render() {
        return (
            <div id="classroomManage" style={{ height: updateCM.state.clientHeight }}>
                <div className='addModel'>
                    <div className="mainCont">
                        <WhiteSpace size="lg" />
                        <List>
                            <div className='classroomName'>
                                <InputItem
                                    placeholder="请输入教室名称"
                                    data-seed="logId"
                                    onChange={v => {
                                        updateCM.setState({
                                            "classroomValue": v
                                        })
                                    }}
                                    value={this.state.classroomValue}
                                >教室名称<i className='redStar'>*</i></InputItem>
                            </div>
                            <WhiteSpace size="lg" />
                            <div className='gradeName'>
                                <InputItem
                                    placeholder="请输入班级名称"
                                    data-seed="logId"
                                    onChange={v => {
                                        updateCM.setState({
                                            "gradeValue": v,
                                            "classId": "",
                                            showPicker: false
                                        })
                                    }}
                                    value={this.state.gradeValue}
                                >班级名称<i className='redStar'>*</i></InputItem>
                                <Picker
                                    disabled={updateCM.state.showPicker}
                                    data={this.state.searchData}
                                    cols={1}
                                    className="forss calmForss"
                                    value={this.state.gradeValueByNoom}
                                    onPickerChange={this.onGradeChange}
                                    onOk={v => { this.gradeOk(v) }}
                                >
                                    <div id='stIcon' className='stIcon' onClick={this.searchClassroomName}>
                                        <img src={require('../imgs/icon_search.png')} />
                                    </div>
                                </Picker>
                            </div>
                            <WhiteSpace size="lg" />
                            {
                                    <div className='teachBuild'>
                                        <Picker
                                            data={this.state.teachBuildData}
                                            cols={1}
                                            className="forss"
                                            value={this.state.buildingId}
                                            onPickerChange={this.onPickerChange}
                                            onDismiss={this.onCancle}
                                            onOk={v => this.viewCourseTableItemPage(v)}
                                        >
                                            <Item arrow="horizontal" onClick={this.viewSchoolBuildingPage.bind(this,
                                                updateCM.state.uid, false)
                                            }
                                            >选择班级所处位置</Item>
                                        </Picker>
                                        <div className="addFloor" onClick={this.toAddTeachBuild}>
                                            新增位置信息
                                            {/*<button >+</button>新增教学楼*/}
                                        </div>
                                    </div>

                            }
                        </List>
                    </div>
                    <div className="bottomBox submitBtn">
                        <span className="bind" onClick={this.binding}>提 交</span>
                    </div>

                </div>
            </div>
        )
    }
}
