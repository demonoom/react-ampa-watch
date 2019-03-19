import React from 'react';
import { List, Icon, Toast, Picker, WhiteSpace, ListView, Modal, } from 'antd-mobile';
import '../css/notify.less'

const Item = List.Item;
const Brief = Item.Brief;
const alert = Modal.alert;
var classBinding;

export default class notifyBack extends React.Component {

    constructor(props) {
        super(props);
        classBinding = this;
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.initData = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            clientHeight: document.body.clientHeight,
            // data: [],
            Icon: <Icon type='cross-circle-o' />,
            pickerData: [],  //选择项容器
            asyncValue: [],
            defaultPageNo: 1,
            classroomId: '',
        };
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var ident = locationSearch.split("&")[0].split('=')[1];
        this.setState({ ident });
        this.getClassBrandNoticeListByUserId(ident);
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = "通知列表";
        //首页显示全部
        // this.getClassBrandNoticeListByClassId(false);
    }

    /**
     * 通知列表
     */

    getClassBrandNoticeListByUserId(ident) {
        var _this = this;
        _this.state.dataSource = [];
        _this.state.dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        var dataBlob = {};
        var PageNo = this.state.defaultPageNo;
        var param = {
            "method": "getClassBrandNoticeListByUserId",
            "userId": ident,
            "pageNo": PageNo
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.msg == '调用成功' || result.success) {
                    classBinding.state.selectData = result.response
                    var arr = result.response;
                    var pager = result.pager;
                    for (let i = 0; i < arr.length; i++) {
                        var topic = arr[i];
                        dataBlob[`${i}`] = topic;
                    }
                    var isLoading = false;
                    if (arr.length > 0) {
                        if (pager.pageCount == 1 && pager.rsCount < 30) {
                            isLoading = false;
                        } else {
                            isLoading = true;
                        }
                    } else {
                        isLoading = false;
                    }
                    _this.initData = _this.initData.concat(arr);
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData),
                        isLoadingLeft: isLoading,
                        refreshing: false
                    })
                }
            },
            onError: function (error) {
                Toast.info('获取列表失败', error);
            }
        });
    }

    //通过教室id获取通知列表
    getClassBrandNoticeListByClassId(classroomId) {
        console.log(classroomId, "classroomid")
        var _this = this;
        _this.state.dataSource = [];
        _this.state.dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        var dataBlob = {};
        var PageNo = this.state.defaultPageNo;
        var param;
        if (classroomId || classroomId == 0) {
            _this.initData = [];
            param = {
                "method": 'getClassBrandNoticeListByClassId',
                "classroomId": classroomId,
                "userId": _this.state.ident,
                "pageNo": PageNo,
            }
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.msg == '调用成功' || result.success) {
                    classBinding.state.selectData = result.response
                    var arr = result.response;
                    var pager = result.pager;
                    for (let i = 0; i < arr.length; i++) {
                        var topic = arr[i];
                        dataBlob[`${i}`] = topic;
                    }
                    var isLoading = false;
                    if (arr.length > 0) {
                        if (pager.pageCount == 1 && pager.rsCount < 30) {
                            isLoading = false;
                        } else {
                            isLoading = true;
                        }
                    } else {
                        isLoading = false;
                    }
                    _this.initData = _this.initData.concat(arr);
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData),
                        isLoadingLeft: isLoading,
                        refreshing: false
                    })
                }
            },
            onError: function (error) {
                Toast.info('获取列表失败', error);
            }
        });
    }

    //新打开添加课程页
    toAddNotify=()=> {
        // var url = "http://192.168.43.169:6443/richTextEditor/index.html?access_user="+this.state.ident;
        var url = "https://www.maaee.com:6443/richTextEditor/index.html?access_user="+this.state.ident;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //新打开通知详情页
    toNotifyDetail(notifyId) {
        var url = WebServiceUtil.mobileServiceURL + "notifyDetail?nodeId=" + notifyId;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //删除通知信息
    /**
     * 删除弹出框
     */
    showAlert = (sId) => {
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        var _this = this;
        const alertInstance = alert('您确定要删除吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => _this.deleteNotify(sId) },

        ], phone);


    };

    /**
     * 根据ID删除
     */
    deleteNotify(notifyId) {
        var _this = this;
        //获取班级选择项
        var param = {
            "method": 'deleteClassBrandNotice',
            "classBrandNoticeId": notifyId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('删除成功', 1);
                    _this.state.dataSource = [];
                    _this.state.dataSource = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    _this.initData.forEach(function (v, i) {
                        if (notifyId == v.id) {
                            _this.initData.splice(i, 1);
                        }
                    });
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData)
                    });
                }
            },
            onError: function (error) {
                // message.error(error);
                Toast.info('删除失败');
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
        console.log(val, "vvv")
        const d = [...this.state.pickerData];
        const asyncValue = [...val];
        this.setState({
            data: d,
            asyncValue,
            classroomId: val[0]
        });
        if (val[0] == 0 || val[0]) {
            this.getClassBrandNoticeListByClassId(val[0]);
        }
    };


    /**
     *  ListView数据全部渲染完毕的回调
     */
    onEndReached = (event) => {
        var _this = this;
        var currentPageNo = this.state.defaultPageNo;
        if (!this.state.isLoadingLeft && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        this.setState({ isLoadingLeft: true, defaultPageNo: currentPageNo });
        // _this.getClassBrandNoticeListByClassId(_this.state.classroomId);
        _this.getClassBrandNoticeListByUserId(_this.state.ident);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.initData),
            isLoadingLeft: true,
        });
    };

    //获取教室ID
    getClassRoomId() {
        var _this = this;
        //获取班级选择项
        var param = {
            "method": 'viewClassRoomPageByClass',
            "uid": classBinding.state.ident,
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
                        classBinding.setState({ pickerData: arr });
                    }
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    render() {
        var _this = this;
        const row = (item, sectionID, rowID) => {
            return (
                <div className="listCont">
                    <Item onClick={this.toNotifyDetail.bind(this, item.id)} align="top"
                        multipleLine>
                        <div className="clear">
                            <span className="title text_hidden" dangerouslySetInnerHTML={{ __html: item.noticeTitle }}></span>
                            <span className="time">{item.createTime}</span>
                        </div>
                        <div className="brief_text" dangerouslySetInnerHTML={{ __html: item.noticeContent }}></div>
                        {/* <Brief >{item.noticeContent}</Brief> */}
                        {
                            item.type == 1 ?
                                <div
                                    className="classroom_label textOver">{WebServiceUtil.isEmpty(item.classRoom) == true ? '' : item.classRoom.name}
                                </div>
                                :
                                <div
                                    className="classroom_label textOver">全校通知
                                </div>
                        }
                    </Item>
                    {/* <Icon onClick={this.deleteNotify.bind(this, item.id)} type='cross-circle-o'
                          className="deleteNoifty"></Icon>*/}
                    <div onClick={this.showAlert.bind(this, item.id)} type='cross-circle-o'
                        className="deleteNoifty deleteBtn_common"></div>
                    <img src={require("../imgs/icon_notifyList.png")} alt="头像" className="headPic" />
                </div>
            )
        };
        return (
            <div id="notify" style={{ height: document.body.clientHeight }}>
                <List className="my-list">
                    <Picker data={this.state.pickerData}
                        cols={1}
                        className="forss"
                        value={this.state.asyncValue}
                        onPickerChange={this.onPickerChange}
                        onOk={v => this.viewCourseTableItemPage(v)}>
                        <Item arrow="horizontal" onClick={this.getClassRoomId}>选择教室</Item>
                    </Picker>
                    <ListView
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                        renderFooter={() => (
                            <div style={{ paddingTop: 5, paddingBottom: 40, textAlign: 'center' }}>
                                {this.state.isLoadingLeft ? '正在加载' : '已经全部加载完毕'}
                            </div>)}
                        renderRow={row}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                        className="am-list notifyList"
                        pageSize={30}    //每次事件循环（每帧）渲染的行数
                        //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                        scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                        onEndReached={this.onEndReached}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                        onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                        initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                        scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                        style={{
                            height: classBinding.state.clientHeight,
                        }}
                    />

                </List>
                <div className="addBunton" onClick={this.toAddNotify}>
                    <img src={require("../../ringBindInformation/imgs/addBtn.png")} />
                </div>
            </div>
        );
    }
}