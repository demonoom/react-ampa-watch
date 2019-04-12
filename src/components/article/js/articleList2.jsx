import React from 'react';
import icon_topTop from "../../images/icon_toTop.png";
import {Toast, Carousel} from "antd-mobile";

import '../css/articleList2.less'
import icon_refresh from "../../images/icon_refresh.gif";

window.mescroll = null;
export default class articleList2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: [],
            carouselData: [],
        }
    }

    componentWillMount() {
        var _this = this;
        document.title = '文章列表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        var passward = searchArray[1].split('=')[1];
        this.setState({userId, passward}, () => {
            this.LittleAntLogin()
        });
    }

    componentDidMount() {
        var _this = this;
        //创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,重置列表数据;
        mescroll = new MeScroll("mescroll", {
            down: {
                htmlContent:'<p class=""><img src='+icon_refresh+'/></p><p class="downwarp-tip"></p>'
            },
            up: {
                callback: _this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                noMoreSize: 4,
                page: {
                    num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                    size: 7, //每页数据条数,默认10
                },
                htmlNodata: '<p class="upwarp-nodata">亲,没有更多数据了~</p>',
                clearEmptyId: "dataList", //1.下拉刷新时会自动先清空此列表,再加入数据; 2.无任何数据时会在此列表自动提示空
                toTop: { //配置回到顶部按钮
                    src: icon_topTop, //默认滚动到1000px显示,可配置offset修改
                    //offset : 1000
                },
                lazyLoad: {
                    use: true // 是否开启懒加载,默认false
                }
            }
        });
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

    /*联网加载列表数据  page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    getListData = (page) => {
        var _this = this;
        //联网加载数据
        this.getListDataFromNet(page.num, page.size, function (curPageData) {
            //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
            //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
            console.log("page.num=" + page.num + ", page.size=" + page.size + ", curPageData.length=" + curPageData.length);

            //方法一(推荐): 后台接口有返回列表的总页数 totalPage
            //mescroll.endByPage(curPageData.length, totalPage); //必传参数(当前页的数据个数, 总页数)

            //方法二(推荐): 后台接口有返回列表的总数据量 totalSize
            //mescroll.endBySize(curPageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)

            //方法三(推荐): 您有其他方式知道是否有下一页 hasNext
            //mescroll.endSuccess(curPageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)

            //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
            mescroll.endSuccess(curPageData.length);

            //提示:curPageData.length必传的原因:
            // 1.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
            // 2.比传入的totalPage, totalSize, hasNext具有更高的判断优先级
            // 3.使配置的noMoreSize生效

            //设置列表数据,因为配置了emptyClearId,第一页会清空dataList的数据,所以setListData应该写在最后;
            _this.setListData(curPageData);
        }, function () {
            //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
            mescroll.endErr();
        });
    };

    /*设置列表数据*/
    setListData = (curPageData) => {
        var _this = this;
        var dataList = [];

        curPageData.map((v, i) => {
            var rowData = v;
            var dom;
            var time = this.timeDifference(rowData.createTime);
            var image = rowData.articleImgArray ? rowData.articleImgArray : [];
            if (image.length == 1) {  //图片一张
                dom = <div className="item line_public" onClick={_this.toDetail.bind(this, rowData.articleId, rowData.articleTitle, rowData.isDiscuss)}>
                    <div className="leftBox">
                        <div className="title minHeight">{rowData.articleTitle}</div>
                        <div className="bottom">
                            <div className="read">{rowData.readCount}阅读</div>
                            <div className="time">{time}</div>
                        </div>
                    </div>
                    <div className="rightBox" style={{backgroundImage: 'url(' + image[0] + ')'}}>
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
                dom = <div className="item line_public" onClick={_this.toDetail.bind(this, rowData.articleId, rowData.articleTitle, rowData.isDiscuss)}>
                    <div className="title">{rowData.articleTitle}</div>
                    <div className="images">{imageDom}</div>
                    <div className="bottom">
                        <div className="read">{rowData.readCount}阅读</div>
                        <div className="time">{time}</div>
                    </div>
                </div>
            } else {                //图片没有
                dom = <div className="item line_public" onClick={_this.toDetail.bind(this, rowData.articleId, rowData.articleTitle, rowData.isDiscuss)}>
                    <div className="title">{rowData.articleTitle}</div>
                    <div className="bottom">
                        <div className="read">{rowData.readCount}阅读</div>
                        <div className="time">{time}</div>
                    </div>
                </div>
            }

            dataList.push(dom);
        });

        this.setState({dataList: this.state.dataList.concat(dataList)})
    };

    /*联网加载列表数据
			 在您的实际项目中,请参考官方写法: http://www.mescroll.com/api.html#tagUpCallback
			 请忽略getListDataFromNet的逻辑,这里仅仅是在本地模拟分页数据,本地演示用
			 实际项目以您服务器接口返回的数据为准,无需本地处理分页.
			 * */
    getListDataFromNet = (pageNum, pageSize, successCallback, errorCallback) => {
        if (pageNum === 1) {
            this.getWatchArticleInfoListByStatusAndIsTop()
        }

        var param = {
            "method": 'getWatchArticleInfoListByStatus',
            "pageNo": pageNum,
        };

        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    successCallback(result.response)
                }

            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    };

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
                    console.log(result.response);
                    _this.setState({carouselData: result.response})
                }

            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    //计算时间差
    timeDifference = (date) => {
        var date1 = date;  //开始时间
        var date2 = new Date();    //结束时间
        var date3 = date2.getTime() - new Date(date1).getTime();   //时间差的毫秒数

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
    };

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

    render() {
        return (
            <div id="articleList2" style={{height: document.body.clientHeight}}>
                <div className="am-navbar-blue">
                    <div className="am-navbar am-navbar-light">
                        <div className="am-navbar-title">发现</div>
                    </div>
                </div>
                {/*滑动区域*/}
                <div id="mescroll" className="mescroll">
                    {/*展示上拉加载的数据列表*/}
                    <Carousel
                        autoplay={true}
                        autoplayInterval={4000}
                        infinite
                        className="Carousel-banner"
                        style={{display: this.state.carouselData.length === 0 ? 'none' : ''}}
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
                    <ul id="dataList" className="data-list">
                        {this.state.dataList}
                    </ul>
                </div>
            </div>
        );
    }

}
