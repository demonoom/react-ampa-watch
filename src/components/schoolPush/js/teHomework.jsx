import React from "react";
import { Toast, ListView, Tabs, Modal, InputItem } from "antd-mobile";

const alert = Modal.alert;
const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});
export default class teHomework extends React.Component {
    constructor(props) {
        super(props);

        this.initData = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            isLoadingLeft: true,
            sendValue: "",
            content: ""
        };
    }

    componentWillMount () {

    }

    componentDidMount () {
        var userId = 23836;
        this.setState({
            userId
        })
        this.requestData(userId);
    }


    requestData = (userId) => {
        var _this = this;
        var param = {
            "method": 'getTopicsByNotifyType',
            "notifyType": '8',
            "ident": userId,
            "pageNo": this.state.defaultPageNo
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
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

                    console.log(arr, 'yyyy');

                    _this.initData = _this.initData.concat(arr);
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData),
                        isLoadingLeft: isLoading,
                        refreshing: false
                    })




                } else {
                    Toast.info(result);
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
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.success) {
                    this.initData[index] = result.response;
                    this.setState({
                        dataSource: dataSource.cloneWithRows(this.initData),
                    })
                } else {
                    Toast.info(result);
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
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    this.getTopicByIdRequest(topicId, index)
                } else {
                    Toast.info(result);
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
            "ident":  this.state.userId
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.success) {
                    this.getTopicByIdRequest(topicId, index)
                } else {
                    Toast.info(result);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //删除页面
    toShanchu = (v, index) => {
        if (v.user.colUid == this.state.userId) {
            this.showAlert(v.id, v.topicId, index)
        } else {
            this.setState({
                toUserId: v.user.colUid,
                topicId: v.topicId,
                index
            }, () => {
                $(".am-input-control input").focus();
                this.toSendContent(this.state.index);
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
        console.log(topicId, "topicId")
        console.log(index, "index")
        var param = {
            "method": 'deleteTopicComment',
            "topicCommentId": comId,
            "ident":  this.state.userId
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info("删除成功", 1);
                    this.getTopicByIdRequest(topicId, index)
                } else {
                    Toast.info(result);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    //评论
    toPinglun = (data, index) => {
        console.log(data, "data")
        $(".am-input-control input").focus();
        this.setState({
            topicId: data.id,
            toUserId: data.fromUserId,
            index
        })
    }

    //输入内容的变化
    contentChange = (value) => {
        console.log(value, "opop")
        this.setState({
            content: value,
        });
    }
    //发送
    toSendContent = (index) => {
        this.setState({
            sendValue: this.state.content
        }, () => {
            var param = {
                "method": 'addTopicCommentAndResponse2',
                "content": this.state.sendValue,
                "topicId": this.state.topicId,
                "toUserId": this.state.toUserId,
                "ident":  this.state.userId
            };
            console.log(param, "param")
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    console.log(result, "result")
                    if (result.success) {
                        this.getTopicByIdRequest(this.state.topicId, this.state.index)
                    } else {
                        Toast.info(result);
                    }

                },
                onError: function (error) {
                    Toast.info('请求失败');
                }
            });
        })
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
                <div>
                    <img src={rowData.fromUser.avatar} />
                    <span>{rowData.fromUser.userName}</span>
                    <div> {WebServiceUtil.formatMDHM(rowData.createTime)}</div>
                    <div>{rowData.content}</div>
                    <div>
                        {
                            isZan ?
                                <span onClick={this.cancelPraiseForTopicById.bind(this, rowData.id, rowID)}>已点赞</span> :
                                <span onClick={this.toClick.bind(this, rowData.id, rowID)}>未点赞</span>
                        }
                        <span onClick={this.toPinglun.bind(this, rowData, rowID)}>评论</span>
                    </div>
                    <div>
                        {
                            zanArr.map((v, i) => {
                                return (
                                    <div>
                                        <span>{v.user.userName}点赞</span>
                                    </div>
                                )
                            })
                        }
                        {
                            pingArr.map((v, i) => {
                                return (
                                    <div className="ppp" onClick={this.toShanchu.bind(this, v, rowID)}>
                                        <span>{v.user.userName}</span>
                                        <span>回复</span>
                                        <span>{v.toUser ? v.toUser.userName : ""}:</span>
                                        <span>{v.content}</span>
                                    </div>
                                )
                            })
                        }
                    </div>

                </div>
            );
        };
        return (
            <div>
                <div>
                    <InputItem
                        className="content"
                        value={this.state.content}
                        onChange={this.contentChange}
                        placeholder="请输入评论内容"
                    ></InputItem>
                    <div onClick={this.toSendContent}>发送</div>
                </div>
                <ListView
                    ref={el => this.lv = el}
                    dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                    renderFooter={() => (
                        <div style={{ paddingTop: 5, paddingBottom: 40, textAlign: 'center' }}>
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
                        height: this.state.clientHeight,
                    }}
                />

            </div>
        )
    }
}










