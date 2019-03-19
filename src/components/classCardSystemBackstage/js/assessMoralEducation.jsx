import React from 'react';
import {
    Toast,
    List,
    Radio,
    ListView,
    Modal,
    PullToRefresh,
    Checkbox,
    Flex,
    WhiteSpace,
    WingBlank,
    Button,
} from 'antd-mobile';
import '../css/assessMoralEducation.less'
import { ucs2 } from 'punycode';

const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
const alert = Modal.alert;
const RadioItem = Radio.RadioItem;
var assessME;

export default class assessMoralEducation extends React.Component {
    constructor(props) {
        super(props);
        assessME = this;
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.initData = [];
        this.state = {
            dataSource: dataSource.cloneWithRows(this.initData),
            defaultPageNo: 1,
            theFirstData: [],
            clientHeight: document.body.clientHeight,
            selectData: [],
            calmHeight: document.body.clientHeight - 150,
            toDetail: true
        };
    }


    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var clazzId = locationSearch.split("&")[0].split("=")[1];
        var cName = locationSearch.split("&")[1].split("=")[1];
        assessME.setState({
            "classId": clazzId,
            "cName": cName
        })

    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = `${decodeURI(assessME.state.cName)}`;
        this.getMoralEducationInfoList(assessME.state.classId, true)
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', assessME.onWindowResize)
        assessME.getMoralEducationInfo();

    }

    getMoralEducationInfo = () => {
        var param = {
            "method": "getMoralEducationInfo",
            "clazzId": this.state.classId,
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.response != null && WebServiceUtil.formatYMD(result.response.createTime) == WebServiceUtil.formatYMD(Date.parse(new Date()))) {
                    assessME.setState({
                        toDetail: false
                    }, () => {
                        console.log(assessME.state.toDetail)
                    })
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', assessME.onWindowResize)
    }

    /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            assessME.setState({
                clientHeight: document.body.clientHeight,
                calmHeight: document.body.clientHeight - 150
            });
        }, 100)
    }

    /**
     * 查看对应教室ID的德育信息
     */
    getMoralEducationInfoList(classId, flag) {
        var _this = this;
        if (flag) {
            _this.initData.splice(0);
            _this.state.dataSource = [];
            _this.state.dataSource = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
        }
        const dataBlob = {};
        var PageNo = this.state.defaultPageNo;
        var param = {
            "method": 'getMoralEducationInfoList',
            "clazzId": classId,
            "pageNo": PageNo,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    if (_this.state.defaultPageNo === 1) {
                        assessME.state.theFirstData = result.response;
                    }
                    assessME.state.selectData = result.response
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
                        if (pager.pager > pager.pageCount) {
                            isLoading = false;
                            return;
                        }
                    } else {
                        isLoading = false;
                    }
                    _this.initData = _this.initData.concat(arr);
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData),
                        isLoadingLeft: isLoading,
                        refreshing: false,
                    })
                } else {
                    Toast.fail(result.msg, 3);
                }
            },
            onError: function (error) {
                Toast.info(error);
            }
        });
    }

    /**
     *  ListView数据全部渲染完毕的回调
     */
    onEndReached = (event) => {
        var _this = this;
        var currentPageNo = this.state.defaultPageNo;
        if (!this.state.isLoadingLeft) {
            return;
        }
        currentPageNo += 1;
        this.setState({ isLoadingLeft: true, defaultPageNo: currentPageNo });
        _this.getMoralEducationInfoList(_this.state.classId, false);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.initData),
            isLoadingLeft: true,
        });
    };

    onRefresh = () => {
        var divPull = document.getElementsByClassName('am-pull-to-refresh-content');
        divPull[0].style.transform = "translate3d(0px, 30px, 0px)";   //设置拉动后回到的位置
        this.setState({ defaultPageNo: 1, refreshing: true, isLoadingLeft: true });
        this.getMoralEducationInfoList(this.state.classId, true);
    }

    /**
     * toUpdateMoralEducatio跳转修改页面
     */
    toUpdateMoralEducation = (item) => {

        var url = WebServiceUtil.mobileServiceURL + "updateMoralEducation?id=" + item.id + "&name=" + assessME.state.cName;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });

    }

    /**
     * 根据ID删除德育信息
     */
    delMoralEducation(id) {
        var _this = this;
        var param = {
            "method": 'deleteMoralEducation',
            "id": id,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('删除成功', 1);
                    _this.state.dataSource = [];
                    _this.state.dataSource = new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,
                    });
                    _this.initData.forEach(function (v, i) {
                        if (id == v.id) {
                            _this.initData.splice(i, 1);
                        }
                    });
                    _this.setState({
                        dataSource: _this.state.dataSource.cloneWithRows(_this.initData)
                    });
                } else {
                    Toast.fail(result.msg, 3)
                }
            },
            onError: function (error) {
                Toast.info('删除失败');
            }
        });
    }

    /**
     * searchClassroomName搜索班级的名称
     */
    toaddMoralEducation() {
        if (assessME.state.toDetail) {
            var url = WebServiceUtil.mobileServiceURL + "addMoralEducation?classId=" + assessME.state.classId + "&name=" + assessME.state.cName;
            var data = {
                method: 'openNewPage',
                url: url
            };

            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        } else {
            Toast.info("请勿重复添加")
        }
        console.log(assessME.state.toDetail, "yuio")

    }

    /**
     * 删除弹出框
     */
    showAlert = (sId) => {
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        var _this = this;
        const alertInstance = alert('您确定要删除吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => _this.delMoralEducation(sId) },
        ], phone);
    };

    render() {
        var _this = this;
        const row = (rowData, sectionID, rowID) => {
            return (<div>
                {
                    <div className="classInfo line_public">
                        <div className="topDiv">
                            <div className="fl">
                                <span>班级卫生评分</span>
                                <span className="healthScore">{rowData.health}</span>分
                                </div>
                            <div className="fr">
                                <span>班级礼貌评分</span>
                                <span className="politenessScore">{rowData.politeness}</span>分
                                </div>
                        </div>
                        <div className="btnDiv">
                            <span className="createTime">创建时间：{WebServiceUtil.formatYMD(rowData.createTime)}</span>
                            <span className='modifyBtn_common'
                                onClick={this.toUpdateMoralEducation.bind(this, rowData)}></span>
                            <span className='deleteBtn_common'
                                onClick={this.showAlert.bind(this, rowData.id)}
                            ></span>
                        </div>
                    </div>
                }
            </div>

            )
        };
        return (
            <div id="assessMoralEducation" style={{ height: assessME.state.clientHeight }}>

                <div className='tableDiv' style={{ height: assessME.state.clientHeight }}>
                    {
                        assessME.state.selectData.length === 0 && assessME.state.theFirstData.length === 0 ?
                            <div className="nodata">暂无德育评价信息</div>
                            : <ListView
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
                                onEndReached={this.onEndReached}  //当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用
                                onEndReachedThreshold={10}  //调用onEndReached之前的临界值，单位是像素  number类型
                                initialListSize={30}   //指定在组件刚挂载的时候渲染多少行数据，用这个属性来确保首屏显示合适数量的数据
                                scrollEventThrottle={20}     //控制在滚动过程中，scroll事件被调用的频率
                                style={{
                                    height: assessME.state.clientHeight,
                                }}
                                pullToRefresh={<PullToRefresh
                                    onRefresh={this.onRefresh}
                                    distanceToRefresh={80}
                                />}
                            />
                    }
                    <div className='addBunton' onClick={this.toaddMoralEducation}>
                        <img src={require("../imgs/addBtn.png")} />
                    </div>
                </div>
            </div>
        );
    }
}
