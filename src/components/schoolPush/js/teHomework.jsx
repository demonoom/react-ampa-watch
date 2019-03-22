import React from "react";
import { Toast, ListView, Tabs, Modal, InputItem } from "antd-mobile";

const alert = Modal.alert;
export default class teHomework extends React.Component {
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
            sendValue: ""
        };
    }

    componentWillMount () {

    }

    componentDidMount () {
        var userId = 41;
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
    getTopicByIdRequest = (topid) => {
        var param = {
            "method": 'getTopicById',
            "topicId": topid
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {

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
    toClick = (topicId) => {
        var param = {
            "method": 'praiseForTopic',
            "topicId": topicId,
            "ident": '41'
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    this.initData = [];
                    this.requestData(this.state.userId);
                    this.setState({
                        dataSource: dataSource.cloneWithRows(this.initData),
                    }, () => {
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

    /*取消点赞*/
    cancelPraiseForTopicById = (topicId) => {
        var param = {
            "method": 'cancelPraiseForTopic',
            "topicId": topicId,
            "ident": "41"
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.success) {
                    this.initData = [];
                    this.requestData(this.state.userId);
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

    toShanchu = (userId,comId)=>{
        console.log(userId,"userId")
        if(userId == 41){
            this.showAlert(comId)
        }else {
            console.log('ppp')
        }
    }
    /**
    * 删除弹出框
    */
    showAlert = (comId) => {
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
            { text: '确定', onPress: () => this.todelete(comId) },
        ], phone);
    };

    //todelete
    todelete = (comId) => {
        var param = {
            "method": 'deleteTopicComment',
            "topicCommentId": comId,
            "ident": 41
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    Toast.info("删除成功", 1);
                    this.initData = [];
                    this.requestData(this.state.userId);
                    this.setState({
                        dataSource: dataSource.cloneWithRows(this.initData),
                    }, () => {
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
    //评论
    toPinglun = (topicId, toUserId, comId) => {
        $(".am-input-control input").focus();
        this.setState({
            topicId,
            toUserId
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
    toSendContent = () => {
        this.setState({
            sendValue: this.state.content
        }, () => {
            var param = {
                "method": 'addTopicCommentAndResponse2',
                "content": this.state.sendValue,
                "topicId": this.state.topicId,
                "toUserId": this.state.toUserId,
                "ident": 41
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: (result) => {
                    console.log(result, "result")
                    if (result.success) {
                        this.requestData(this.state.userId);
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
            console.log(rowData, "rowData")
            var arr = [];
            rowData.comments.forEach((v, i) => {
                arr.push(v.type)
            })
            console.log(arr, "arr333")

            return (
                <div>
                    <img src={rowData.fromUser.avatar} />
                    <span>{rowData.fromUser.userName}</span>
                    <div> {WebServiceUtil.formatMDHM(rowData.createTime)}</div>
                    <div>{rowData.content}</div>
                    {rowData.comments.length == 0 ?
                        <div>
                            <span onClick={this.toClick.bind(this, rowData.id)}>未点赞</span>
                            <span onClick={this.toPinglun.bind(this, rowData.id, rowData.fromUser.colUid, "")}>评论</span>
                        </div>
                        :
                        <div>
                            {
                                arr.indexOf(1) > -1 ?
                                    ""
                                    :
                                    <div>
                                        <span onClick={this.toClick.bind(this, rowData.id)}>未点赞</span>
                                        <span onClick={this.toPinglun.bind(this, rowData.id, rowData.fromUser.colUid, "")}>评论</span>
                                    </div>
                            }
                            {
                                rowData.comments.map(
                                    (v, i) => {
                                        console.log(v, "opopop")
                                        return (
                                            <div>
                                                {
                                                    v.user.colUid == 41 && v.type == 1 ?
                                                        <div>
                                                            <span onClick={this.cancelPraiseForTopicById.bind(this, v.topicId)}>自己已点赞</span>
                                                            <div onClick={this.toPinglun.bind(this, v.topicId, rowData.fromUser.colUid, v.id)}>评论</div>
                                                        </div>
                                                        :
                                                        v.user.colUid != 41 && v.type == 1 ?
                                                            <div>
                                                                <span onClick={this.toClick.bind(this, rowData.id)}>自己未点赞</span>
                                                                <div onClick={this.toPinglun.bind(this, v.topicId, rowData.fromUser.colUid, v.id)}>评论</div>
                                                                <p>---------------别人点赞内容---------------------</p>
                                                                <span>{v.user.userName}<span>已点赞</span></span>
                                                            </div>
                                                            :
                                                            v.type == 0 ?
                                                                <div className="ppp" onClick={this.toShanchu.bind(this,v.user.colUid,v.id)}>
                                                                    <p>---------------评论内容---------------------</p>
                                                                    <span>{v.user.userName}</span>
                                                                    <span>回复</span>
                                                                    <span>{v.toUser ? v.toUser.userName : ""}:</span>
                                                                    <span>{v.content}</span>
                                                                </div>
                                                                :
                                                                ""

                                                }
                                            </div>


                                        )
                                    })
                            }
                        </div>

                    }

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
                    <span onClick={this.toSendContent}>发送</span>
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










