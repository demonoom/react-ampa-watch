import React from "react";
import {
    Toast,
    WhiteSpace,
    InputItem,
    List,
    Modal,
    Flex,
    Picker
} from 'antd-mobile';

const Item = List.Item;
const Brief = Item.Brief;
const alert = Modal.alert;
var classBinding;
export default class addClassroomManage extends React.Component {
    constructor(props) {
        super(props);
        classBinding = this;
        this.state = {
            clientHeight: document.body.clientHeight,
            searchData: [],
            teachBuildData: [],
            buildingId: [],
            gradeValue: [],
            data:[],
            gradeValueByNoom:[]
        };
    }
    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '添加教室信息';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var uid = locationSearch.split("&")[0].split("=")[1];
        this.setState({ "uid": uid });
        window.addEventListener('resize', classBinding.onWindowResize)
    }

    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', classBinding.onWindowResize)
    }

    /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            classBinding.setState({
                clientHeight: document.body.clientHeight,
            });
        }, 100)
    }
    /**
    * searchClassroomName搜索班级的名称
    */
    searchClassroomName() {
        var _this = this;
        var param
        if (classBinding.state.gradeValue.length == 0) {
            param = {
                "method": 'searchClazz',
                "aid": classBinding.state.uid,
                "keyWord": "",
            };
        } else {
            param = {
                "method": 'searchClazz',
                "aid": classBinding.state.uid,
                "keyWord": classBinding.state.gradeValue,
            };
        }

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    var arr = [];
                    result.response.forEach(function (v, i) {
                        arr.push({
                            value: v.id, label: v.name
                        })
                    })
                    classBinding.setState({ searchData: arr });
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
       * 查看教学楼列表
       */
    viewSchoolBuildingPage = (uid) => {
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
                    classBinding.setState({ teachBuildData: arr });
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
        classBinding.setState({
            "buildingId": ""
        })
        var url = WebServiceUtil.mobileServiceURL + "addTeachBuild?uid=" + classBinding.state.uid;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    /**
    * 点击提交时，确认绑定教室和班级
    */
    binding = () => {
        if(classBinding.state.gradeValueByNoom[0] == undefined){
            Toast.info("未检测到班级，请点击搜索按钮选择班级!",3)
            return
        }
        var _this = this;
        if (classBinding.state.gradeValue == '' || classBinding.state.classroomValue == '') {
            Toast.fail('请输入教室名称或班级名称')
            return
        }
        var param;
        if (classBinding.state.buildingId == undefined) {
            param = {
                "method": 'addClassRoom',
                "cr": {
                    "creatorId": classBinding.state.uid,
                    "name": classBinding.state.classroomValue,
                    "classId": classBinding.state.gradeValueByNoom[0],
                }
            };
        } else {
            param = {
                "method": 'addClassRoom',
                "cr": {
                    "creatorId": classBinding.state.uid,
                    "name": classBinding.state.classroomValue,
                    "classId": classBinding.state.gradeValueByNoom[0],
                    "buildingId": classBinding.state.buildingId[0]
                }
            };
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    _this.state.gradeValue = '';
                    _this.state.classroomValue = '';
                    _this.state.buildingId = '';
                    Toast.success('成功');
                    var data = {
                        method: 'finishForRefresh',
                    };
                    Bridge.callHandler(data, null, function (error) {
                    });
                } else {
                    Toast.fail(result.msg, 2);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    }
    /**
    * 班级点击确定按钮事件
    */
    gradeOk = (val) => {
        const d = [...this.state.searchData];
        classBinding.setState({
            gradeValue:d[0].label
        })
        const gradeValueByNoom = [...val];
        this.setState({
            data: d,
            gradeValueByNoom,
        });
        var newName;
        classBinding.state.data.forEach((v) => {
            if (v.value == val) {
                newName = v.label
                classBinding.setState({
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
            data: d,
            buildingId,
        });
    };

    onCancle = ()=>{
        classBinding.setState({
            // "teachBuildValue": "",
            "buildingId": ""
        })
    }
    //选择器确定事件
    viewCourseTableItemPage = (val) => {
        const d = [...this.state.teachBuildData];
        const buildingId = [...val];
        this.setState({
            data: d,
            buildingId,
        });
        // if (classBinding.state.buildingId == 0) {
        //     this.toAddTeachBuild();
        // }
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
        });
    }

    render() {
        return (
            <div id="classroomManage" style={{ height: classBinding.state.clientHeight }}>
                <div className='addModel'>
                    <div className="mainCont">
                        <WhiteSpace size="lg" />
                        <List>
                            <div className='classroomName'>
                                <InputItem
                                    placeholder="请输入教室名称"
                                    data-seed="logId"
                                    onChange={v => {
                                        classBinding.setState({
                                            "classroomValue": v
                                        })
                                    }}
                                    value={this.state.classroomValue}
                                >教室名称<i className='redStar'>*</i></InputItem>
                            </div>
                            <WhiteSpace size="lg" />
                            <div className='gradeName'>
                                <InputItem
                                    placeholder="请输入班级名称并搜索"
                                    data-seed="logId"
                                    onChange={v => {
                                        classBinding.setState({
                                            "gradeValue": v,
                                            "classId": ""
                                        })
                                    }}
                                    value={this.state.gradeValue}
                                >班级名称<i className='redStar'>*</i></InputItem>
                                <Picker
                                    data={this.state.searchData}
                                    cols={1}
                                    className="forss"
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
                                        classBinding.state.uid)
                                    }
                                    >选择班级所处位置</Item>
                                </Picker>
                            </div>
                            <div className="addFloor" onClick={this.toAddTeachBuild}>
                                新增位置信息
                                {/*<button >+</button>新增教学楼*/}
                            </div>
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



