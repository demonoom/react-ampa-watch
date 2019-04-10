import React from "react";
import "./pull.css"
var calm;
window.mescroll = null;
export default class pulltoRefresh extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            pdType: 0,
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
    }
    componentDidMount () {
        //创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,刷新列表数据;
        mescroll = new MeScroll("mescroll", {
            //上拉加载的配置项
            up: {
                callback: this.getListData, //上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
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
        // /*初始化菜单*/
        // $(".nav p").click(function () {
        //     var i = $(this).attr("i");
        //     if (pdType != i) {
        //         //更改列表条件
        //         pdType = i;
        //         $(".nav .active").removeClass("active");
        //         $(this).addClass("active");
        //         //重置列表数据
        //         mescroll.resetUpScroll();
        //         //隐藏回到顶部按钮
        //         mescroll.hideTopBtn();
        //     }
        // })

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
        var pdType = this.state.pdType;
        this.getListDataFromNet(pdType, page.num, page.size, function (curPageData) {
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
    setListData = (curPageData) => {
        var listDom = document.getElementById("dataList");
        for (var i = 0; i < curPageData.length; i++) {
            var pd = curPageData[i];

            var str = '<img class="pd-img" src="../res/img/loading-sq.png" imgurl="' + pd.pdImg + '"/>';
            str += '<p class="pd-name">' + pd.pdName + '</p>';
            str += '<p class="pd-price">' + pd.pdPrice + ' 元</p>';
            str += '<p class="pd-sold">已售' + pd.pdSold + '件</p>';

            var liDom = document.createElement("li");
            liDom.innerHTML = str;
            listDom.appendChild(liDom);
        }
    }

    /*联网加载列表数据
     在您的实际项目中,请参考官方写法: http://www.mescroll.com/api.html#tagUpCallback
     请忽略getListDataFromNet的逻辑,这里仅仅是在本地模拟分页数据,本地演示用
     实际项目以您服务器接口返回的数据为准,无需本地处理分页.
     * */
    getListDataFromNet = (pdType, pageNum, pageSize, successCallback, errorCallback) => {
        console.log("pdType=" + pdType + ", page.num=" + pageNum + ", page.size=" + pageSize );
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
                    if (this.state.pdType == 0) {
                        //全部商品 (模拟分页数据)
                        for (var i = (pageNum - 1) * pageSize; i < pageNum * pageSize; i++) {
                            if (i == data.length) break;
                            listData.push(data[i]);
                        }

                    } else if (this.state.pdType == 1) {
                        //奶粉
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].pdName.indexOf("奶粉") != -1) {
                                listData.push(data[i]);
                            }
                        }

                    } else if (this.state.pdType == 2) {
                        //面膜
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].pdName.indexOf("面膜") != -1) {
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

    clickP = (v) => {
        //重置列表数据
        mescroll.resetUpScroll();
        this.setState({
            pdType: v.label
        })
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

    render () {
        return (
            <div>
                <div className="header">
                    <div className="nav" style={{ display: "flex" }}>
                        {
                            this.state.tabs.map((v, i) => {
                                return (
                                    <p style={{ "flex": 1, "textAlign": "center" }} onClick={this.clickP.bind(this, v)} className={v.isActive ? "active" : ""} i={v.label}>{v.title}</p>
                                )
                            })
                        }
                    </div>
                </div>
                <div id="mescroll" className="mescroll" style={{top: "50px"}}>
                    <ul id="dataList" className="data-list">
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                        <p>fghjkl高考历史敌对势力都是 v 的反馈上课都看淡看2</p>
                    </ul>
                </div>
            </div >
        )
    }
}
