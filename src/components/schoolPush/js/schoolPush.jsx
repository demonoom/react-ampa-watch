import React from "react";
import { Toast, ListView, Tabs, Modal } from "antd-mobile";

const alert = Modal.alert;
const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});
export default class schoolPush extends React.Component {
    constructor(props) {
        super(props);

        this.initData = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            isLoadingLeft: true,
            userId: 0,
            hidePage: false
        };
    }
    componentWillMount () {

    }

    componentDidMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        this.setState({
            userId,phone
        })
        this.requestData(userId)
    }


    //请求数据
    requestData = (userId) => {
        var _this = this;
        var param = {
            "method": 'getTopicsByNotifyType',
            "notifyType": '9',
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



    formatUnixtimestamp = (inputTime) => {
        var date = new Date(inputTime);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    //加载更多
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
    praiseForTopicById = (topicId, index) => {
        var param = {
            "method": 'praiseForTopic',
            "topicId": topicId,
            "ident": this.state.userId
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
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



    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
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

    render () {
        const row = (rowData, sectionID, rowID) => {
            var time = this.formatUnixtimestamp(rowData.createTime);
            var zanArr = [];
            rowData.comments.forEach((v, i) => {
                if (v.type == 1) {
                    zanArr.push(v)
                }
            })
            var isZan = false;
            zanArr.forEach((v, i) => {
                if (v.user.colUid == this.state.userId) {
                    isZan = true;
                }
            });


            return (
                <div className='line_public homeItem'>
                    <img src={require('../../images/icon_notify.png')} />
                    <span className='text_hidden userName'> 校内通知 </span>
                    <div className='time'> {time}</div>
                    <div className='content'>{rowData.content}</div>
                    <div className='icon_praise'>
                        {
                            isZan ?
                                <span className='liked' onClick={this.cancelPraiseForTopicById.bind(this, rowData.id, rowID)}>取消</span> :
                                <span className='like' onClick={this.praiseForTopicById.bind(this, rowData.id, rowID)}>点赞</span>
                        }
                    </div>

                    {
                        zanArr.length > 0 ?
                            <div className='replyCont'>
                                <div className='icon_arrowUp'></div>
                                <div className='icon_emptyHeartB'>
                                    {
                                        zanArr.map((v, i) => {
                                            return (
                                                <span>{v.user.userName}{i == zanArr.length - 1 ? "" : ", "}</span>
                                            )
                                        })
                                    }
                                </div>
                            </div> : ''
                    }


                </div>
            );
        };
        return (
            <div id='teHomework' className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">校内通知</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div style={{ display: !this.state.toBind || this.state.hidePage ? "none" : "block" }}>
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
                <div style={{ display: this.state.hidePage ? "block" : "none" }}>
                    <div className="emptyCont emptyContNone">
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
                <div className="commonLocation-cont" style={{ display: this.state.toBind || this.state.hidePage ? "none" : "block" }}>
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
                            height: this.state.phone == "ios" ?  this.state.clientHeight - 64 : this.state.clientHeight - 44,
                        }}
                    />
                </div>
            </div>
        )
    }
}










