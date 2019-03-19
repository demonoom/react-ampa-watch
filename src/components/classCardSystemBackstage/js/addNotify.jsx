import React from 'react';

import { List, Picker, InputItem, TextareaItem, Button, WhiteSpace, Toast, Icon } from 'antd-mobile';

import '../css/notify.less'

var calm;

export default class addNotify extends React.Component {

    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            defaultPageNo: 1,
            pickerData: [],  //选择项容器
            asyncValue: [],
            title: '',
            content: '',
            classroomId: 'test',  //所选班级id／
            inputValue: '',
            addRoomName: '',
        };
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var ident = locationSearch.split("&")[0].split('=')[1];
        this.setState({ ident });
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = "添加通知页面";
        window.addEventListener('resize', calm.onWindowResize)
    }
    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', calm.onWindowResize)
    }
    /**
   * 视窗改变时改变高度
   */
    onWindowResize() {
        setTimeout(function () {
            calm.setState({
                clientHeight: document.body.clientHeight,
            });
        }, 100)
    }
    getClassRoomId() {
        var _this = this;
        //获取班级选择项
        var param = {
            "method": 'viewClassRoomPageByClass',
            "uid": calm.state.ident,
            "pn": -1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = [{
                            value: 0, label: "全校"
                        }];
                        result.response.forEach(function (v, i) {
                            arr.push({
                                value: v.id, label: v.name
                            })
                        })
                        calm.setState({ pickerData: arr });
                    } else {
                        Toast.fail(result.msg, 1);
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }
    //选择器改变事件
    onPickerChange = (val) => {
        const d = [...this.state.pickerData];
        const asyncValue = [...val];
        this.setState({
            data: d,
            asyncValue,
        });
    };
    //选择器确定事件
    viewCourseTableItemPage = (val) => {
        const d = [...this.state.pickerData];
        const asyncValue = [...val];
        this.setState({
            data: d,
            asyncValue,
            classroomId: asyncValue[0],
        });
    };

    //提交
    submitClass = () => {
        let warn = '',
            classInfo = this.state;
        var _this = this;
        if (classInfo.classroomId == 'test') {
            warn = '请选择教室';
        } else if (classInfo.title == '') {
            warn = '请输入标题'
        } else if (classInfo.content == '') {
            warn = '请输入内容'
        }
        if (warn == '') {
            let classObject
            // 通过验证,开始提交
            if (classInfo.classroomId == 0) {
                classObject = {
                    uid: calm.state.ident,
                    noticeContent: classInfo.content,
                    classroomId: classInfo.classroomId,
                    noticeTitle: classInfo.title,
                    type: 2
                };
            } else {
                classObject = {
                    uid: calm.state.ident,
                    noticeContent: classInfo.content,
                    classroomId: classInfo.classroomId,
                    noticeTitle: classInfo.title,
                    type: 1
                };
            }
            var param = {
                "method": 'saveClassBrandNotice',
                "classBrandNoticeJson": classObject,
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    if (result.msg == '调用成功' || result.success == true) {
                        Toast.success('调用成功', 1);
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    } else {
                        Toast.fail(result.msg, 1);
                    }
                },
                onError: function (error) {
                    Toast.warn('保存失败');
                }
            });
        } else {
            Toast.info(warn, 1);
        }
    };
    //标题双向绑定
    titleHandleChange = event => {
        this.setState({ title: event });
    }
    //内容双向绑定
    contentHandleChange = event => {
        this.setState({ content: event });
    }

    inputOnChang = (e) => {
        this.setState({ inputValue: e.target.value })
    }

    showAddPower = () => {
        // this.setState({
        //     responseList: []
        // }, () => {
        this.UserByKeyWord();
        $('.updateModel').slideDown();
        $('.tagAddPanel_bg').show();
        $('.mask').show();
        console.log($('.mask').show());
        // })

    }

    exitAddTags = () => {
        $('.updateModel').slideUp();
        $('.tagAddPanel_bg').hide();
        $('.mask').hide();
        this.setState(({ responseList: [], selectedClassroomId: '', selectedRoomName: '', inputValue: '' }))
    }

    buildResponseList = (data) => {
        var _this = this;
        var arr = [];
        console.log(data, '构建的数据');
        data.forEach(function (v, i) {
            var buildName = v.building ? v.building.name : '';
            // console.log(buildName,'buildName')
            arr.push(<li className='line_public noomPowerList textOver' onClick={(e) => {
                for (var i = 0; i < $('.noomPowerList').length; i++) {
                    $('.noomPowerList').eq(i).removeClass("active");
                }
                e.target.className = 'active line_public noomPowerList';
                // if (WebServiceUtil.isEmpty(_this.state.selectedClassroomId)) {
                //     Toast.fail('请选择要添加的教室', 2)
                //     return
                // }
                _this.setState({ selectedClassroomId: v.id, selectedRoomName: v.name }, () => {
                    $('.updateModel').hide();
                    $('.tagAddPanel_bg').hide();
                    $('.mask').hide();
                    _this.setState(({ responseList: [], inputValue: '' }));
                    _this.setState({ classroomId: _this.state.selectedClassroomId, addRoomName: _this.state.selectedRoomName });
                });


            }}>{v.name + (buildName == '' ? '' : "(" + buildName + ")")}</li>)
        })
        this.setState({ responseList: arr })
    }

    searchUserByKeyWord = () => {
        this.setState({
            responseList: []
        }, () => {
            var _this = this;
            var PageNo = this.state.defaultPageNo;
            var param = {
                "method": 'viewClassRoomPage',
                "uid": calm.state.ident,
                "searchKeyWords": this.state.inputValue,
                "pn": PageNo,
            };

            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: result => {
                    if (result.msg == '调用成功' && result.success == true) {
                        if (!WebServiceUtil.isEmpty(result.response)) {
                            var res = result.response;
                            var listData = this.state.responseList;
                            for (var k in res) {
                                listData.push(res[k]);
                            }
                            // this.setState({
                            //     responseList: 
                            // })
                            _this.buildResponseList(listData);
                        } else {
                            Toast.fail('未找到该用户', 1)
                        }
                    } else {
                        Toast.fail(result.msg)
                    }

                },
                onError: function (error) {
                    Toast.fail(error, 1);
                }
            });
        });

    }


    UserByKeyWord = () => {
        var _this = this;
        var PageNo = this.state.defaultPageNo;
        var param = {
            "method": 'viewClassRoomPage',
            "uid": calm.state.ident,
            "searchKeyWords": this.state.inputValue,
            "pn": PageNo,
        };

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.msg == '调用成功' && result.success == true) {
                    if (!WebServiceUtil.isEmpty(result.response)) {
                        var res = result.response;
                        var listData = this.state.responseList;
                        listData = [{
                            building: {
                                dangerArea: false,
                                id: 97,
                                name: "",
                                normal: false,
                                punch: true,
                                type: 3,
                                valid: true,
                            },
                            createTime: 1543312979000,
                            defaultBindedClazz: {
                                id: 3487,
                                name: "产品诗词班",
                                schoolId: 0,
                            },
                            id: 0,
                            name: "全校",
                            valid: true,
                        }];
                        for (var k in res) {
                            listData.push(res[k]);
                        }
                        _this.buildResponseList(listData);
                    } else {
                        Toast.fail('未找到该用户', 1)
                    }
                } else {
                    Toast.fail(result.msg)
                }

            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    addTagsForSure = () => {
        if (WebServiceUtil.isEmpty(this.state.selectedClassroomId)) {
            Toast.fail('请选择要添加的教室', 2)
            return
        }
        $('.updateModel').hide();
        $('.tagAddPanel_bg').hide();
        this.setState(({ responseList: [], inputValue: '' }));
        this.setState({ classroomId: this.state.selectedClassroomId, addRoomName: this.state.selectedRoomName });
    }

    render() {
        return (
            <div id="notify" style={{ height: document.body.clientHeight }}>
                <WhiteSpace size="lg" />
                <div className='am-list-item am-list-item-middle' onClick={this.showAddPower}>
                    <div className="am-list-line">
                        <div className="am-list-content">选择教室</div>
                        <div className="am-list-extra">{this.state.addRoomName == '' ? '请选择' : this.state.addRoomName}</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>
                <WhiteSpace size="lg" />
                <InputItem
                    placeholder="请输入标题"
                    clear
                    moneyKeyboardAlign="left"
                    value={this.state.title}
                    maxLength={100}
                    onChange={this.titleHandleChange}
                >输入标题</InputItem>
                <WhiteSpace size="lg" />
                <List>
                    <div className="import_title">输入内容</div>
                    <TextareaItem
                        title={""}
                        placeholder={"请输入添加内容"}
                        rows={5}
                        count={2000}
                        value={this.state.content}
                        onChange={this.contentHandleChange}
                    />
                </List>
                <div className="submitBtn">
                    <Button type="primary" onClick={this.submitClass}>提交</Button>
                </div>
                <div className="mask" onClick={this.exitAddTags} style={{ display: 'none' }}></div>
                <div className='updateModel' style={{ display: 'none' }}>
                    <div className='searchDiv'>
                        <input type="text" value={this.state.inputValue} onChange={this.inputOnChang} placeholder='请输入搜索内容' />
                        <span onClick={this.searchUserByKeyWord}>搜索</span>
                    </div>
                    <div className='cont'>
                        {this.state.responseList}
                    </div>
                    {/*<div className="bottomBox">
                        <span className="close" onClick={this.exitAddTags}>取消</span>
                        <span className="bind" onClick={this.addTagsForSure}>确定</span>
                    </div>*/}
                </div>
                <div className="tagAddPanel_bg"></div>
                
            </div>
        );
    }
}
