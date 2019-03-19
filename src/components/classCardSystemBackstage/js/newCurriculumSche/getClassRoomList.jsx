import React from 'react';
import {
    ListView,
    PullToRefresh,
    Toast,
    SearchBar, Button, WhiteSpace, WingBlank
} from 'antd-mobile';

import '../../css/newCurriculumSche/getClassRoomList.less'

var classBinding;
var timer;
export default class getClassRoomList extends React.Component {

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
            showClear: false,
        };
    }


    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '教室列表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var uid = locationSearch.split("&")[0].split("=")[1];
        this.setState({ "uid": uid });
        var uidKey = {
            "colUid": uid
        }
        localStorage.setItem("classTableIdent", JSON.stringify(uidKey));
        this.viewClassRoomPage(uid, true);
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
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
    viewClassRoomPage = (uid, flag) => {
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
            }
        });
    }

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

    turnToClassTable(rowData) {
        var currentAttendanceListUrl = WebServiceUtil.mobileServiceURL + "getClassTableList?clazzroomId=" + rowData.id;

        var data = {
            method: 'openNewPage',
            url: currentAttendanceListUrl
        };

        Bridge.callHandler(data, null, function (error) {
            window.location.href = currentAttendanceListUrl;
        });
    }


    addMoreClassTable = () => {
        var phoneType = navigator.userAgent;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1 || phoneType.indexOf('Android') > -1) {
            Toast.info('请在浏览器中的小蚂蚁教师端完成该功能', 3)
            return
        }
        var data = {
            method: 'selectOnlyExcel',
        };
        var _this = this;
        Bridge.callHandler(data, function (res) {
            //拿到视频地址,显示在页面等待上传
            var arr = res.split(',');
            let newArr = [];
            let pathArr = [];
            var videoPath;
            var videoName;
            var videoExtra;
            arr.forEach((v, i) => {
                let item = v.split("?");
                pathArr.push(item[0])
                videoPath = item[0];
                videoName = item[1].split("=")[1];
                videoExtra = (item[1].split("=")[1]).split(".")[1];
                newArr.push({
                    "filePath": videoPath,
                    "fileName": videoName
                })
                _this.batchAddCourseTable(videoPath)

            })
        }, function (error) {
            console.log(error);
        });
    }


    /**
     * 保存上传的课程表
     */
    batchAddCourseTable = (path) => {
        var param = {
            "method": 'batchAddCourseTable',
            "url": path,
            "userId": this.state.uid
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.success == true) {
                    Toast.info("上传成功", 1);
                } else {
                    Toast.info(result.msg)
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }
    /**
     * 搜索框
     */
    searchInput = () => {
        clearTimeout(timer);
        this.state.defaultPageNo = 1;
        timer = setTimeout(() => {
            this.viewClassRoomPage(this.state.uid, true);
        }, 400);
        this.setState({
            showClear: (this.input.value != '')
        })

    }
    /**
     * 删除按钮
     */
    clearSearch = () => {
        this.input.value = '';
        this.setState({ showClear: false })
        this.viewClassRoomPage(this.state.uid, true);
    }
    render() {
        var _this = this;
        const row = (rowData, sectionID, rowID) => {
            return (
                <div onClick={this.turnToClassTable.bind(this, rowData)}>
                    {
                        <div className="classInfo line_public">
                            <div className="am-list-item am-list-item-middle">
                                <div className="am-list-line">
                                    <div className="am-list-content">教室名称：{rowData.name}</div>
                                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                                </div>
                            </div>
                            <div className="classroom_subject textOver" style={{ width: '100%' }}>
                                <span className="grade grade-left grade-letter1">教室ID：</span><span className="grade grade-right">{rowData.id}</span>
                            </div>
                            <div className="classroom_subject textOver" style={{ width: '100%' }}>
                                {
                                    rowData.defaultBindedClazz ?
                                        <div><span className="grade grade-left">绑定班级：</span><span className="grade grade-right">{rowData.defaultBindedClazz.name}</span> </div> :
                                        <span className="grade"></span>
                                }
                            </div>
                            <div className="classroom_subject textOver" style={{ width: '100%' }}>
                                {
                                    rowData.defaultBindedClazz ?
                                        <div><span className="grade grade-left grade-letter1">班级ID：</span><span className="grade grade-right">{rowData.defaultBindedClazz.id}</span></div> :
                                        <span className="grade"></span>
                                }

                            </div>

                        </div>
                    }
                </div>
            )
        };
        return (
            <div id="getClassRoomList" style={{ height: classBinding.state.clientHeight }}>
                <div className="nav search-nav">
                    <i></i><input type="text" ref={input => this.input = input} onInput={this.searchInput.bind(this)} placeholder="请输入搜索内容" /><span style={
                        this.state.showClear ? { display: 'block' } : { display: 'none' }
                    } onClick={this.clearSearch} className="close"></span>
                </div>
                <div style={
                    this.input && this.input.value != '' ? { display: 'none' } : { display: 'block' }
                } className="edit_coordinateLi line_public" onClick={this.addMoreClassTable}>
                    <span className="edit_coordinate">批量上传课程表</span>
                </div>
                <div className='tableDiv' style={{ height: classBinding.state.clientHeight }}>
                    {/*这是列表数据,包括添加按钮*/}
                    <ListView
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                        renderFooter={() => (
                            <div style={{ paddingTop: 5, paddingBottom: 40, textAlign: 'center' }}>
                                {this.state.isLoadingLeft ? '正在加载' : '已经全部加载完毕'}
                            </div>)}
                        renderRow={row}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                        className="am-list"
                        pageSize={15}    //每次事件循环（每帧）渲染的行数
                        //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                        scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                        onEndReached={this.onEndReached}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                        onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                        initialListSize={15}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                        scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                        style={{
                            height: classBinding.state.clientHeight - 52,
                        }}
                        pullToRefresh={<PullToRefresh
                            onRefresh={this.onRefresh}
                            distanceToRefresh={80}
                        />}
                    />
                </div>
            </div>
        );
    }
}
