import React from "react";
import "./pull.less"
import icon_topTop from "../images/icon_toTop.png";
import icon_refresh from '../images/icon_refresh.gif';
import { WatchWebsocketConnection } from '../../helpers/watch_websocket_connection';
import { Toast, Modal, NavBar, Popover } from 'antd-mobile';
const Item = Popover.Item;
const alert = Modal.alert;
var calm;
window.mescroll = null;
//消息通信js
window.ms = null;
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
myWeekDate.setDate(myDate.getDate() - 7);
//获取当前年
var weekYear = myWeekDate.getFullYear();
//获取当前月
var weekMonth = myWeekDate.getMonth() + 1;
//获取当前日
var weekDay = myWeekDate.getDate();
var timeWeek = weekYear + '-' + weekMonth + '-' + weekDay;
var weekStart = timeWeek + ' 00:00:00';
var pType = 0;
export default class pulltoRefresh extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            userData: {},
            guardianData: {},
            watchData: [],
            manageData: [],
            toBind: false,
            toBindValue: 0,
            clickDayStatus: 0,
            tabs: [
                {
                    title: "答题排行榜", label: 0, isActive: true
                },
                {
                    title: "爱心", label: 1, isActive: false
                },
                {
                    title: "运动", label: 2, isActive: false
                }
            ],
            days: [
                {
                    title: "今日", label: 0, isActive: true
                },
                {
                    title: "本周", label: 1, isActive: false
                }
            ]
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        this.setState({
            userId
        })
        this.getWatch2gsByGuardianUserId(userId)
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": userId,
                "machineType": "0",
                "version": '1.0',
            }
        };
        ms = new WatchWebsocketConnection();
        ms.connect(pro);
    }
    componentDidMount () {
        this.watchListener();
    }

    //消息监听
    watchListener () {
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {
                console.log(warnMsg, "warnMsg")
                Toast.info(warnMsg, 1, null, false)
            }, onMessage: function (info) {
                console.log(info, "infoWatch")
                if (info.command == "userOperateResponse") {
                    calm.getWatch2gsByGuardianUserId(calm.state.userId);
                    calm.state.watchData.forEach((value, i) => {
                        if (value.id == info.data.watchId) {
                            calm.setState({
                                guardians: value.guardians,
                                studentId: value.studentId,
                                manageData: value.guardians[0],
                            }, () => {
                                calm.state.guardians.forEach((v, i) => {
                                    if (v.guardian.colUid == calm.state.userId) {
                                        calm.setState({
                                            guardianData: v,
                                        }, () => {
                                            calm.setState({
                                                visible: false,
                                                phoneNumber: value.phoneNumber,
                                                watchId: value.id,
                                                watchName: value.watchName,
                                                macAddr: value.macAddress
                                            }, () => {
                                                if (this.state.clickDayStatus == 0) {
                                                    mescroll.destroy();
                                                    mescroll = new MeScroll("mescroll", {
                                                        down: {
                                                            htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
                                                        },
                                                        //上拉加载的配置项
                                                        up: {
                                                            callback: this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                                                            isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                                                            noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                                                            page: {
                                                                num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                                                                size: 30, //每页数据条数,默认10
                                                            },
                                                            htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                                                            clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                                                            toTop: { //配置回到顶部按钮
                                                                src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                                                                //offset : 1000
                                                            },
                                                        }
                                                    });
                                                } else {
                                                    mescroll.destroy();
                                                    mescroll = new MeScroll("mescroll", {
                                                        down: {
                                                            htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
                                                        },
                                                        //上拉加载的配置项
                                                        up: {
                                                            callback: this.getListDataWeek, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                                                            isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                                                            noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                                                            page: {
                                                                num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                                                                size: 30, //每页数据条数,默认10
                                                            },
                                                            htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                                                            clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                                                            toTop: { //配置回到顶部按钮
                                                                src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                                                                //offset : 1000
                                                            },
                                                        }
                                                    });
                                                }
                                            });
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            }
        };
    }

    componentWillUnmount () {
        //解除监听
        window.removeEventListener('resize', this.onWindowResize)
    }
    /**
       * 视窗改变时改变高度
       */
    onWindowResize () {
        setTimeout(() => {
            calm.setState({ clientHeight: document.body.clientHeight });
        }, 100)
    }


    /*联网加载列表数据  page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    getListData = (page) => {
        //联网加载数据
        this.getListDataFromNet(pType, page.num, page.size, (curPageData) => {
            //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
            //方法一(推荐): 后台接口有返回列表的总页数 totalPage
            //mescroll.endByPage(curPageData.length, totalPage); //必传参数(当前页的数据个数, 总页数)
            //方法二(推荐): 后台接口有返回列表的总数据量 totalSize
            // mescroll.endBySize(curPageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)
            //方法三(推荐): 您有其他方式知道是否有下一页 hasNext
            //mescroll.endSuccess(curPageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)
            //方法四 (推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
            mescroll.endSuccess(curPageData.length);
            //提示:curPageData.length必传的原因:
            // 1.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
            // 2.比传入的totalPage, totalSize, hasNext具有更高的判断优先级
            // 3.使配置的noMoreSize生效
            //设置列表数据
            this.setListData(curPageData, page);
        }, function () {
            //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
            Toast.info("请求失败", 1, null, false);
            mescroll.endErr();
        });
    }
    /*联网加载列表数据  page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    getListDataWeek = (page) => {
        //联网加载数据
        this.getListDataFromNetWeek(pType, page.num, page.size, (curPageData) => {
            //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
            //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
            //方法一(推荐): 后台接口有返回列表的总页数 totalPage
            //mescroll.endByPage(curPageData.length, totalPage); //必传参数(当前页的数据个数, 总页数)

            //方法二(推荐): 后台接口有返回列表的总数据量 totalSize
            // mescroll.endBySize(curPageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)
            //方法三(推荐): 您有其他方式知道是否有下一页 hasNext
            //mescroll.endSuccess(curPageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)

            //方法四 (推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
            mescroll.endSuccess(curPageData.length);
            //提示:curPageData.length必传的原因:
            // 1.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
            // 2.比传入的totalPage, totalSize, hasNext具有更高的判断优先级
            // 3.使配置的noMoreSize生效

            //设置列表数据
            this.setListData(curPageData, page);
        }, function () {
            //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
            Toast.info("请求失败", 1, null, false);
            mescroll.endErr();
        });
    }

    /*设置列表数据*/
    setListData = (curPageData, page) => {
        var listDom = document.getElementById("dataList");
        for (var i = 0; i < curPageData.length; i++) {
            var pd = curPageData[i];
            var str = `
            <div class="imgDiv">
                <img src=${pd.user ? pd.user.avatar : ""} onerror="onerror=null;src='http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png?size=100x100'" />
            </div>
            <div class="line_public itemCont my_flex">
                <div class='num'>第${(page.num - 1) * page.size + i + 1}名</div>
                <div class='userName text_hidden'>${pd.user ? pd.user.userName : ""}</div>
                <span class='color_9 text_hidden'>共${pType == 0 ? pd.count + "道" : pType == 1 ? pd.rank + "颗" : pd.rank + "步"}</span>
            </div>
            `
            var liDom = document.createElement("li");
            liDom.innerHTML = str;
            listDom.appendChild(liDom);
        }
    }
    /*
    获取数据
     * */
    getListDataFromNet = (pType, pageNum, pageSize, successCallback, errorCallback) => {
        if (pType == 0) {
            //延时一秒,模拟联网
            var param = {
                "method": 'getStudentAnswerRightCountTop',
                "startTime": start,
                "endTime": end,
                "userId": this.state.studentId,
                "pageNo": pageNum,
                "actionName": "watchAction",
            };
        } else if (pType == 1) {
            var param = {
                "method": 'getWatch2gLoveCountRankingByStudentId',
                "startTime": start,
                "endTime": end,
                "studentId": this.state.studentId,
                "pageNo": pageNum,
                "actionName": "watchAction",
            };
        } else if (pType == 2) {
            var param = {
                "method": 'getWatch2gSportStepTopByStudentId',
                "startTime": start,
                "endTime": end,
                "studentId": this.state.studentId,
                "pageNo": pageNum,
                "actionName": "watchAction",
            };
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (data) => {
                if (data.success) {
                    this.setState({
                        userData: data.user
                    })
                    var listData = [];
                    listData = data.response;
                    successCallback(listData)
                } else {
                    Toast.info(data.msg, 1, null, false);
                }

            },
            onError: () => {
                Toast.info("请求失败", 1, null, false);
                mescroll.endErr();
            }
        });
    }
    /*
    获取本周数据
     * */
    getListDataFromNetWeek = (pType, pageNum, pageSize, successCallback, errorCallback) => {
        if (pType == 0) {
            //延时一秒,模拟联网
            var param = {
                "method": 'getStudentAnswerRightCountTop',
                "startTime": weekStart,
                "endTime": end,
                "userId": this.state.studentId,
                "pageNo": pageNum,
                "actionName": "watchAction",
            };
        } else if (pType == 1) {
            var param = {
                "method": 'getWatch2gLoveCountRankingByStudentId',
                "startTime": weekStart,
                "endTime": end,
                "studentId": this.state.studentId,
                "pageNo": pageNum,
                "actionName": "watchAction",
            };
        } else if (pType == 2) {
            var param = {
                "method": 'getWatch2gSportStepTopByStudentId',
                "startTime": weekStart,
                "endTime": end,
                "studentId": this.state.studentId,
                "pageNo": pageNum,
                "actionName": "watchAction",
            };
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (data) => {
                if (data.success) {
                    this.setState({
                        userData: data.user
                    })
                    var listData = [];
                    listData = data.response;
                    successCallback(listData)
                } else {
                    Toast.info(data.msg, 1, null, false);
                }

            },
            onError: () => {
                Toast.info("请求失败", 1, null, false);
                endErr
            }
        });
    }

    //点击顶部
    clickP = (v) => {
        if (pType == v.label) {

        } else {
            pType = v.label;
            //重置列表数据
            mescroll.resetUpScroll();
        }
        // pType = v.label;
        if (v.label == 0) {
            this.setState({
                tabs: [
                    {
                        title: "答题排行榜", label: 0, isActive: true
                    },
                    {
                        title: "爱心", label: 1, isActive: false
                    },
                    {
                        title: "运动", label: 2, isActive: false
                    }
                ]
            })
        }
        if (v.label == 1) {
            this.setState({
                tabs: [
                    {
                        title: "答题", label: 0, isActive: false
                    },
                    {
                        title: "爱心排行榜", label: 1, isActive: true
                    },
                    {
                        title: "运动", label: 2, isActive: false
                    }
                ]
            })
        }
        if (v.label == 2) {
            this.setState({
                tabs: [
                    {
                        title: "答题", label: 0, isActive: false
                    },
                    {
                        title: "爱心", label: 1, isActive: false
                    },
                    {
                        title: "运动排行榜", label: 2, isActive: true
                    }
                ]
            })
        }

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
                if (result.success) {
                    if (result.response.length == 0) {
                        this.setState({
                            toBind: true,
                            toBindValue: 1
                        })
                    } else {
                        result.response[0].guardians.forEach((v, i) => {
                            if (v.guardian.colUid == this.state.userId) {
                                calm.setState({
                                    guardianData: v,
                                }, () => {
                                })
                            }
                        })
                        this.setState({
                            watchData: result.response,
                            studentId: result.response[0].student.colUid,
                            watchName: result.response[0].watchName,
                            manageData: result.response[0].guardians[0],
                            watchId: result.response[0].id,
                            macAddr: result.response[0].macAddress,
                        }, () => {
                            this.WatchList(this.state.watchData)
                            //创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,刷新列表数据;
                            mescroll = new MeScroll("mescroll", {
                                down: {
                                    htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
                                },
                                //上拉加载的配置项
                                up: {
                                    callback: this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                                    isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                                    noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                                    page: {
                                        num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                                        size: 30, //每页数据条数,默认10
                                    },
                                    htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                                    clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                                    toTop: { //配置回到顶部按钮
                                        src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                                        //offset : 1000
                                    },
                                }
                            });
                        })
                    }
                } else {
                    Toast.info(result.msg, 1, null, false);
                }
            },
            onError: () => {
                Toast.info("请求失败", 1, null, false);
                mescroll.endErr();
            }
        });
    }


    //手表列表
    WatchList = (data) => {
        var watchListData = [];
        data.forEach((v) => {
            watchListData.push(
                (<Item style={{ color: '#333' }} macId={v.id} mac={v.macAddress} key={v.id}>{v.watchName}</Item>)
            );
        });
        this.setState({
            watchListData
        })

    };
    //选择
    onSelect = (opt) => {
        this.state.watchData.forEach((v, i) => {
            if (v.id == opt.props.macId) {
                this.setState({
                    guardians: v.guardians,
                    studentId: v.studentId,
                    manageData: v.guardians[0],
                }, () => {
                    this.state.guardians.forEach((v, i) => {
                        if (v.guardian.colUid == this.state.userId) {
                            this.setState({
                                guardianData: v,
                            }, () => {
                                this.setState({
                                    visible: false,
                                    watchId: opt.props.macId,
                                    watchName: opt.props.children,
                                    macAddr: opt.props.mac
                                }, () => {
                                    if (this.state.clickDayStatus == 0) {
                                        mescroll.destroy();
                                        mescroll = new MeScroll("mescroll", {
                                            down: {
                                                htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
                                            },
                                            //上拉加载的配置项
                                            up: {
                                                callback: this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                                                isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                                                noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                                                page: {
                                                    num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                                                    size: 30, //每页数据条数,默认10
                                                },
                                                htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                                                clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                                                toTop: { //配置回到顶部按钮
                                                    src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                                                    //offset : 1000
                                                },
                                            }
                                        });
                                    } else {
                                        mescroll.destroy();
                                        mescroll = new MeScroll("mescroll", {
                                            down: {
                                                htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
                                            },
                                            //上拉加载的配置项
                                            up: {
                                                callback: this.getListDataWeek, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                                                isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                                                noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                                                page: {
                                                    num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                                                    size: 30, //每页数据条数,默认10
                                                },
                                                htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                                                clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                                                toTop: { //配置回到顶部按钮
                                                    src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                                                    //offset : 1000
                                                },
                                            }
                                        });
                                    }
                                });
                            })
                        }
                    })
                })
            }
        })

    };


    //点击今日本周
    clickDay = (v) => {
        if (this.state.clickDayStatus == v.label) {

        } else {
            this.setState({
                clickDayStatus: v.label
            })
            //今日
            if (v.label == 0) {
                mescroll.clearDataList();
                mescroll.destroy();
                mescroll = new MeScroll("mescroll", {
                    down: {
                        htmlContent: '<p class=""><img src=' + icon_refresh + '/></p><p class="downwarp-tip"></p>'
                    },
                    //上拉加载的配置项
                    up: {
                        callback: this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                        isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                        noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                        page: {
                            num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                            size: 30, //每页数据条数,默认10
                        },
                        htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                        clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                        toTop: { //配置回到顶部按钮
                            src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                            //offset : 1000
                        }
                    }
                });
            }
            //本周
            if (v.label == 1) {
                mescroll.clearDataList();
                mescroll.destroy();
                mescroll = new MeScroll("mescroll", {
                    down: {
                        htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
                    },
                    //上拉加载的配置项
                    up: {
                        callback: this.getListDataWeek, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                        isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                        noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                        page: {
                            num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                            size: 30, //每页数据条数,默认10
                        },
                        htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                        clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                        toTop: { //配置回到顶部按钮
                            src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                            //offset : 1000
                        },
                    }
                });
                this.setState({
                    days: [
                        {
                            title: "今日", label: 0, isActive: false
                        },
                        {
                            title: "本周", label: 1, isActive: true
                        }
                    ]
                })
            }
        }
    }
    //跳转绑定页面
    toJupmBind = () => {
        var url = WebServiceUtil.mobileServiceURL + "addWatchInfo?userId=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            navType: 2,
            url: url,
            backAlertInfo: "是否放弃本次编辑？"
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    //toDetail
    toDetail = () => {
        if (pType == 1) {
            var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.studentId + "&flag=" + this.state.clickDayStatus + "&tagType=love&num=" + this.state.userData.rank;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else if (pType == 2) {
            var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.studentId + "&flag=" + this.state.clickDayStatus + "&tagType=step&num=" + this.state.userData.rank;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
            var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.studentId + "&flag=" + this.state.clickDayStatus + "&tagType=answer&num=" + this.state.userData.rank;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        }

    }
    render () {
        return (
            <div id='pullToRefresh' className='bg_gray'>
                {/* 没有绑定空页面--start */}
                <div className="am-navbar-blue" style={{ display: this.state.toBind || ((this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2)) ? "block" : "none" }}>
                    <NavBar
                        mode="light"
                    >排行榜</NavBar>
                </div>
                <div style={{ display: !this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "block" }}>
                    <div className="emptyCont">
                        <div className="p38 my_flex">
                            <div>
                                <i></i>
                                <span>
                                    还没有任何信息<br />
                                    请先绑定手表二维码
                                    </span>
                            </div>
                        </div>
                        <div className='submitBtn' onClick={this.toJupmBind}>马上绑定</div>
                    </div>
                </div>
                {/* 没有绑定空页面---end */}

                {/*绑定后未验证空页面---start*/}
                <div className="commonLocation-cont" style={{ display: calm.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) == false ? "none" : "block" }}>
                    <div className="emptyCont emptyContBind">
                        <div className="p38 my_flex">
                            <div>
                                <i></i>
                                <span>
                                    申请已提交<br />
                                    请等待管理员（{this.state.manageData.familyRelate}）验证通过
                                    </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/*绑定后未验证空页面---end*/}

                <div className='pageWrap' style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "block" }}>
                    <div className="am-tabs-tab-bar-wrap">
                        <div className="am-tabs-default-bar-top am-tabs-default-bar">
                            <div className="am-tabs-default-bar-content">
                                {
                                    this.state.tabs.map((v, i) => {
                                        return (
                                            <div onClick={this.clickP.bind(this, v)} className={v.isActive ? "am-tabs-default-bar-tab-active" : "am-tabs-default-bar-tab"} i={v.label}>{v.title}</div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="am-navbar-blue watchSelect" style={{ display: !this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "block" : "none" }}>
                            <Popover mask
                                overlayClassName="fortest"
                                overlayStyle={{ color: 'currentColor' }}
                                visible={this.state.visible}
                                overlay={this.state.watchListData}
                                awatchSelectlign={{
                                    overflow: { adjustY: 0, adjustX: 0 },
                                    offset: [10, 0],
                                }}
                                onVisibleChange={(visible) => {
                                    this.setState({
                                        visible,
                                    });
                                }}
                                onSelect={this.onSelect}
                            >
                                <div style={{
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px 0 0 15px'
                                }}
                                >
                                    <span className='watchName text_hidden'>{this.state.watchName}</span> <i className="icon-back"></i>
                                </div>
                            </Popover>
                        </div>
                    </div>
                    <div className="questionCont">
                        <div id="mescroll" className="mescroll list-view-section-body">
                            <div className='dateBtn' style={{ display: this.state.toBind || this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block" }}>
                                {
                                    this.state.days.map((v, i) => {
                                        return (
                                            <span onClick={this.clickDay.bind(this, v)} className={v.isActive ? "active" : ""}>{v.title}</span>
                                        )
                                    })
                                }
                            </div>
                            <ul id="dataList" className="data-list">
                            </ul>
                        </div>
                        <div className='myGrade' onClick={this.toDetail}>
                            <div className='inner my_flex'>
                                <span className='num'>第{this.state.userData ? this.state.userData.rank : "0"}名</span>
                                <span className='userName text_hidden'>{this.state.userData == undefined ? "" : this.state.userData.user ? this.state.userData.user.userName : ""}</span>
                                <span className='questionNum'>{this.state.userData ? this.state.userData.count : "0"}{pType == 0 ? "题" : pType == 1 ? "颗" : "步"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
