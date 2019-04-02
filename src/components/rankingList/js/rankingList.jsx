import React from "react";
import { Tabs, WhiteSpace, Toast, PullToRefresh, ListView, NavBar, Popover } from 'antd-mobile';
import { WatchWebsocketConnection } from '../../../helpers/watch_websocket_connection';
import '../css/rankingList.less'
import { height } from "window-size";
import { Modal } from "antd-mobile/lib/index";
const Item = Popover.Item;
const alert = Modal.alert;
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
var calm;
//消息通信js
window.ms = null;
export default class rankingList extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        const dataSourceLove = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        const dataSourceStep = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.initData = [];
        this.initDataLove = [];
        this.initDataStep = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            dataSourceLove: dataSourceLove.cloneWithRows(this.initDataLove),
            dataSourceStep: dataSourceStep.cloneWithRows(this.initDataStep),
            defaultPageNo: 1,
            defaultPageNoLove: 1,
            defaultPageNoStep: 1,
            clientHeight: document.body.clientHeight,
            isLoadingLeft: true,
            isLoadingLeftLove: true,
            isLoadingLeftStep: true,
            flag: 1,
            flagLove: 1,
            flagStep: 1,
            ownData: {},
            watchName: "",
            num: "",
            tabs: [
                { title: '答题排行榜' },
                { title: '运动' },
                { title: '爱心' },
            ],
            guardianData: {},
            guardianDataLove: {},
            guardianDataStep: {},
            watchData: [],
            iniTab: 0,
            freshFlag: true,
            freshFlagLove: true,
            freshFlagStep: true,
        };
    }
    /**
    *  查询爱心排行榜
    */
    getWatch2gLoveCountRankingByStudentId (userId, start, end) {
        console.log(start, "start")
        var _this = this;
        if (this.state.freshFlagLove == false) {
            _this.initDataLove.splice(0);
            _this.state.dataSourceLove = [];
            _this.state.dataSourceLove = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
        }
        const dataBlob = {};
        var PageNo = this.state.defaultPageNoLove;
        var param = {
            "method": 'getWatch2gLoveCountRankingByStudentId',
            "startTime": start,
            "endTime": end,
            "studentId": userId,
            "pageNo": PageNo,
            "actionName": "watchAction",
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' && result.success == true) {
                    this.setState({
                        ownDataLove: result.user,
                        numLove: result.user.rank
                    }, () => {
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
                    _this.initDataLove = _this.initDataLove.concat(arr);
                    _this.setState({
                        dataSourceLove: _this.state.dataSourceLove.cloneWithRows(_this.initDataLove),
                        isLoadingLeftLove: isLoading,
                        refreshingLove: false
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }
    /**
    *  查询运动排行榜
    */
    getWatch2gSportStepTopByStudentId (userId, start, end) {
        var _this = this;
        if (this.state.freshFlagStep == false) {
            _this.initDataStep.splice(0);
            _this.state.dataSourceStep = [];
            _this.state.dataSourceStep = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
        }
        const dataBlob = {};
        var PageNo = this.state.defaultPageNoStep;
        var param = {
            "method": 'getWatch2gSportStepTopByStudentId',
            "startTime": start,
            "endTime": end,
            "studentId": userId,
            "pageNo": this.state.defaultPageNoStep,
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' && result.success == true) {
                    this.setState({
                        ownDataStep: result.user,
                        numStep: result.user.rank
                    }, () => {
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
                    _this.initDataStep = _this.initDataStep.concat(arr);
                    _this.setState({
                        dataSourceStep: _this.state.dataSourceStep.cloneWithRows(_this.initDataStep),
                        isLoadingLeftStep: isLoading,
                        refreshingStep: false
                    }, () => {
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        this.setState({
            userId
        })
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
        Bridge.setShareAble("false");
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        this.setState({
            userId
        })
        this.getWatch2gsByGuardianUserId(userId)
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', this.onWindowResize)
        this.watchListener();
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
                                studentId: value.studentId
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
                                                if (calm.state.flag == 1) {
                                                    calm.getStudentAnswerRightCountTop(calm.state.studentId, start, end);
                                                } else {
                                                    calm.getStudentAnswerRightCountTop(calm.state.studentId, weekStart, end);
                                                }
                                                if (this.state.flagLove == 1) {
                                                    this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, start, end);
                                                } else {
                                                    this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, weekStart, end);

                                                }
                                                if (this.state.flagStep == 1) {
                                                    this.getWatch2gSportStepTopByStudentId(this.state.studentId, start, end);
                                                } else {
                                                    this.getWatch2gSportStepTopByStudentId(this.state.studentId, weekStart, end);

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
                            watchId: result.response[0].id,
                            macAddr: result.response[0].macAddress,
                        }, () => {
                            this.getStudentAnswerRightCountTop(this.state.studentId, start, end);
                            this.WatchList(this.state.watchData)
                        })
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
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
        if (this.state.freshFlag == false) {
            _this.initData.splice(0);
            _this.state.dataSource = [];
            _this.state.dataSource = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
        }
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
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' && result.success == true) {
                    this.setState({
                        ownData: result.user,
                        num: result.user.rank
                    }, () => {
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
                } else {
                    Toast.fail(result.msg, 1, null, false);
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
        console.log("chufa")
        var _this = this;
        var currentPageNo = this.state.defaultPageNo;
        if (!this.state.isLoadingLeft && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        _this.setState({ isLoadingLeft: true, defaultPageNo: currentPageNo,freshFlag:true }, () => {
            if (_this.state.flag == 1) {
                _this.getStudentAnswerRightCountTop(_this.state.studentId, start, end);

            } else {
                _this.getStudentAnswerRightCountTop(_this.state.studentId, weekStart, end);
            }
        });
        _this.setState({
            dataSource: _this.state.dataSource.cloneWithRows(_this.initData),
            isLoadingLeft: true,
        });
    };

    /**
    *  ListView数据全部渲染完毕的回调
    */
    onEndReachedLove = (event) => {
        console.log("chufa")
        var _this = this;
        var currentPageNo = this.state.defaultPageNoLove;
        if (!this.state.isLoadingLeftLove && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        this.setState({ isLoadingLeftLove: true, defaultPageNoLove: currentPageNo ,freshFlagLove:true}, () => {
            if (this.state.flag == 1) {
                _this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, start, end);

            } else {
                _this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, weekStart, end);
            }
        });
        this.setState({
            dataSourceLove: this.state.dataSourceLove.cloneWithRows(this.initDataLove),
            isLoadingLeftLove: true,
        });
    };

    /**
    *  ListView数据全部渲染完毕的回调
    */
    onEndReachedStep = (event) => {
        console.log("chufa")
        var _this = this;
        var currentPageNo = this.state.defaultPageNoStep;
        if (!this.state.isLoadingLeftStep && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        this.setState({ isLoadingLeftStep: true, defaultPageNoStep: currentPageNo ,freshFlagStep:true}, () => {
            if (this.state.flag == 1) {
                _this.getWatch2gSportStepTopByStudentId(this.state.studentId, start, end);

            } else {
                _this.getWatch2gSportStepTopByStudentId(this.state.studentId, weekStart, end);
            }
        });

        this.setState({
            dataSourceStep: this.state.dataSourceStep.cloneWithRows(this.initDataStep),
            isLoadingLeftStep: true,
        });
    };

    //今日
    clickToday = (flagType) => {
        if (flagType == "love") {
            $(".today").addClass("active")
            $(".week").removeClass("active")
            this.setState({
                flagLove: 1,
                flagStep: 1,
                flag: 1,
                freshFlagLove: false
            }, () => {
                this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, start, end);

            })

        } else if (flagType == "step") {
            $(".today").addClass("active")
            $(".week").removeClass("active")
            this.setState({
                flagLove: 1,
                flagStep: 1,
                flag: 1,
                freshFlagStep: false
            }, () => {
                this.getWatch2gSportStepTopByStudentId(this.state.studentId, start, end);

            })

        } else {
            $(".today").addClass("active")
            $(".week").removeClass("active")
            this.setState({
                flagLove: 1,
                flagStep: 1,
                flag: 1,
                freshFlag: false
            }, () => {
                this.getStudentAnswerRightCountTop(this.state.studentId, start, end);

            })
        }

    }
    //本周
    toClickWeek = (flagType) => {
        if (flagType == "love") {
            $(".week").addClass("active")
            $(".today").removeClass("active")
            this.setState({
                flagLove: 0,
                flagStep: 0,
                flag: 0,
                freshFlagLove: false
            }, () => {
                this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, weekStart, end);
            })

        } else if (flagType == "step") {
            $(".week").addClass("active")
            $(".today").removeClass("active")
            this.setState({
                flagLove: 0,
                flagStep: 0,
                flag: 0,
                freshFlagStep: false
            }, () => {
                this.getWatch2gSportStepTopByStudentId(this.state.studentId, weekStart, end);

            })

        } else {
            $(".week").addClass("active")
            $(".today").removeClass("active")
            this.setState({
                flagLove: 0,
                flagStep: 0,
                flag: 0,
                freshFlag: false
            }, () => {
                this.getStudentAnswerRightCountTop(this.state.studentId, weekStart, end);

            })
        }

    }

    //toDetail
    toDetail = (tagType) => {
        if (tagType == "love") {
            var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.studentId + "&flag=" + this.state.flagLove + "&tagType=" + tagType + "&num=" + this.state.numLove;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else if (tagType == "step") {
            var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.studentId + "&flag=" + this.state.flagStep + "&tagType=" + tagType + "&num=" + this.state.numStep;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
            var url = WebServiceUtil.mobileServiceURL + "detailPage?userid=" + this.state.studentId + "&flag=" + this.state.flag + "&tagType=" + tagType + "&num=" + this.state.num;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
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

    //tabs 改变
    onTabsChange = (v) => {
        if (v.title == "运动") {
            this.setState({
                tabs: [
                    { title: '答题' },
                    { title: '运动排行榜' },
                    { title: '爱心' },
                ],
                iniTab: 1
            }, () => {
                if (this.state.flagStep == 1) {
                    this.getWatch2gSportStepTopByStudentId(this.state.studentId, start, end);
                } else {
                    this.getWatch2gSportStepTopByStudentId(this.state.studentId, weekStart, end);

                }
            })
        } else if (v.title == "爱心") {
            this.setState({
                tabs: [
                    { title: '答题' },
                    { title: '运动' },
                    { title: '爱心排行榜' },
                ],
                iniTab: 2
            }, () => {
                if (this.state.flagLove == 1) {
                    this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, start, end);
                } else {
                    this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, weekStart, end);

                }
            })
        } else if (v.title == "答题") {
            this.setState({
                tabs: [
                    { title: '答题排行榜' },
                    { title: '运动' },
                    { title: '爱心' },
                ],
                iniTab: 0
            }, () => {
                if (this.state.flag == 1) {
                    this.getStudentAnswerRightCountTop(this.state.studentId, start, end);
                } else {
                    this.getStudentAnswerRightCountTop(this.state.studentId, weekStart, end);

                }
            })
        }


    }

    //选择
    onSelect = (opt) => {
        this.state.watchData.forEach((v, i) => {
            if (v.id == opt.props.macId) {
                this.setState({
                    guardians: v.guardians,
                    studentId: v.studentId
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
                                    if (this.state.flag == 1) {
                                        this.getStudentAnswerRightCountTop(this.state.studentId, start, end);
                                    } else {
                                        this.getStudentAnswerRightCountTop(this.state.studentId, weekStart, end);

                                    }
                                    if (this.state.flagLove == 1) {
                                        this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, start, end);
                                    } else {
                                        this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, weekStart, end);

                                    }
                                    if (this.state.flagStep == 1) {
                                        this.getWatch2gSportStepTopByStudentId(this.state.studentId, start, end);
                                    } else {
                                        this.getWatch2gSportStepTopByStudentId(this.state.studentId, weekStart, end);

                                    }
                                });
                            })
                        }
                    })
                })
            }
        })

    };


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

    //气泡
    handleVisibleChange = (visible) => {
        this.setState({
            visible,
        });
    };

    render () {
        const row = (rowData, sectionID, rowID) => {
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
        const rowLove = (rowData, sectionID, rowID) => {
            return (
                <div className='item'>
                    <div className='imgDiv' style={{ display: rowID < 3 ? "block" : "none" }}>
                        <img src={rowData.user.avatar} />
                    </div>
                    <div className="line_public itemCont my_flex">
                        <div className='num' style={{ display: rowID < 3 ? "none" : "block" }}>第{Number(rowID) + 1}名</div>
                        <div className='userName text_hidden'>{rowData.user.userName}</div>
                        <span className='color_9 text_hidden'>{rowData.rank}颗</span>
                    </div>
                </div>
            );
        };
        const rowStep = (rowData, sectionID, rowID) => {
            return (
                <div className='item'>
                    <div className='imgDiv' style={{ display: rowID < 3 ? "block" : "none" }}>
                        <img src={rowData.user.avatar} />
                    </div>
                    <div className="line_public itemCont my_flex">
                        <div className='num' style={{ display: rowID < 3 ? "none" : "block" }}>第{Number(rowID) + 1}名</div>
                        <div className='userName text_hidden'>{rowData.user.userName}</div>
                        <span className='color_9 text_hidden'>{rowData.rank}步</span>
                    </div>
                </div>
            );
        };
        return (
            <div id='rankingList' className='bg_gray'>
                <div className="am-navbar-blue" style={{ display: this.state.toBind || ((this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2)) ? "block" : "none" }}>
                    <NavBar
                        mode="light"
                    >排行榜</NavBar>
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
                            padding: '15px 15px 0 15px'
                        }}
                        >
                            <span className='watchName text_hidden'>{this.state.watchName}</span> <i className="icon-back"></i>
                        </div>
                    </Popover>
                </div>
                <div className="commonLocation-cont" style={{ display: !this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "block" }}>
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
                {/*绑定后未验证空页面*/}
                <div className="commonLocation-cont" style={{ display: calm.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) == false ? "none" : "block" }}>
                    <div className="emptyCont emptyContBind">
                        <div className="p38 my_flex">
                            <div>
                                <i></i>
                                <span>
                                    申请已提交<br />
                                    请等待管理员（{this.state.guardianData.familyRelate}）验证通过
                                    </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: this.state.toBind || (this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2) ? "none" : "block", height: "100%" }}>
                    <Tabs tabs={this.state.tabs}
                        onChange={this.onTabsChange}
                        initialPage={this.state.iniTab}
                        swipeable={false}
                    >
                        <div className='questionCont'>
                            <PullToRefresh
                                damping={130}
                                ref={el => this.ptr = el}
                                style={{
                                    height: this.state.clientHeight - 114,
                                    display: this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block"
                                }}
                                indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
                                direction='down'
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true, freshFlag: false });
                                    setTimeout(() => {
                                        this.setState({ refreshing: false }, () => {
                                            if (this.state.flag == 1) {
                                                this.getStudentAnswerRightCountTop(this.state.studentId, start, end);

                                            } else {
                                                this.getStudentAnswerRightCountTop(this.state.studentId, weekStart, end);
                                            }
                                        });
                                    }, 1000);
                                }}
                            >
                                <ListView
                                    ref={el => this.lv = el}
                                    dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                                    renderHeader={() => (
                                        <div className='dateBtn'>
                                            <span className='today active' onClick={this.clickToday.bind(this, "")}>今日</span>
                                            <span className="week" onClick={this.toClickWeek.bind(this, "")}>本周</span>
                                        </div>
                                    )}
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
                                        height: this.state.clientHeight - 50 - 64,
                                    }}
                                />
                            </PullToRefresh>
                            <div className='myGrade' style={{ display: this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block" }} onClick={this.toDetail.bind(this, "answer")}>
                                <div className='inner my_flex'>
                                    <span className='num'>第{Number(this.state.num)}名</span>
                                    <span className='userName text_hidden'>{this.state.ownData.user ? this.state.ownData.user.userName : ""}</span>
                                    <span className='questionNum'>答对{this.state.ownData.count ? this.state.ownData.count : "0"}道题</span>
                                </div>
                            </div>
                        </div>

                        <div className='questionCont' style={{ height: document.body.clientHeight - 64 }}>
                            <PullToRefresh
                                damping={130}
                                ref={el => this.ptr = el}
                                style={{
                                    height: this.state.clientHeight - 114,
                                    display: this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block"
                                }}
                                indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
                                direction='down'
                                refreshing={this.state.refreshingStep}
                                onRefresh={() => {
                                    this.setState({ refreshingStep: true, freshFlagStep: false });
                                    setTimeout(() => {
                                        this.setState({ refreshingStep: false }, () => {
                                            if (this.state.flagStep == 1) {
                                                this.getWatch2gSportStepTopByStudentId(this.state.studentId, start, end);

                                            } else {
                                                this.getWatch2gSportStepTopByStudentId(this.state.studentId, weekStart, end);
                                            }
                                        });
                                    }, 1000);
                                }}
                            >
                                <ListView
                                    ref={el => this.lv = el}
                                    dataSource={this.state.dataSourceStep}    //数据类型是 ListViewDataSource
                                    renderHeader={() => (
                                        <div className='dateBtn'>
                                            <span className='today active' onClick={this.clickToday.bind(this, "step")}>今日</span>
                                            <span className="week" onClick={this.toClickWeek.bind(this, "step")}>本周</span>
                                        </div>
                                    )}
                                    renderFooter={() => (
                                        <div style={{ paddingTop: 6, textAlign: 'center' }}>
                                            {this.state.isLoadingLeftStep ? '正在加载' : '已经全部加载完毕'}
                                        </div>)}
                                    renderRow={rowStep}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                                    className="am-list"
                                    pageSize={30}    //每次事件循环（每帧）渲染的行数
                                    //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                                    scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                                    onEndReached={this.onEndReachedStep}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                                    onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                                    initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                                    scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                                    style={{
                                        height: this.state.clientHeight - 50 - 64,
                                    }}
                                />
                            </PullToRefresh>
                            <div className='myGrade' style={{ display: this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block" }} onClick={this.toDetail.bind(this, "step")}>
                                <div className='inner my_flex'>
                                    <span className='num'>第{Number(this.state.numStep)}名</span>
                                    <span className='userName text_hidden'>{this.state.ownDataStep ? this.state.ownDataStep.user.userName : ""}</span>
                                    <span className='questionNum'>{this.state.ownDataStep ? this.state.ownDataStep.count : "0"}步</span>
                                </div>
                            </div>
                        </div>
                        <div className='questionCont' style={{ height: document.body.clientHeight - 64 }}>
                            <PullToRefresh
                                damping={130}
                                ref={el => this.ptr = el}
                                style={{
                                    height: this.state.clientHeight - 114,
                                    display: this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block"
                                }}
                                indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
                                direction='down'
                                refreshing={this.state.refreshingLove}
                                onRefresh={() => {
                                    this.setState({ refreshingLove: true, freshFlagLove: false });
                                    setTimeout(() => {
                                        this.setState({ refreshingLove: false }, () => {
                                            if (this.state.flagLove == 1) {
                                                this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, start, end);

                                            } else {
                                                this.getWatch2gLoveCountRankingByStudentId(this.state.studentId, weekStart, end);
                                            }
                                        });
                                    }, 1000);
                                }}
                            >
                                <ListView
                                    ref={el => this.lv = el}
                                    dataSource={this.state.dataSourceLove}    //数据类型是 ListViewDataSource
                                    renderHeader={() => (
                                        <div className='dateBtn'>
                                            <span className='today active' onClick={this.clickToday.bind(this, "love")}>今日</span>
                                            <span className="week" onClick={this.toClickWeek.bind(this, "love")}>本周</span>
                                        </div>
                                    )}
                                    renderFooter={() => (
                                        <div style={{ paddingTop: 6, textAlign: 'center' }}>
                                            {this.state.isLoadingLeftLove ? '正在加载' : '已经全部加载完毕'}
                                        </div>)}
                                    renderRow={rowLove}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                                    className="am-list"
                                    pageSize={30}    //每次事件循环（每帧）渲染的行数
                                    //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                                    scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                                    onEndReached={this.onEndReachedLove}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                                    onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                                    initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                                    scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                                    style={{
                                        height: this.state.clientHeight - 50 - 64,
                                    }}
                                />
                            </PullToRefresh>
                            <div className='myGrade' style={{ display: this.state.guardianData.valid == 2 && this.state.guardianData.bindType == 2 ? "none" : "block" }} onClick={this.toDetail.bind(this, "love")}>
                                <div className='inner my_flex'>
                                    <span className='num'>第{Number(this.state.numLove)}名</span>
                                    <span className='userName text_hidden'>{this.state.ownDataLove ? this.state.ownDataLove.user.userName : ""}</span>
                                    <span className='questionNum'>{this.state.ownDataLove ? this.state.ownDataLove.count : "0"}颗</span>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        )
    }
}