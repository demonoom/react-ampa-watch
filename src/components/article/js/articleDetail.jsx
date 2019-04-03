import React from 'react';
import {
    Toast, DatePicker, ListView, TextareaItem, Button, List, Picker, Tag, Radio
} from 'antd-mobile';
import '../css/articleDetail.less';

const RadioItem = Radio.RadioItem;
const Item = List.Item;
const Brief = Item.Brief;

const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});

var theLike;
export default class articleDetail extends React.Component {

    constructor(props) {
        super(props);
        this.initDataSource = [];
        theLike = this;
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initDataSource),
            defaultPageNo: 1,
            clientHeight: document.body.clientHeight,
            isLoading: true,
            hasMore: true,
            data: {
                userInfo: {}
            },
            commitText: '',
            collection: false,  //是否收藏
            value: 0,
            reportFlag: false,
            reportButtonFlag: false,
            checkVersion: false, //是否显示举报按钮
            isLoadingHidden: false,
            scrollTo: '',  //评论完成后scroll滚动至,
            textareaFocus: false,
            isPhone: 'Android',
            demoFlag: true,
        }
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        // document.title = '校园自媒体';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var artId = searchArray[0].split('=')[1];
        var type = searchArray[1].split('=')[1];
        var articleTitle = searchArray[2].split('=')[1];
        var userId = searchArray[3].split('=')[1];
        var userName = searchArray[4].split('=')[1];
        var avatar = searchArray[5].split('=')[1];
        var isDiscuss = searchArray[6].split('=')[1];
        document.title = decodeURI(articleTitle);
        var phoneType = navigator.userAgent;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            this.setState({
                isPhone: 'ios',
            })
        } else {
            this.setState({
                isPhone: 'Android',
            })
        }

        this.setState({
            artId: artId,
            type: type,
            userId: userId,
            userName,
            avatar,
            isDiscuss
        }, () => {
            let p1 = new Promise((resolve, reject) => {
                this.getArticleInfoById(function () {
                    resolve('getArticleInfoById');
                });
            });
            let p3 = new Promise((resolve, reject) => {
                this.getDiscussInfoList(function () {
                    resolve('getDiscussInfoList');
                });
            });
            Promise.all([p1, p3]).then((result) => {
                console.log(result);
                //评论成功后要跳转的位置   向上偏移200
                this.setState({
                        scrollTo: $('.list-view-section-body')[0].offsetTop,
                        initTextarea: $('#text')[0].clientHeight,
                    },
                    //     ()=>{
                    //     var top = $('.list-view-section-body')[0].offsetTop;
                    //     // Toast.info(top);
                    // }
                );

            }).catch((error) => {
                console.log('promise出错');
            })
        })


        // $("#text").keydown(function (event) {
        //     // $("#text").val(event.keyCode);
        //     // return;
        //     if (event.keyCode == 13) {
        //         // alert('你按下了Enter');
        //         theLike.saveDiscussInfo();
        //
        //     }
        // });
        window.addEventListener('resize', this.onWindwoResize);

    }

    //监听窗口改变时间
    onWindwoResize() {
        // this
        // setTimeout(() => {
        if (theLike.state.isPhone == 'Android') {
            if (theLike.state.clientHeight > document.body.clientHeight) {
                // Toast.info('键盘弹起');
                theLike.setState({
                    textareaFocus: true,
                    clientHeight: document.body.clientHeight,
                })
            } else {
                // $('#text').css({height: this.state.initTextarea});
                // Toast.info('键盘收起');
                theLike.setState({
                    textareaFocus: false,
                    clientHeight: document.body.clientHeight,
                })
            }
        }

        // }, 100)

    }

    //评论框获取焦点事件
    textareaFocus() {
        var height = document.body.scrollHeight;
        if (theLike.state.isPhone == 'Android') {
            // $('#text')[0].scrollTop = $('#text')[0].scrollHeight - (theLike.state.clientHeight - 66);
            // document.body.scrollTop = document.body.scrollHeight;
            setTimeout(function () {
                document.body.scrollTop = height;
            }, 150);
        } else {
            setTimeout(function () {
                document.body.scrollTop = height;
                theLike.setState({
                    textareaFocus: true,
                })
            }, 150);
        }

    }

    textareaBlur() {
        if (theLike.state.isPhone == 'ios') {
            theLike.setState({
                textareaFocus: false,
            });
            // $('#text').css({height: this.state.initTextarea});
        }

    }


    /**
     * 获取评论列表
     * **/
    getDiscussInfoList(reslove) {
        var param = {
            "method": 'getDiscussInfoList',
            "videoId": this.state.artId,
            "type": 0,
            "pageNo": this.state.defaultPageNo,
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                console.log(result, '评论列表');
                if (result.pager.rsCount <= 0) {
                    this.setState({
                        isLoadingHidden: true,
                    })
                }
                if (result.success) {
                    this.state.rsCount = result.pager.rsCount;
                    if (this.initDataSource.length == 0 && result.response.length == 0) {
                        this.initDataSource = this.initDataSource.concat([{
                            // avatar:null,
                            // teacher:{},
                            demoFlag: true,
                        }])
                    } else {
                        this.initDataSource = this.initDataSource.concat(result.response);
                    }
                    // this.initDataSource = this.initDataSource.concat(result.response);
                    this.setState({
                        dataSource: dataSource.cloneWithRows(this.initDataSource),
                        isLoading: false,
                        commit_count: result.pager.rsCount
                    })
                    if (this.initDataSource.length == result.pager.rsCount) {
                        this.setState({
                            hasMore: false,
                            isLoading: false
                        })
                    }
                }
                if (reslove) {
                    reslove();
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
            this.getDiscussInfoList();
        });
    };

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

    /**
     * 按文章id获取详情信息
     * **/
    getArticleInfoById(reslove) {
        var param = {
            "method": 'getArticleInfoById',
            "articleId": this.state.artId,
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                console.log(result, "detail");
                if (result.success) {
                    this.setState({
                        data: result.response,
                        checkVersion: result.isIosCheckVersion //是否显示举报按钮
                    }, () => {
                        if (this.state.checkVersion) {
                            this.setState({
                                reportFlag: true,
                                reportButtonFlag: false,
                            })
                        }
                        $(".ql-image").click(function (e) {

                        });
                    })
                    //文章阅读量+1
                    this.addArticleReadCount()
                }
                if (reslove) {
                    reslove();
                }
            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }


    /**
     * 阅读量+1
     * **/
    addArticleReadCount() {
        var param = {
            "method": 'addArticleReadCount',
            "articleId": this.state.artId,
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    //文章阅读量+1
                } else {
                    Toast.info('+1?');
                }
            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }


    //点赞

    likeFlag() {
        this.setState({
            likeFlag: !this.state.likeFlag
        }, () => {
            var param = {
                "method": 'changeArticleLikeCount',
                "userId": this.state.userId,
                "articleId": this.state.artId,
                "changeType": this.state.likeFlag ? 0 : 1,//  0点赞 1 取消
            };
            WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
                onResponse: result => {
                    if (result.success) {
                        // this.state.data.likeCount = result.response;
                        var data = this.state.data;
                        data.likeCount = result.response;
                        this.setState({
                            data: data
                        })

                    } else {
                        Toast.info('+1?');
                    }
                },
                onError: function (error) {
                    Toast.fail(error, 1);
                }
            });
        })
    }

    //点击收藏
    changePent() {
        var userFavoriteInfoJson = {
            userId: this.state.userId,
            targetId: this.state.artId,
            targetType: 0
        }
        var param = {
            "method": 'changeUserFavoriteInfo',
            "userFavoriteInfoJson": userFavoriteInfoJson,
            "changeType": this.state.collection ? 1 : 0,
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    this.setState({
                        collection: !this.state.collection
                    })
                } else {
                    Toast.info('+1?');
                }
            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    //评论
    saveDiscussInfo() {
        // console.log(isDiscuss, 'isDiscuss');   //1可以 0不可
        if (theLike.state.isDiscuss == '0') {
            Toast.info('当前文章已关闭评论功能!', 1)
            return;
        }
        // Toast.info('触发')
        if (theLike.state.commitText == '') {
            Toast.info('请输入评论内容!', 1)
            return;
        }
        var param = {
            "method": 'saveDiscussInfo',
            "targetId": theLike.state.artId,
            "targetType": 0,
            "discussContent": theLike.state.commitText,
            "userId": theLike.state.userId
        };
        WebServiceUtil.requestArPaymentApi(JSON.stringify(param), {
            onResponse: result => {
                console.log(result, "pinglun");
                if (result.success) {
                    Toast.info('评论成功!', 1);
                    var commitObj = {
                        discussUser: {
                            userName: this.state.userName,
                            avatar: this.state.avatar,
                        },
                        discussContent: this.state.commitText,
                        createTime: new Date().getTime(),
                    }
                    console.log(commitObj, 'commitObj');
                    this.initDataSource.unshift(commitObj);
                    theLike.setState({
                        dataSource: dataSource.cloneWithRows(this.initDataSource),
                        commitText: '',
                        commit_count: (this.state.commit_count + 1),
                    }, () => {
                        $('#text').css({height: this.state.initTextarea});
                        $('#text').val('');
                        $(".am-list-view-scrollview")[0].scrollTop = theLike.state.scrollTo;

                        // this.getDiscussInfoList(function () {
                        //     // console.log($(".am-list-view-scrollview")[0]);
                        //     // $(".am-list-view-scrollview")[0].scrollTop = theLike.state.scrollTo;
                        //     $(".am-list-view-scrollview")[0].scrollTop = theLike.state.scrollTo;
                        // });
                        // window.location.reload()
                        // theLike.getDiscussInfoList();
                    })
                } else {
                    Toast.info('评论失败!', 1);
                }
                // $("#text").focus();
                // $("#text").blur();
            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    //评论框输入事件
    commitChange(val) {
        this.setState({
            commitText: val
        })
    }

    //举报
    toReport() {
        this.setState({
            reportButtonFlag: true,
        })
    }


    onChange_report = (value) => {
        this.setState({
            value,
        });
    };

    reportSubmit() {
        this.setState({
            reportFlag: false,
            reportButtonFlag: false,
        }, () => {
            Toast.success('感谢您的举报,我们会在24小时之内反馈您结果!', 1);
        })
    }

    cancelBox = () => {
        this.setState({
            reportFlag: true,
            reportButtonFlag: false,
        })
    }

    toShare = () => {
        var data = {
            method: 'shareWechat',
            shareUrl: window.location.href,
            shareTitle: $('.content').text(),
            shareUserName: this.state.data.articleTitle,
        };
        Bridge.callHandler(data, null, function (error) {
            Toast.info('分享文章失败')
        });
    }

    popView = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, null);
    };

    render() {
        const data_report = [
            {value: 0, label: '广告及垃圾信息'},
            {value: 1, label: '抄袭或未授权转载'},
            {value: 3, label: '欺诈、色情或发布敏感信息'},
            {value: 4, label: '违法犯罪'},
            {value: 5, label: '不实信息'},
            {value: 6, label: '其他'},
        ];
        const row = (rowData, sectionID, rowID) => {
            var time = this.timeDifference(rowData.createTime);
            return (
                <div style={
                    rowData.demoFlag ? {display: 'none'} : {}
                }>
                    <List className="listCont line_public ">
                        <Item align="top" thumb={rowData.discussUser ? rowData.discussUser.avatar : ""} multipleLine>
                            <span>{rowData.discussUser ? rowData.discussUser.userName : ""}</span>
                            <Brief>{rowData.discussContent}</Brief>
                            <span className="releaseTime">{time}</span>
                        </Item>
                        {/*<Item extra={WebServiceUtil.formatYMD(rowData.createTime)} align="top" thumb={rowData.discussUser.avatar} multipleLine>*/}
                        {/*{rowData.discussUser.userName} <Brief>{rowData.discussContent}</Brief>*/}
                        {/*</Item>*/}
                    </List>
                </div>
            )
        };
        return (
            <div id="articleDetail" style={{height: document.body.clientHeight}}>
                <div className="am-navbar">
                    <span className="am-navbar-left"  onClick={this.popView}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">发现详情</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="inner-cont">
                    <div className="inner">
                        <div className="commit">
                            <div id={this.state.reportFlag ? 'textAndReport' : 'textNo'} className="comments_send">
                                <TextareaItem
                                    id="text"
                                    placeholder="请输入评论内容"
                                    data-seed="logId"
                                    ref={el => this.autoFocusInst = el}
                                    autoHeight
                                    value={this.state.commitText}
                                    onChange={this.commitChange.bind(this)}
                                    onFocus={this.textareaFocus.bind(this)}
                                    onBlur={this.textareaBlur.bind(this)}
                                />
                                <div>
                                    <a className='commit_button' type="primary"
                                       onClick={this.saveDiscussInfo.bind(this)}><span>发送</span></a>
                                </div>

                                {/*<div style={*/}
                                {/*this.state.reportFlag?{display:'inline-block'}:{display:'none'}*/}
                                {/*} className="report" onClick={this.toReport.bind(this)}>*/}
                                {/*<img onClick={this.toReport.bind(this)} src={require("../images/report.png")} alt=""/>*/}
                                {/*</div>*/}
                                {/*<Button type="primary" onClick={this.saveDiscussInfo.bind(this)}>评论</Button>*/}
                            </div>
                        </div>
                        <ListView
                            ref={el => this.lv = el}
                            dataSource={this.state.dataSource}    //数据类型是 ListViewDataSource
                            renderSectionHeader={sectionData => (
                                <div className="p15">
                                    <div className="title">{this.state.data.articleTitle}</div>
                                    <div className="at">
                                        <div
                                            className="author">{this.state.data.author}</div>
                                        <div
                                            className="createTime">{WebServiceUtil.formatYMD(this.state.data.createTime)}</div>
                                    </div>
                                    <div className="content"
                                         dangerouslySetInnerHTML={{__html: this.state.data.articleContent}}></div>
                                    <div className="content_bottom">
                                        <div style={
                                            this.state.reportFlag ? {display: 'inline-block'} : {display: 'none'}
                                        } className="report" onClick={this.toReport.bind(this)}>
                                            <div className="i_report" onClick={this.toReport.bind(this)}><span>举报</span>
                                            </div>
                                        </div>
                                        <div>

                                        </div>
                                    </div>
                                    <div className="commit_title">总评论{this.state.commit_count}条</div>
                                </div>
                            )}
                            renderFooter={this.state.isLoadingHidden ? '' : () => (
                                <div style={{paddingTop: 5, paddingBottom: 0, textAlign: 'center'}}>
                                    {this.state.isLoading ? '正在加载...' : '已经全部加载完毕'}
                                </div>)}
                            renderRow={row}   //需要的参数包括一行数据等,会返回一个可渲染的组件为这行数据渲染  返回renderable
                            className="am-list commentList"
                            pageSize={30}    //每次事件循环（每帧）渲染的行数
                            //useBodyScroll  //使用 html 的 body 作为滚动容器   bool类型   不应这么写  否则无法下拉刷新
                            scrollRenderAheadDistance={200}   //当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行
                            onEndReached={this.onEndReached}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                            onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                            initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                            scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                            // useBodyScroll={true}
                            style={{
                                height: document.body.clientHeight - 53,
                            }}
                        />

                        {/*举报 start*/}
                        <div className="positionBox" style={
                            this.state.reportButtonFlag ? {display: 'block'} : {display: 'none'}
                        }>
                            <div className="cancelReport" onClick={this.cancelBox}><i onClick={this.cancelBox}></i></div>
                            <List renderHeader={() => '请选择举报原因'}>
                                {data_report.map(i => (
                                    <RadioItem className={this.state.value === i.value ? 'checked' : ''} key={i.value}
                                               checked={this.state.value === i.value}
                                               onChange={() => this.onChange_report(i.value)}>
                                        {i.label}
                                    </RadioItem>
                                ))}
                            </List>
                            <Button type="primary" onClick={this.reportSubmit.bind(this)}>提交</Button>
                        </div>
                        <div className="postionBox_mask"
                             style={
                                 this.state.reportButtonFlag ? {
                                     display: 'block',
                                     height: this.state.clientHeight
                                 } : {display: 'none', height: this.state.clientHeight}
                             }
                             onClick={this.cancelBox}></div>
                        {/*举报 end*/}
                    </div>
                </div>
            </div>
        );
    }

}
