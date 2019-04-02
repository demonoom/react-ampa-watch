import React from "react";
import { Toast, ListView, Tabs, Modal, InputItem } from "antd-mobile";
import '../css/teHomework.less'
var calm;
const alert = Modal.alert;
const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});
export default class teHomework extends React.Component {
    constructor(props) {
        super(props);
        this.initData = [];
        calm = this;
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            isLoadingLeft: true,
            sendValue: "",
            content: "",
            showSend: false,
            hidePage: false
        };
    }

    componentWillMount () {

    }

    componentDidMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        this.setState({
            userId
        })
        this.getWatch2gsByGuardianUserId(userId);

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
                            toBind: true,
                        })
                    } else {
                        this.setState({
                            studentId: result.response[0].student.colUid
                        }, () => {
                            this.requestData(this.state.studentId);
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

    //请求作业数据
    requestData = (userId) => {
        var _this = this;
        var param = {
            "method": 'getTopicsByNotifyType',
            "notifyType": '8',
            "ident": userId,
            "pageNo": this.state.defaultPageNo
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    if (result.response.length == 0) {
                        this.setState({
                            hidePage: true
                        })
                    } else {
                        this.setState({
                            hidePage: false
                        })
                    }
                    var arr = result.response;
                    var pager = result.pager;
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
                Toast.info('请求失败');
            }
        });
    }

    loadMore = () => {
        var _this = this;
        var currentPageNo = this.state.defaultPageNo;
        if (!this.state.isLoadingLeft && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        this.setState({ isLoadingLeft: true, defaultPageNo: currentPageNo });
        this.requestData(this.state.userId);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.initData),
            isLoadingLeft: true,
        });
    }
    /*获取单个topic*/
    getTopicByIdRequest = (topid, index) => {
        var param = {
            "method": 'getTopicById',
            "topicId": topid
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    this.initData[index] = result.response;
                    this.setState({
                        dataSource: dataSource.cloneWithRows(this.initData),
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    /*点赞*/
    toClick = (topicId, index) => {
        var param = {
            "method": 'praiseForTopic',
            "topicId": topicId,
            "ident": this.state.userId
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    this.getTopicByIdRequest(topicId, index)
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    /*取消点赞*/
    cancelPraiseForTopicById = (topicId, index) => {
        var param = {
            "method": 'cancelPraiseForTopic',
            "topicId": topicId,
            "ident": this.state.userId
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    this.getTopicByIdRequest(topicId, index)
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //删除页面
    toShanchu = (v, index) => {
        this.setState({
            showSend: false
        })
        if (v.user.colUid == this.state.userId) {
            this.showAlert(v.id, v.topicId, index)
        } else {
            this.setState({
                toUserId: v.user.colUid,
                topicId: v.topicId,
                index,
                showSend: true
            }, () => {
                this.handleClick();
            })
        }
    }
    /**
    * 删除弹出框
    */
    showAlert = (comId, topicId, index) => {
        // event.stopPropagation();
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定要删除该评论吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => this.todelete(comId, topicId, index) },
        ], phone);
    };

    //todelete
    todelete = (comId, topicId, index) => {
        var param = {
            "method": 'deleteTopicComment',
            "topicCommentId": comId,
            "ident": this.state.userId
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info("删除成功", 1, null, false);
                    this.getTopicByIdRequest(topicId, index);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //评论
    toPinglun = (data, index) => {
        this.setState({
            topicId: data.id,
            toUserId: data.fromUserId,
            index,
            showSend: true
        }, () => {
            this.handleClick();
        })
    }

    //输入内容的变化
    contentChange = (value) => {
        this.setState({
            content: value,
        });
    }
    //发送
    toSendContent = (index) => {
        if (this.state.content == "") {
            Toast.info("评论内容不能为空", 1, null, false);
            return
        }
        this.setState({
            sendValue: this.state.content
        }, () => {
            var param = {
                "method": 'addTopicCommentAndResponse2',
                "content": this.state.sendValue,
                "topicId": this.state.topicId,
                "toUserId": this.state.toUserId,
                "ident": this.state.userId
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    if (result.success) {
                        this.setState({
                            showSend: false,
                            content: ""
                        })
                        this.getTopicByIdRequest(this.state.topicId, this.state.index);
                    } else {
                        Toast.fail(result.msg, 1, null, false);
                    }

                },
                onError: function (error) {
                    Toast.info('请求失败');
                }
            });
        })
    }
    //聚焦
    handleClick = () => {
        this.inputRef.focus();
    }


    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }
    render () {
        const row = (rowData, sectionID, rowID) => {
            var arr = [];
            var zanArr = [];
            var pingArr = [];
            var isZan = false;
            rowData.comments.forEach((v, i) => {
                arr.push(v.type)
                if (v.type == 1) {
                    zanArr.push(v)
                }
                if (v.type == 0) {
                    pingArr.push(v)
                }
            })
            zanArr.forEach((v, i) => {
                if (v.user.colUid == this.state.userId) {
                    isZan = true;
                }
            })
            return (
                <div className='line_public homeItem' >
                    <img src={rowData.fromUser.avatar} onClick={() => {
                        this.setState({
                            showSend: false
                        })
                    }} />
                    <span className='text_hidden userName' onClick={() => {
                        this.setState({
                            showSend: false
                        })
                    }}>{rowData.fromUser.userName}</span>
                    <div className='time' onClick={() => {
                        this.setState({
                            showSend: false
                        })
                    }}> {WebServiceUtil.formatMDHM(rowData.createTime)}</div>
                    <div className='content' onClick={() => {
                        this.setState({
                            showSend: false
                        })
                    }}>{rowData.content}</div>
                    <div className='icon_praise'>
                        {
                            isZan ?
                                <span className='liked' onClick={this.cancelPraiseForTopicById.bind(this, rowData.id, rowID)}>取消</span> :
                                <span className='like' onClick={this.toClick.bind(this, rowData.id, rowID)}>点赞</span>
                        }
                        <span className='comment' onClick={this.toPinglun.bind(this, rowData, rowID)}>评论</span>
                    </div>
                    <div className='replyCont' style={{ display: zanArr.length == 0 && pingArr.length == 0 ? "none" : "block" }}>
                        <div className='icon_arrowUp'></div>
                        <div className='icon_emptyHeartB' style={{ display: zanArr.length == 0 ? "none" : "block" }}>
                            {
                                zanArr.map((v, i) => {
                                    return (
                                        <span onClick={() => {
                                            this.setState({
                                                showSend: false
                                            })
                                        }}>{v.user.userName}{i == zanArr.length - 1 ? "" : ","}</span>
                                    )
                                })
                            }
                        </div>

                        <div className={zanArr.length == 0 ? '' : 'line_publicBefore'} style={{ display: pingArr.length == 0 ? "none" : "block" }}>
                            {
                                pingArr.map((v, i) => {
                                    return (
                                        <div className="msgItem" onClick={this.toShanchu.bind(this, v, rowID)}>
                                            {
                                                v.user.userName == v.toUser.userName ?
                                                    <span>
                                                        <span className='blueTxt'>{v.user.userName}</span>：<span>{v.content}</span>
                                                    </span>
                                                    :
                                                    <span>
                                                        <span>
                                                            <span className='blueTxt'>{v.user.userName}</span>
                                                            <span>回复</span>
                                                            <span className='blueTxt'>{v.toUser ? v.toUser.userName : ""}</span>：
                                                            <span>{v.content}</span>
                                                        </span>
                                                    </span>

                                            }

                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                </div>
            );
        };
        return (
            <div id='teHomework' className='bg_gray' style={{ height: this.state.clientHeight }}>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">教师作业</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont"  style={{ display: this.state.hidePage ? "block" : "none" }}>
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
                {/*绑定后空页面*/}
                <div className="commonLocation-cont">
                    <div className="emptyCont emptyContBind">
                        <div className="p38 my_flex">
                            <div>
                                <i></i>
                                <span>
                                   暂无数据
                                    </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="commonLocation-cont" style={{ display: this.state.hidePage ? "none" : "block" }}>
                    <div style={{ display: this.state.showSend ? "flex" : "none" }} className='commentInput my_flex'>
                        <InputItem
                            className="content"
                            value={this.state.content}
                            onChange={this.contentChange}
                            placeholder="请输入评论内容"
                            ref={el => this.inputRef = el}
                        ></InputItem>
                        <div className='sendBtn' onClick={this.toSendContent}>发送</div>
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
                        onEndReached={this.loadMore}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                        onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                        initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                        scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                        style={{
                            height: this.state.clientHeight - 64,
                        }}
                    />
                </div>
            </div>
        )
    }
}










