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
 /*初始化菜单*/
 var pType = "全部";//全部商品0; 奶粉1; 面膜2; 图书3;
 var pdType = 0;//全部商品0; 奶粉1; 面膜2; 图书3;
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
            manageData: []
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
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', this.onWindowResize)
        // this.watchListener();
        $(".am-pull-to-refresh-content-wrapper").css({
            minHeight: this.state.clientHeight - 114
        })

        //创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,刷新列表数据;
        var mescroll = new MeScroll("mescroll", {
            down:{
                callback:downCallback
            }
            //上拉加载的配置项
            up: {
                callback: getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                empty: {
                    icon: "../res/img/mescroll-empty.png", //图标,默认null
                    tip: "暂无相关数据~", //提示
                    btntext: "去逛逛 >", //按钮,默认""
                    btnClick: function () {//点击按钮的回调,默认null
                        alert("点击了按钮,具体逻辑自行实现");
                    }
                },
                clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                toTop: { //配置回到顶部按钮
                    src: "../res/img/mescroll-totop.png", //默认滚动到1000px显示,可配置offset修改
                    //offset : 1000
                },
                lazyLoad: {
                    use: true // 是否开启懒加载,默认false
                }
            }
        });
        $(".nav p").click(function (e) {
            $(".nav p").removeClass("active");
            $(e.target).addClass("active");
            console.log($(e.target).html(),"opopop")
            var i = 0;
            if($(e.target).html() == "奶粉"){
                i = 1;
            }
            if($(e.target).html() == "面膜"){
                i = 2;
            }
            if($(e.target).html() == "图书"){
                i = 3;
            }
            if (pType != $(e.target).html()) {
                //更改列表条件
                pdType = i;
                pType = $(e.target).html();
                //重置列表数据
                mescroll.resetUpScroll();
                //隐藏回到顶部按钮
                mescroll.hideTopBtn();
            }
        })

        /*联网加载列表数据  page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
        function getListData (page) {
            console.log(page,"90909")
            //联网加载数据
            getListDataFromNet(pdType, page.num, page.size, function (curPageData) {
                //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
                console.log("pdType=" + pdType + ", page.num=" + page.num + ", page.size=" + page.size + ", curPageData.length=" + curPageData.length);

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

                //设置列表数据
                setListData(curPageData);
            }, function () {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                mescroll.endErr();
            });
        }

        /*设置列表数据*/
        function setListData (curPageData) {
            var listDom = document.getElementById("dataList");
            for (var i = 0; i < curPageData.length; i++) {
                var pd = curPageData[i];

                var str = '<img className="pd-img" src="../res/img/loading-sq.png" imgurl="' + pd.pdImg + '"/>';
                str += '<p className="pd-name">' + pd.pdName + '</p>';
                str += '<p className="pd-price">' + pd.pdPrice + ' 元</p>';
                str += '<p className="pd-sold">已售' + pd.pdSold + '件</p>';

                var liDom = document.createElement("li");
                liDom.innerHTML = str;
                listDom.appendChild(liDom);
            }
        }

        function downCallback (){
            console.log("iouiopui")
        }

        /*联网加载列表数据
         在您的实际项目中,请参考官方写法: http://www.mescroll.com/api.html#tagUpCallback
         请忽略getListDataFromNet的逻辑,这里仅仅是在本地模拟分页数据,本地演示用
         实际项目以您服务器接口返回的数据为准,无需本地处理分页.
         * */
        function getListDataFromNet (pdType, pageNum, pageSize, successCallback, errorCallback) {
            console.log("pdType",pdType)
            console.log("pageNum",pageNum)
            //延时一秒,模拟联网
            setTimeout(function () {
                $.ajax({
                    type: 'GET',
                    url: '../res/pdlist1.json',
                    //		                url: '../res/pdlist1.json?pdType='+pdType+'&num='+pageNum+'&size='+pageSize,
                    dataType: 'json',
                    success: function (data) {
                        var listData = [];
                        //pdType 全部商品0; 奶粉1; 面膜2; 图书3;
                        if (pdType == 0) {
                            //全部商品 (模拟分页数据)
                            for (var i = (pageNum - 1) * pageSize; i < pageNum * pageSize; i++) {
                                if (i == data.length) break;
                                listData.push(data[i]);
                            }

                        } else if (pdType == 1) {
                            //奶粉
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].pdName.indexOf("奶粉") != -1) {
                                    listData.push(data[i]);
                                }
                            }

                        } else if (pdType == 2) {
                            //面膜
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].pdName.indexOf("面膜") != -1) {
                                    listData.push(data[i]);
                                }
                            }

                        } else if (pdType == 3) {
                            //图书
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].pdName.indexOf("图书") != -1) {
                                    listData.push(data[i]);
                                }
                            }
                        }

                        //回调
                        successCallback(listData);
                    },
                    error: errorCallback
                });
            }, 1000)
        }
    }
    render () {
        var _this = this;
        return (
            <div id='rankingList'>
                <div className="header">
                    <div className="nav">
                        <p className="active" i="0">全部</p>
                        <p i="1">奶粉</p>
                        <p i="2">面膜</p>
                        <p i="3">图书</p>
                    </div>
                </div>
                <div id="mescroll" className="mescroll">
                    <ul id="dataList" className="data-list">
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                        <li>
                            <img className="pd-img" src="../res/img/pd1.jpg" />
                            <p className="pd-name">商品标题商品标题商品标题商品标题商品标题商品</p>
                            <p className="pd-price">200.00 元</p>
                            <p className="pd-sold">已售50件</p>
                        </li>
                    </ul>
                </div>
            </div >
        )
    }
}
