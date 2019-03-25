import React from "react";
import { Tabs, WhiteSpace, ListView } from 'antd-mobile';
import '../css/rankingList.less'
import { height } from "window-size";
const tabs = [
    { title: '答题排行榜' },
    { title: '运动排行榜' },
    { title: '爱心排行榜' },
];

var myDate = new Date();
//获取当前年
var year = myDate.getFullYear();
//获取当前月
var month = myDate.getMonth() + 1;
//获取当前日
var day = myDate.getDate();

var time = year + '-' + month + '-' + day;
var start = time + ' 00:00:00'
var end = time + ' 23:59:59';

var myWeekDate = new Date(); //获取七天前日期；
myWeekDate.setDate(myDate.getDate() - 365);
//获取当前年
var weekYear = myWeekDate.getFullYear();
//获取当前月
var weekMonth = myWeekDate.getMonth() + 1;
//获取当前日
var weekDay = myWeekDate.getDate();
var timeWeek = weekYear + '-' + weekMonth + '-' + weekDay;
var weekStart = timeWeek + ' 00:00:00';
export default class rankingList extends React.Component {
    constructor(props) {
        super(props);
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.initData = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            isLoadingLeft: true,
            flag: 1,
            ownData: {},
            num: ""
        };
    }
    componentDidMount () {
        Bridge.setShareAble("false");
        document.title = '运动排行列表';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        this.setState({
            userId
        })
        this.getWatch2gsByGuardianUserId(userId)
        this.getStudentAnswerRightCountTop(userId, start, end);
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', this.onWindowResize)
    }

    componentWillUnmount () {
        //解除监听
        window.removeEventListener('resize', this.onWindowResize)
    }
    /**
       * 视窗改变时改变高度
       */
    onWindowResize () {
        setTimeout(function () {
            this.setState({ clientHeight: document.body.clientHeight });
        }, 100)
    }

    //获取手表列表
    getWatch2gsByGuardianUserId = (userId) => {
        var param = {
            "method": 'getWatch2gsByGuardianUserId',
            "userId": userId,
            "pageNo": -1,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    if (result.response.length == 0) {
                        this.setState({
                            toBind:true
                        })
                    }
                } else {
                    // Toast.info('');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    /**
    *  查询答题排行榜
    */
    getStudentAnswerRightCountTop (userId, start, end) {
        var _this = this;
        _this.initData.splice(0);
        _this.state.dataSource = [];
        _this.state.dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        const dataBlob = {};
        var PageNo = this.state.defaultPageNo;
        var param = {
            "method": 'getStudentAnswerRightCountTop',
            "startTime": start,
            "endTime": end,
            "userId": userId,
            "pageNo": PageNo,
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "ioio")
                if (result.msg == '调用成功' && result.success == true) {
                    result.response.forEach((v, i) => {
                        if (this.state.userId == v.col_uid) {
                            this.setState({
                                ownData: v,
                                num: i
                            }, () => {
                                console.log(this.state.ownData, "oopop")
                            })
                        }
                    })
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
                // message.error(error);
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
        if (this.state.flag == 1) {
            _this.getStudentAnswerRightCountTop(this.state.userId, start, end);

        } else {
            _this.getStudentAnswerRightCountTop(this.state.userId, weekStart, end);
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.initData),
            isLoadingLeft: true,
        });
    };

    //今日
    clickToday = () => {
        $(".today").addClass("active")
        $(".week").removeClass("active")
        this.setState({
            flag: 1
        })
        this.getStudentAnswerRightCountTop(this.state.userId, start, end);
    }
    //本周
    toClickWeek = () => {
        console.log("00000")
        $(".week").addClass("active")
        $(".today").removeClass("active")
        this.setState({
            flag: 0
        })
        this.getStudentAnswerRightCountTop(this.state.userId, weekStart, end);
    }

    //toDetail
    toDetail = () => {
        var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.userId + "&flag=" + this.state.flag;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    render () {
        const row = (rowData, sectionID, rowID) => {
            console.log(rowData, "rowData")
            return (
                <div className='item'>
                    <div className='imgDiv' style={{ display: rowID < 3 ? "block" : "none" }}>
                        <img src={rowData.user.avatar} />
                    </div>
                    <div className="line_public itemCont my_flex">
                        <div className='num' style={{ display: rowID < 3 ? "none" : "block" }}>第{Number(rowID) + 1}名</div>
                        <div className='userName text_hidden'>{rowData.user.userName}</div>
                        <span className='color_9 text_hidden'>答对{rowData.count}道题</span>
                    </div>
                </div>
            );
        };
        return (
            <div id='rankingList' className='bg_gray'>
                <Tabs tabs={tabs}
                    initalPage={'t2'}
                >
                    <div className='questionCont'>
                        <div className="emptyCont" style={{ display: this.state.toBind ? "block" : "none" }}>
                            <div className="p38 my_flex">
                                <div>
                                    <i></i>
                                    <span>
                                        还没有任何信息<br />
                                        请先绑定手表二维码
                                    </span>
                                </div>
                            </div>
                            <div className='submitBtn'>马上绑定</div>
                        </div>
                        <div className='dateBtn'>
                            <span className='today active' onClick={this.clickToday}>今日</span>
                            <span className="week" onClick={this.toClickWeek}>本周</span>
                        </div>
                        <ListView
                            ref={el => this.lv = el}
                            dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                            renderFooter={() => (
                                <div style={{ paddingTop: 6, textAlign: 'center' }}>
                                    {this.state.isLoadingLeft ? '正在加载' : '已经全部加载完毕'}
                                </div>)}
                            renderRow={row}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                            className="am-list"
                            pageSize={30}    //每次事件循环（每帧）渲染的行数
                            //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                            scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                            onEndReached={this.onEndReached}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                            onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                            initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                            scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                            style={{
                                height: this.state.clientHeight - 82 - 50,
                            }}
                        />
                        <div className='myGrade' onClick={this.toDetail}>
                            <div className='inner my_flex'>
                                <span className='num'>第{Number(this.state.num) + 1}名</span>
                                <span className='userName text_hidden'>{this.state.ownData.user ? this.state.ownData.user.userName : ""}</span>
                                <span className='questionNum'>答对{this.state.ownData.count ? this.state.ownData.count : ""}道题</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: document.body.clientHeight }}>
                        2
                    </div>
                    <div style={{ height: document.body.clientHeight }}>
                        3
                    </div>
                </Tabs>
            </div>
        )
    }
}