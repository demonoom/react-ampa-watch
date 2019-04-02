import React from 'react';
import {
    Toast, DatePicker, PullToRefresh, ListView, Button, List, Picker, Tag, Tabs, Carousel
} from 'antd-mobile';
import '../css/articleList.less';

var dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});

var AscrollView;
var BscrollView;
var that;

export default class articleList extends React.Component {
    constructor(props) {
        super(props);
        that = this;
        this.initDataSource = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initDataSource),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            isLoading: true,
            hasMore: true,
            index: 1,
            recommended_video: {
                response: []
            },
            refreshing: false,
            show_bottom_text: true,
            scrollFlag: false,
            initLoading: true,
            noomPullFlag: true,   //list是否滚动到最顶端
            defaultPageNoForCircle: 1,
            // 显示发布菜单
            showPubliFlag: false,
            carouselData: [],
            imgHeight: 176,
        }
    }

    componentDidMount() {
        AscrollView = $('.am-list-view-scrollview').eq(0);
        BscrollView = $('.am-list-view-scrollview').eq(1);
        var _this = this;
        Bridge.setShareAble("false");
        document.title = '文章列表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        var passward = searchArray[1].split('=')[1];
        this.setState({
            userId,
            passward
        }, () => {
            var p1 = new Promise((reslove, reject) => {
                this.getWatchArticleInfoListByStatusAndIsTop()
            });
            var p2 = new Promise((reslove, reject) => {
                this.getArticleRecommenLittleVideoList(false, () => {
                    reslove('getArticleRecommenLittleVideoList');
                });
            });
            var p3 = new Promise(() => {
                this.LittleAntLogin()
            });
            Promise.all([p2]).then((result) => {
                //
                this.setState({
                    initLoading: false,
                })
            })
        })

        $(document).on('scroll', '.am-list-view-scrollview', (e) => {
            if (e.target.scrollTop >= 200) {
                if (this.state.scrollFlag) {

                } else {
                    this.setState({
                        scrollFlag: true,
                    }, () => {

                    })
                }

            } else {
                if (this.state.scrollFlag) {
                    // Toast.info('关闭了显示',1)
                    this.setState({
                        scrollFlag: false,
                    })
                }

            }
        })
    }

    /**
     * 按页码获取短视频列表
     * **/
    getArticleRecommenLittleVideoList(clearFlag, reslove) {
        this.getArticleInfoListByType(clearFlag, reslove);
    }

    /**
     * 蚂蚁账户登录
     * public LittleVideoUser LittleAntLogin(String colAccount, String colPasswd)
     * @constructor
     */
    LittleAntLogin() {
        var _this = this;
        var param = {
            "method": 'LittleAntLogin',
            "colAccount": this.state.userId,
            "colPasswd": this.state.passward,
        };
        console.log(param);
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    _this.setState({
                        uid: result.response.uid,
                        userName: result.response.userName,
                        avatar: result.response.avatar
                    })
                }

            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    getWatchArticleInfoListByStatusAndIsTop() {
        var _this = this;
        var param = {
            "method": 'getWatchArticleInfoListByStatusAndIsTop',
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    _this.setState({carouselData: result.response})
                }

            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    /**
     * 按查询条件获取列表
     * **/
    getArticleInfoListByType(clearFlag, reslove) {
        var _this = this;
        var param = {
            "method": 'getWatchArticleInfoListByStatus',
            "pageNo": this.state.defaultPageNo,
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    this.state.rsCount = result.pager.rsCount;
                    // this.setState({
                    //    dex: parseInt(result.response.length / 2)
                    // })


                    if (clearFlag) {    //拉动刷新  获取数据之后再清除原有数据
                        _this.initDataSource.splice(0);
                        dataSource = [];
                        dataSource = new ListView.DataSource({
                            rowHasChanged: (row1, row2) => row1 !== row2,
                        });
                    }

                    var initLength = this.initDataSource.length;
                    this.initDataSource = this.initDataSource.concat(result.response);
                    if (this.state.recommended_video.response.length > 0 && result.response.length > 0) {
                        //往文章数组里面添加一组小视频数据
                        this.initDataSource.splice((result.response.length / 2) + initLength, 0, this.state.recommended_video);
                    } else {
                        this.state.recommended_video = {response: []}
                    }
                    // Toast.info('设置数据之前');
                    this.setState({
                        dataSource: dataSource.cloneWithRows(this.initDataSource),
                        isLoading: true,
                        refreshing: false,
                    }, () => {

                        if (reslove) {
                            reslove();
                        }
                    })
                    if ((this.initDataSource.length - (this.state.recommended_video.response.length == 0 ? 0 : 1)) >= result.pager.rsCount) {
                        this.setState({
                            hasMore: false,
                            isLoading: false
                        })
                    }
                }

            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    /**
     *  ListView数据全部渲染完毕的回调
     */
    onEndReached = (event) => {
        var _this = this;
        var currentPageNo = this.state.defaultPageNo;
        if (!this.state.isLoading && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        this.setState({
            isLoading: true,
            defaultPageNo: currentPageNo,
        }, () => {
            if (this.state.index == 2) {
                this.setState({
                    defaultPageNoForCircle: this.state.defaultPageNoForCircle + 1
                }, () => {

                })
            } else {
                this.getArticleRecommenLittleVideoList();
            }
        });
    };

    onRefresh = (str) => {
        var divPull = document.getElementsByClassName('am-pull-to-refresh-content');

        if (str == 'left') {
            divPull[0].style.transform = "translate3d(0px, 30px, 0px)";   //设置拉动后回到的位置
            // divPull[0].style.height = document.body.clientHeight
        } else if (str == 'right') {
            divPull[1].style.transform = "translate3d(0px, 30px, 0px)";   //设置拉动后回到的位置
            // divPull[1].style.height = document.body.clientHeight
        } else if (str == 'rightright') {
            //圈子的下拉刷新
            divPull[2].style.transform = "translate3d(0px, 30px, 0px)";   //设置拉动后回到的位置
            this.initDataSource = [];
            this.setState({
                defaultPageNoForCircle: 1, refreshing: true
            }, () => {

            });
            return;
        }
        this.setState({
            defaultPageNo: 1, refreshing: true
        }, () => {
            // this.getLittleVideoUserById();
            this.getArticleRecommenLittleVideoList(true);
            // Toast.info('重新绑定事件'+this.state.index);

        });


    };

    toDetail(id, articleTitle) {
        if (id) {
            let url = encodeURI(WebServiceUtil.mobileServiceURL + "articleDetail?vId=" + id + "&type=1&articleTitle=" + articleTitle + "&uid=" + this.state.uid + "&userName=" + this.state.userName + "&avatar=" + this.state.avatar);
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
            Toast.fail('id参数有误', 2);
        }
    }

    //播放视频
    toPlayVideo(videoIndex, recommended_video, recommended_pageCount, recommended_pageNo) {
        var data = {
            method: 'playArticleVideo',
            videos: recommended_video,
            position: videoIndex,
            pageNo: recommended_pageNo,
            pageCount: recommended_pageCount
        };
        Bridge.callHandler(data, null, function (error) {
            console.log('开启小视频失败')
        });
    }

    //计算时间差
    timeDifference(date) {
        var date1 = date;  //开始时间
        var date2 = new Date();    //结束时间
        var date3 = date2.getTime() - new Date(date1).getTime();   //时间差的毫秒数

        //------------------------------

        //计算出相差天数
        var days = Math.floor(date3 / (24 * 3600 * 1000))

        //计算出小时数

        var leave1 = date3 % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000))
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000))
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
        var seconds = Math.round(leave3 / 1000);

        if (days == 0) {
            if (days == 0 && hours == 0) {
                if (days == 0 && hours == 0 && minutes == 0) {
                    if (days == 0 && hours == 0 && minutes == 0 && seconds <= 30) {
                        return "刚刚"
                    } else {
                        return seconds + "秒前"
                    }
                } else {
                    return minutes + '分钟前';
                }
            } else {
                return hours + "小时前";
            }
        } else {
            return days + "天前"
        }
        // alert(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒")
    }

    toTop = () => {
        // if ($(".am-list-view-scrollview").scrollTop()) {
        // setTimeout(function(){
        //     document.getElementsByClassName("am-list-view-scrollview")[0].scrollTop = 0;
        // },1000)
        this.setState({
            scrollFlag: false,
        }, () => {
            $(".am-list-view-scrollview").animate({scrollTop: 0}, 1000);
        })
        // }
    }

    //跳转至朋友圈详情
    toThemeTaskDetail(cid, rowData) {
        var url = WebServiceUtil.mobileServiceURL + "themeTaskDetail?userId=" + this.state.userId + "&cfid=" + cid + "&type=" + rowData.type;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }


    playVideo(url, event) {
        event.stopPropagation();
        var data = {
            method: 'playChatVideo',
            playUrl: url
        };
        window.parent.Bridge.callHandler(data, function () {
        }, function (error) {
            Toast.info('開啓視頻失敗!');
        });
        // e.nativeEvent.stopImmediatePropagation();
    }

    toShare = (cid, userName, event, type) => {
        event.stopPropagation();
        var data = {
            method: 'shareWechat',
            shareUrl: WebServiceUtil.mobileServiceURL + "themeTaskDetail?userId=" + this.state.userId + "&cfid=" + cid + "&type=" + type,
            shareTitle: $('.list_content').text(),
            shareUserName: userName,
        };
        Bridge.callHandler(data, null, function (error) {
            Toast.info('分享文章失败')
        });
    }

    closeUserGuide = () => {
        this.setState({
            isDisPlay: 0
        })
    }

    carouselOnClick = (id, articleTitle) => {
        if (id) {
            let url = encodeURI(WebServiceUtil.mobileServiceURL + "articleDetail?vId=" + id + "&type=1&articleTitle=" + articleTitle + "&uid=" + this.state.uid + "&userName=" + this.state.userName + "&avatar=" + this.state.avatar);
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
            Toast.fail('id参数有误', 2);
        }
    }


    render() {
        var _this = this;
        const row = (rowData, sectionID, rowID) => {
            var tagClass = '';
            switch (rowData.mastery) {
                case 0:
                    tagClass = 'tag-WrongTopic-red';
                    break;
                case 1:
                    tagClass = 'tag-WrongTopic-yellow';
                    break;
                case 2:
                    tagClass = 'tag-WrongTopic-blue';
                    break;
                case 3:
                    tagClass = 'tag-WrongTopic-green';
                    break;
                default:
                    tagClass = '未匹配到';
                    break;
            }
            var dom = "";
            var time = this.timeDifference(rowData.createTime);
            if (this.state.index == 2) {
                var friendsAttachments = rowData.friendsAttachments;
                for (var i = 0; i < friendsAttachments.length; i++) {
                    if (friendsAttachments[i].fatherType == 1) {
                        friendsAttachments.splice(i, 1);
                    }
                }
                dom = <div className="circleList" onClick={this.toThemeTaskDetail.bind(this, rowData.cfid, rowData)}>
                    <div className="list_head">
                        <div className="headPic">
                            <img src={rowData.userInfo.avatar} alt=""/>
                        </div>
                        <div className="userName text_hidden">{rowData.userInfo.userName}</div>
                        <div className="createTime">{WebServiceUtil.formatYMD(rowData.createTime)}</div>

                    </div>
                    <div className="tags"><span
                        className={rowData.type ? "tag-ThemeTask" : "tag-WrongTopic " + tagClass}>{rowData.type ? '' : ''}</span>
                    </div>
                    <div className="list_content">{rowData.type == 1 ? rowData.content : rowData.mark}</div>
                    <div className="list_image" style={
                        friendsAttachments.length == 0 ? {display: 'none'} : {display: 'block'}
                    }>
                        {friendsAttachments.map((value, index) => {
                            if (value.type == 0) {
                                return <img style={
                                    friendsAttachments.length == 1 ? {width: '200', height: '113'} : {
                                        display: 'inline-block'
                                    }
                                }
                                            src={friendsAttachments.length > 1 ? value.path + '?size=300x300' : value.path + '?size=500x500'}
                                            alt=""/>
                            } else {
                                return <div className="video_tag" style={
                                    friendsAttachments.length == 1 ? {width: '200', height: '113'} : {
                                        display: 'inline-block'
                                    }
                                }>
                                    <video poster={value.coverPath} onClick={this.playVideo.bind(this, value.path)}
                                           style={{width: '100%', height: '100%'}} src={value.path} alt=""/>
                                    <div onClick={this.playVideo.bind(this, value.path)}
                                         className="video_tag_play"></div>
                                </div>
                            }

                        })}
                    </div>
                    <div className="list_bottom">
                        <div className="list_bottom_item"
                             onClick={this.toShare.bind(this, rowData.cfid, rowData.userInfo.userName, rowData.type)}><i
                            className="i-share"></i></div>
                        <div className="list_bottom_item"><i
                            className="i-comments"></i><span>{rowData.disContent}</span></div>
                        <div className="list_bottom_item"><i
                            className={rowData.currentUserIsLike ? "i-praise-active" : "i-praise"}></i><span>{rowData.likeCount}</span>
                        </div>
                    </div>
                </div>
            } else {
                var image = rowData.articleImgArray ? rowData.articleImgArray : [];
                if (rowData.response instanceof Array) {  //为自媒体推荐视频
                    var videoDom = [];
                    for (var i = 0; i < rowData.response.length; i++) {
                        videoDom.push(
                            <div className="video_row"
                                 onClick={this.toPlayVideo.bind(this, i, rowData.response, rowData.pager.pageCount, rowData.pager.pageNo)}>
                                <img className="video_firstImage"
                                     src={rowData.response[i].coverPath == '' ? rowData.response[i].firstUrl : rowData.response[i].coverPath}
                                     alt=""/>
                                <div className="gradient_bgT topText">
                                    <div className="video_content">{rowData.response[i].videoContent}</div>
                                </div>
                                <div className='gradient_bgB bottomText'>
                                    <div className="like">{rowData.response[i].likeCount}赞</div>
                                    <div className="read">{rowData.response[i].readCount}</div>
                                </div>

                            </div>
                        )
                    }
                    dom = <div className="video_box line_public">{videoDom}</div>;
                } else {
                    if (image.length == 1) {  //图片一张
                        dom = <div className="item line_public">
                            <div className="leftBox">
                                <div className="title minHeight">{rowData.articleTitle}</div>
                                <div className="bottom">
                                    <div className="read">{rowData.readCount}阅读</div>
                                    {/*<div className="like">{rowData.likeCount}点赞</div>*/}
                                    <div className="time">{time}</div>
                                </div>
                            </div>
                            <div className="rightBox" style={{backgroundImage: 'url(' + image[0] + ')'}}>
                                {/*<img src={image[0]} alt=""/>*/}
                            </div>
                        </div>
                    } else if (image.length > 1) {    //图片大于一张
                        var imageDom = [];
                        for (var i = 0; i < image.length; i++) {
                            imageDom.push(<div className='imageDiv'><span
                                style={{backgroundImage: 'url(' + image[i] + ')'}}
                                className="image3"
                            ></span></div>)
                        }
                        dom = <div className="item line_public">
                            <div className="title">{rowData.articleTitle}</div>
                            <div className="images">{imageDom}</div>
                            <div className="bottom">
                                <div className="read">{rowData.readCount}阅读</div>
                                {/*<div className="like">{rowData.likeCount}点赞</div>*/}
                                <div className="time">{time}</div>
                            </div>
                        </div>
                    } else {                //图片没有
                        var videoFlag = false;
                        if (videoFlag) { //有视频
                            dom = <div className="item line_public">
                                <div className="title">{rowData.articleTitle}</div>
                                <div className="images">
                                    <div className="videoBox">
                                        <div onClick={this.toDetail.bind(this, rowData.articleId, rowData.articleTitle)}
                                             className="videoMask"></div>
                                        <img onClick={this.toDetail.bind(this, rowData.articleId, rowData.articleTitle)}
                                             className="playImg"
                                             src={require('../images/videoClick.png')} alt=""/>
                                        <video src="http://www.w3school.com.cn/example/html5/mov_bbb.mp4"></video>
                                    </div>
                                </div>
                                <div className="bottom">
                                    <div className="read">{rowData.readCount}阅读</div>
                                    {/*<div className="like">{rowData.likeCount}点赞</div>*/}
                                    <div className="time">{time}</div>
                                </div>
                            </div>
                        } else {  //图片没有 视频也没有
                            dom = <div className="item line_public">
                                <div className="title">{rowData.articleTitle}</div>
                                <div className="bottom">
                                    <div className="read">{rowData.readCount}阅读</div>
                                    {/*<div className="like">{rowData.likeCount}点赞</div>*/}
                                    <div className="time">{time}</div>
                                </div>
                            </div>
                        }

                    }
                }
            }


            return (
                <div className={this.state.index == 2 ? 'list_item' : ''}
                     onClick={this.state.index == 2 ? '' : rowData.response instanceof Array ? '' : this.toDetail.bind(this, rowData.articleId, rowData.articleTitle)}>
                    {dom}
                </div>
            )
        };
        return (
            <div id="articleList" style={{height: document.body.clientHeight}}>
                <div style={{display: this.state.isDisPlay == 1 ? "block" : "none"}} className="UserGuide">
                    <img className="userguide1" src={require('../images/UserGuide1.png')} width='54'></img>
                    <img onClick={this.closeUserGuide} className="userguide2" width="110"
                         src={require('../images/UserGuide2.png')}></img>
                    <img className="userguide3" src={require('../images/UserGuide3.png')} width="270"></img>
                </div>

                {/*mask*/}

                <div>
                    <div className="initImage" style={
                        this.state.initLoading ? {display: 'block'} : {display: 'none'}
                    }>
                        <img src={require('../images/articleListLoading.png')} alt=""/>
                    </div>

                    <ListView
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                        renderHeader={() => (
                            <Carousel
                                autoplay={false}
                                infinite
                            >
                                {this.state.carouselData.map(val => (
                                    <img
                                        src={val.cover}
                                        alt=""
                                        style={{width: '100%', verticalAlign: 'top'}}
                                        onClick={this.carouselOnClick.bind(this, val.articleId, val.articleTitle)}
                                        onLoad={() => {
                                            // fire window resize event to change height
                                            window.dispatchEvent(new Event('resize'));
                                            this.setState({imgHeight: 'auto'});
                                        }}
                                    />
                                ))}
                            </Carousel>
                        )}
                        renderFooter={() => (
                            <div style={{paddingTop: 5, paddingBottom: 46, textAlign: 'center'}}>
                                {this.state.show_bottom_text ? this.state.isLoading ? '正在加载...' : '已经全部加载完毕' : ''}
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
                        style={
                            this.state.initLoading ? {display: 'none'} : {
                                display: 'block',
                                height: document.body.clientHeight
                            }
                        }
                        pullToRefresh={<PullToRefresh
                            onRefresh={this.onRefresh.bind(this, 'left')}
                            distanceToRefresh={80}
                        />}
                    />
                </div>

                <div className="toTop" style={
                    this.state.scrollFlag ? {display: 'block'} : {display: 'none'}
                } onClick={this.toTop.bind(this)}><img src={require('../images/toTop.png')}/></div>
            </div>
        );
    }

}
