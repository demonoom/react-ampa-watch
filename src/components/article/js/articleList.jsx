import React from 'react';
import {
    Toast, ListView, Button, List, Picker, Tag, Tabs, Carousel, PullToRefresh
} from 'antd-mobile';
import '../css/articleList.less';

var dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});

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
        var _this = this;
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
                this.setState({
                    initLoading: false,
                })
            })
        });

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
                console.log(result);
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

    /**
     * 获取轮播图
     */
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
     * 获取发现列表
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
            this.getArticleRecommenLittleVideoList();
        });
    };

    onRefresh = () => {
        var divPull = document.getElementsByClassName('am-pull-to-refresh-content');

        divPull[0].style.transform = "translate3d(0px, 30px, 0px)";   //设置拉动后回到的位置

        this.setState({
            defaultPageNo: 1, refreshing: true
        }, () => {
            this.getArticleRecommenLittleVideoList(true);
        });


    };

    toDetail(id, articleTitle, isDiscuss) {
        if (id) {
            let url = encodeURI(WebServiceUtil.mobileServiceURL + "articleDetail?vId=" + id + "&type=1&articleTitle=" + articleTitle + "&uid=" + this.state.uid + "&userName=" + this.state.userName + "&avatar=" + this.state.avatar + "&isDiscuss=" + isDiscuss);
            var data = {
                method: 'openNewPage',
                navType: 2,
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
            Toast.fail('id参数有误', 2);
        }
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

    closeUserGuide = () => {
        this.setState({
            isDisPlay: 0
        })
    }

    carouselOnClick = (id, articleTitle, isDiscuss) => {
        if (id) {
            let url = encodeURI(WebServiceUtil.mobileServiceURL + "articleDetail?vId=" + id + "&type=1&articleTitle=" + articleTitle + "&uid=" + this.state.uid + "&userName=" + this.state.userName + "&avatar=" + this.state.avatar + "&isDiscuss=" + isDiscuss);
            var data = {
                method: 'openNewPage',
                navType: 2,
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
        const row = (rowData) => {
            var dom = "";
            var time = this.timeDifference(rowData.createTime);
            var image = rowData.articleImgArray ? rowData.articleImgArray : [];
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
                dom = <div className="item line_public">
                    <div className="title">{rowData.articleTitle}</div>
                    <div className="bottom">
                        <div className="read">{rowData.readCount}阅读</div>
                        {/*<div className="like">{rowData.likeCount}点赞</div>*/}
                        <div className="time">{time}</div>
                    </div>
                </div>
            }


            return (
                <div className={this.state.index == 2 ? 'list_item' : ''}
                     onClick={this.state.index == 2 ? '' : rowData.response instanceof Array ? '' : this.toDetail.bind(this, rowData.articleId, rowData.articleTitle, rowData.isDiscuss)}>
                    {dom}
                </div>
            )
        };
        return (
            <div id="articleList" style={{height: document.body.clientHeight}}>
                <div className="am-navbar-blue">
                    <div className="am-navbar am-navbar-light">
                        <div className="am-navbar-title">发现</div>
                    </div>
                </div>

                <div style={{display: this.state.isDisPlay == 1 ? "block" : "none"}} className="UserGuide">
                    <img className="userguide1" src={require('../images/UserGuide1.png')} width='54'></img>
                    <img onClick={this.closeUserGuide} className="userguide2" width="110"
                         src={require('../images/UserGuide2.png')}></img>
                    <img className="userguide3" src={require('../images/UserGuide3.png')} width="270"></img>
                </div>

                <div className="articleList-cont">
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
                                autoplay={true}
                                autoplayInterval={4000}
                                infinite
                                className="Carousel-banner"
                            >
                                {this.state.carouselData.map(val => (
                                    <div>
                                        <img
                                            src={val.cover}
                                            alt=""
                                            style={{width: '100%', verticalAlign: 'top'}}
                                            onClick={this.carouselOnClick.bind(this, val.articleId, val.articleTitle, val.isDiscuss)}
                                        />
                                        <span className="Carousel-title text_hidden">{val.articleTitle}</span>
                                    </div>
                                ))}
                            </Carousel>
                        )}
                        renderFooter={() => (
                            <div style={{paddingTop: 5, paddingBottom: 5, textAlign: 'center'}}>
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
                            onRefresh={this.onRefresh.bind(this)}
                            distanceToRefresh={130}
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
