import React from "react";
import {Toast, ListView, Tabs, Modal} from "antd-mobile";

const alert = Modal.alert;
export default class schoolPush extends React.Component {
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
            userId: 0
        };
    }

    componentWillMount() {

    }

    componentDidMount() {
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
            "notifyType":'9',
            "ident": userId,
            "pageNo": this.state.defaultPageNo
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if(result.success){
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

                    console.log(arr,'yyyy');

                    _this.initData = _this.initData.concat(arr);
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData),
                        isLoadingLeft: isLoading,
                        refreshing: false
                    })




                }else {
                    Toast.info(result);
                }


            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }



    formatUnixtimestamp = (inputTime)=> {
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
        return  m + '-' + d+' '+h+':'+minute+':'+second;
    }


    loadMore = () =>{
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
    getTopicByIdRequest = (topid) =>{
        var param = {
            "method": 'getTopicById',
            "topicId":topid
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if(result.success){

                }else {
                    Toast.info(result);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

   /*点赞*/
    praiseForTopicById = (topicId) => {
        var param = {
            "method": 'praiseForTopic',
            "topicId":topicId,
            "ident": '41'
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if(result.success){

                }else {
                    Toast.info(result);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    /*取消点赞*/
    cancelPraiseForTopicById =(topicId)=>{
        var param = {
            "method": 'cancelPraiseForTopic',
            "topicId":topicId,
            "ident": userId
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if(result.success){

                }else {
                    Toast.info(result);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    deleteTopicCommentById =(commentId)=>{
        var param = {
            "method": 'deleteTopicComment',
            "topicCommentId":commentId,
            "ident": userId
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if(result.success){

                }else {
                    Toast.info(result);
                }

            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }




    zanClick = (rowData) =>{
         //console.log(rowData.createTime,'赞');
          this.praiseForTopicById(rowData.id);
         // this.addTopicCommentAndResponse2(rowData,'baidu这个平路手机辐射');
    }

    addZanView = (rowData)=> {
        var resString = '';
        if (rowData.comments.length > 0) {
            for (i = 0; i < rowData.comments.length; i++) {
                var keyV = rowData.comments[i];
                resString = resString + keyV.fromUser.userName;
            }
            return(
                <div>{resString}</div>
            )
        }
    }


    render() {
        const row = (rowData, sectionID, rowID) => {
            console.log(rowData, "rowData");
            var  time = this.formatUnixtimestamp(rowData.createTime);
            var  zanSting = 'fsd';
            if (rowData.comments.length > 0) {
                for (var i=0; i<rowData.comments.length;i++){
                    var  key = rowData.comments[i];
                    zanSting = zanSting + key.user.userName;
                }
            }
            var  isZan = false;
            // rowData.comments.map


            return (
                <div>
                    <img  src={rowData.fromUser.avatar} />
                    <div> 校内通知 </div>
                    <div> {time}</div>
                    <div>{rowData.content}</div>
                    <button onClick={this.zanClick(rowData,)}>点赞</button>
                    <div>{zanSting}</div>
                </div>
            );
        };
        return (
            <div>
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










