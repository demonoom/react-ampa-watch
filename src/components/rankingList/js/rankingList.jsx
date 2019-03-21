import React from "react";
import { Tabs, WhiteSpace,ListView} from 'antd-mobile';

const tabs = [
    { title: '答题排行榜' },
    { title: '运动排行榜' },
    { title: '爱心排行榜' },
  ];

  var myDate = new Date();
        //获取当前年
        var year=myDate.getFullYear();
        //获取当前月
        var month=myDate.getMonth()+1;
        //获取当前日
        var day=myDate.getDate();

        var time=year +'-' + month + '-' + day;
        var  start = time+' 00:00:00'
        var  end = time+' 23:59:59';


        var myWeekDate = new Date(); //获取七天前日期；
        myWeekDate.setDate(myDate.getDate() - 365);
         //获取当前年
         var weekYear=myWeekDate.getFullYear();
          //获取当前月
        var weekMonth=myWeekDate.getMonth()+1;
        //获取当前日
        var weekDay=myWeekDate.getDate();
        var timeWeek=weekYear +'-' + weekMonth + '-' + weekDay;
        var  weekStart = timeWeek+' 00:00:00';
        
export default class rankingList extends React.Component {
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
            flag:1,
            ownData:{},
            num:""
        };
    }
    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '运动排行列表';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        this.setState({
            userId
        })
        this.getStudentAnswerRightCountTop(userId,start,end);
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', this.onWindowResize)
    }

    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', this.onWindowResize)
    }
  /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            this.setState({clientHeight: document.body.clientHeight});
        }, 100)
    }

     /**
     *  查询答题排行榜
     */
    getStudentAnswerRightCountTop(userId,start,end) {
        var _this = this;
        _this.initData.splice(0);
        _this.state.dataSource = [];
        _this.state.dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
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
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse:  (result)=> {
                console.log(result,"ioio")
                if (result.msg == '调用成功' && result.success == true) {
                    result.response.forEach((v,i)=>{
                        if(this.state.userId ==v.col_uid){
                            this.setState({
                                ownData:v,
                                num:i
                            },()=>{
                                console.log(this.state.ownData,"oopop")
                            })
                        }
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
        var _this = this;
        var currentPageNo = this.state.defaultPageNo;
        if (!this.state.isLoadingLeft && !this.state.hasMore) {
            return;
        }
        currentPageNo += 1;
        this.setState({isLoadingLeft: true, defaultPageNo: currentPageNo});
        if(this.state.flag == 1){
            _this.getStudentAnswerRightCountTop(this.state.userId,start,end);

        }else {
            _this.getStudentAnswerRightCountTop(this.state.userId,weekStart,end);
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.initData),
            isLoadingLeft: true,
        });
    };

     //今日
     clickToday=()=>{
         this.setState({
            flag:1
         })
        this.getStudentAnswerRightCountTop(this.state.userId,start,end);
        console.log("jinri")
    }
    //本周
    toClickWeek=()=>{
        this.setState({
            flag:0
         })
        this.getStudentAnswerRightCountTop(this.state.userId,weekStart,end);
        console.log("benzhou")
    }

    //toDetail
    toDetail=()=>{
        var url = WebServiceUtil.mobileServiceURL + "detailPage?userid="+this.state.userId;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    render(){
        const row = (rowData, sectionID, rowID) => {
            console.log(rowData,"rowData")
           
            return (
                <div>
                    <img style={{display:rowID < 3 ? "block":"none"}} src={rowData.user.avatar}/>
                    <div>{Number(rowID)+1}</div>
                    <div>{rowData.user.userName}</div>
                    <span>{rowData.count}</span>
                </div>
            );
        };
        return (
            <div>
                <div>
                    <Tabs tabs={tabs}
                        initalPage={'t2'}
                    >
                        <div style={{backgroundColor: '#fff' }}>
                                <div>
                                    <span onClick={this.clickToday}>今日</span>
                                    <span onClick={this.toClickWeek}>本周</span>
                                </div>
                                <ListView
                                ref={el => this.lv = el}
                                dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                                renderFooter={() => (
                                    <div style={{paddingTop: 5, paddingBottom: 40, textAlign: 'center'}}>
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
                                    height: this.state.clientHeight,
                                }}
                            />
                            <div onClick={this.toDetail}>
                                <img src={this.state.ownData.user ? this.state.ownData.user.avatar:""}/>
                                <span>{Number(this.state.num)+1}</span>
                                <span>{this.state.ownData.user ? this.state.ownData.user.userName:""}</span>
                                <span>{this.state.ownData.count ? this.state.ownData.count:""}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', backgroundColor: '#fff' }}>
                        2
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', backgroundColor: '#fff' }}>
                        3
                        </div>
                    </Tabs>
                </div>
            </div>
        )
    }
}