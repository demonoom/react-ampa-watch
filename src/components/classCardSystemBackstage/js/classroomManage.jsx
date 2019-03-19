import React from 'react';
import {
    Toast,
    WhiteSpace,
    InputItem,
    List,
    Radio,
    ListView,
    Modal,
    PullToRefresh,
    Checkbox,
    Button,
    Flex,
} from 'antd-mobile';
import '../css/classroomManage.less'
import { ucs2 } from 'punycode';

const Item = List.Item;
const Brief = Item.Brief;
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
const alert = Modal.alert;
const RadioItem = Radio.RadioItem;
var classBinding;
var timer;

export default class classroomManage extends React.Component {

    constructor(props) {
        super(props);
        classBinding = this;
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.initData = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            selectData: [],
            showClear: false,
        };
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '绑定教室信息';
        var locationHref = window.location.href;
        // Toast.info(locationHref, 10)
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        console.log(locationSearch);
        var uid = locationSearch.split("&")[0].split("=")[1];
        this.setState({ "uid": uid });
        this.viewClassRoomPage(uid, true);
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
            classBinding.setState({ clientHeight: document.body.clientHeight });
        }, 100)
    }

    /**
     * 查看教室信息
     */
    viewClassRoomPage(uid, flag) {
        var _this = this;
        if (flag) {
            _this.initData.splice(0);
            _this.state.dataSource = [];
            _this.state.dataSource = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
        }

        const dataBlob = {};
        var PageNo = this.state.defaultPageNo;
        var param = {
            "method": 'viewClassRoomPage',
            "uid": uid,
            "searchKeyWords": this.input.value,
            "pn": PageNo,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
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
                } else {
                    Toast.fail(result.msg, 3);
                }
            },
            onError: function (error) {
                Toast.info(error);
            }
        });
    }

    /**
     * 开启添加教室管理的界面
     */
    addClassroomM = () => {
        var url = WebServiceUtil.mobileServiceURL + "addClassroomManage?uid=" + classBinding.state.uid;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
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
        _this.viewClassRoomPage(_this.state.uid, false);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.initData),
            isLoadingLeft: true,
        });
    };

    onRefresh = () => {
        var divPull = document.getElementsByClassName('am-pull-to-refresh-content');
        divPull[0].style.transform = "translate3d(0px, 30px, 0px)";   //设置拉动后回到的位置
        this.setState({ defaultPageNo: 1, refreshing: true, isLoadingLeft: true });
        this.viewClassRoomPage(this.state.uid, true);
    }

    /**
     * 根据ID修改教室
     * @param {*} id
     */
    toUpdatePage(id) {
        var url = WebServiceUtil.mobileServiceURL + "updateClassroom" + "?classId=" + id.id + "&uid=" + classBinding.state.uid;
        var data = {
            method: 'openNewPage',
            url: url
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    /**
     * 根据ID删除教室
     * @param {*} classRoomId
     */
    delClassroom(classRoomId) {
        var _this = this;
        var param = {
            "method": 'deleteClassRoom',
            "id": classRoomId,
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
                        if (classRoomId == v.id) {
                            _this.initData.splice(i, 1);
                        }
                    });
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData)
                    });
                } else {
                    Toast.fail(result.msg, 3)
                }

            },
            onError: function (error) {
                Toast.info('删除失败');
            }
        });
    }

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
            { text: '确定', onPress: () => _this.delClassroom(sId) },

        ], phone);
    };

    /**
     * 批量编辑教室坐标
     */
    bindCoordinates() {
        var phoneType = navigator.userAgent;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1 || phoneType.indexOf('Android') > -1) {
            Toast.info('请在浏览器中的小蚂蚁教师端完成该功能', 3)
            return
        }
        var data = {
            method: 'bindCoordinates'
        };
        Bridge.callHandler(data, null, function (error) {
            Toast.fail(error, 5)
        });
    }

    searchInput = () => {
        clearTimeout(timer);
        this.state.defaultPageNo = 1;
        timer = setTimeout(() => {
            console.log(this.input.value, 'index');
            this.viewClassRoomPage(this.state.uid, true);
        }, 400);
        this.setState({
            showClear: (this.input.value != '')
        })

    }

    clearSearch = () => {
        this.input.value = '';
        this.setState({ showClear: false })
        this.viewClassRoomPage(this.state.uid, true);
    }

    render() {
        var _this = this;
        const row = (rowData, sectionID, rowID) => {
            console.log(rowData);
            return (<div>
                {
                    <div className="classInfo line_public">
                        <div className="textOver">
                            <span className="classroom">教室名称：{rowData.name}</span>
                        </div>

                        <div className="textOver">
                            {
                                rowData.defaultBindedClazz ?
                                    <span className="grade">绑定班级：{rowData.defaultBindedClazz.name}</span> :
                                    <span className="grade"></span>
                            }

                        </div>
                        <div className="div_creatTime">
                            <span className="creatTime">
                                所处位置：
                                {
                                    rowData.building ?
                                        <span>{rowData.building.name}
                                        </span>
                                        :
                                        "暂未选择位置"
                                }
                            </span>
                            <Button className="modifyBtn_common" type="primary" size="small"
                                onClick={this.toUpdatePage.bind(this, rowData)}></Button>
                            <Button type="primary" size="small" className="btn_del deleteBtn_common"
                                onClick={this.showAlert.bind(this, rowData.id)}
                            ></Button>
                        </div>
                    </div>
                }
            </div>

            )
        };

        return (
            <div id="classroomManage" style={{ height: classBinding.state.clientHeight }}>

                <div className="nav search-nav">
                    <i></i><input type="text" ref={input => this.input = input} onInput={this.searchInput.bind(this)} placeholder="请输入搜索内容" /><span style={
                        this.state.showClear ? { display: 'block' } : { display: 'none' }
                    } onClick={this.clearSearch} className="close"></span>
                </div>
                <div className='tableDiv' style={{ height: classBinding.state.clientHeight - 52 }}>
                    <li style={
                        this.input && this.input.value != '' ? { display: 'none' } : { display: 'block' }
                    } className="edit_coordinateLi line_public"><span onClick={_this.bindCoordinates} className="edit_coordinate">批量编辑教室坐标</span></li>
                    {/*这是列表数据,包括添加按钮*/}
                    <ListView
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                        renderFooter={() => (
                            <div style={{ paddingTop: 5, paddingBottom: 40, textAlign: 'center' }}>
                                {this.state.isLoadingLeft ? '正在加载' : '已经全部加载完毕'}
                            </div>)}
                        renderRow={row}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                        className="am-list ListView_height"
                        pageSize={30}    //每次事件循环（每帧）渲染的行数
                        //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                        scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                        onEndReached={this.onEndReached}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                        onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                        initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                        scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                        style={{
                            height: classBinding.state.clientHeight - 99,
                        }}
                        pullToRefresh={<PullToRefresh
                            onRefresh={this.onRefresh}
                            distanceToRefresh={80}
                        />
                        }
                    />
                    <div className='addBunton' onClick={this.addClassroomM}>
                        <img src={require("../imgs/addBtn.png")} />
                    </div>
                </div>

            </div>
        );
    }

}

