import React from "react";
import ReactEcharts from 'echarts-for-react';
import {
    PullToRefresh
} from 'antd-mobile';
import '../css/detailPage.less';
import '../css/macarons';
window.mescroll = null;
var calm;
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
//数组去重
function unique (array) {
    var temp = []; //一个新的临时数组
    for (var i = 0; i < array.length; i++) {
        if (temp.indexOf(array[i]) == -1) {
            temp.push(array[i]);
        }
    }
    return temp;
}

export default class detailPage extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            faceChartDiv: [],
            faceChartDivLove: [],
            faceChartDivStep: [],
            detailData: {},
            clientHeight: document.body.clientHeight,
            dataLegend: [
                { name: '答对次数', icon: 'rect', value: '40' },
                { name: '答题次数', icon: 'rect', value: '40' },
                { name: '总数', icon: 'rect', value: '40' }
            ]
        };
    }
    componentDidMount () {
        Bridge.setShareAble("false");
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', this.onWindowResize);
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var today = locationSearch.split("&")[1].split('=')[1];
        var tagType = locationSearch.split("&")[2].split('=')[1];
        var num = locationSearch.split("&")[3].split('=')[1];
        this.setState({
            userId,
            today,
            tagType,
            num
        })
        console.log(today,"today")
        this.getUserById(userId);
        if (tagType == "love") {
            if (today == 0) {
                this.getLoveCountDetail(userId, start);
            } else {
                this.getLoveCountDetail(userId, weekStart);
            }
        } else if (tagType == "step") {
            console.log("step")
            if (today == 0) {
                this.getSportStepDetail(userId, start);
            } else {
                this.getSportStepDetail(userId, weekStart);
            }
        } else {
            if (today == 0) {
                this.getStudentAnswerDetail(userId, start);
            } else {
                this.getStudentAnswerDetail(userId, weekStart);
            }
        }
           //创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,刷新列表数据;
           mescroll = new MeScroll("mescroll", {
            down: {
                auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
                callback: this.downCallback, //下拉刷新的回调
                htmlContent:'<p class=""><img src="http://60.205.86.217/upload9/2019-04-10/16/c9aa71f0-cc32-4d82-9954-a076ef4161d0.gif" /></p><p class="downwarp-tip"></p>'
            },
        });

    }
    downCallback=()=>{
        if (this.state.tagType == "love") {
            if (this.state.today == 0) {
                this.getLoveCountDetail(this.state.userId, weekStart);
            } else {
                this.getLoveCountDetail(this.state.userId, start);
            }
        } else if (this.state.tagType == "step") {
            console.log("step")
            if (this.state.today == 0) {
                this.getSportStepDetail(this.state.userId, weekStart);
            } else {
                this.getSportStepDetail(this.state.userId, start);
            }
        } else {
            if (this.state.today == 0) {
                this.getStudentAnswerDetail(this.state.userId, weekStart);
            } else {
                this.getStudentAnswerDetail(this.state.userId, start);
            }
        }
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
    //获取用户的信息
    getUserById (ident) {
        var _this = this;
        var param = {
            "method": 'getUserById',
            "ident": ident,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    _this.setState({
                        users: result.response
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }


    /**
    * 获取答题数据折线图
    */
    getStudentAnswerDetail (userId, start) {
        var _this = this;
        var param = {
            "method": "getStudentAnswerDetail",
            "userId": userId,
            "startTime": start,
            "endTime": end,
            "actionName": "watchAction",
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.response) {
                    mescroll.endSuccess();
                    var response = result.response;
                    this.setState({
                        detailData: result.response
                    })
                    _this.buildFaceLineChart(response.answerRight);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {
                // Toast.fail(error, 1);
            }
        });
    }
    //获取爱心
    getLoveCountDetail (userId, start) {
        var _this = this;
        var param = {
            "method": "getLoveCountDetail",
            "userId": userId,
            "startTime": start,
            "endTime": end,
            "actionName": "watchAction",
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.response) {
                    mescroll.endSuccess();
                    var response = result.response;
                    this.setState({
                        detailData: result.response
                    })
                    _this.buildFaceLineChartLove(response.answerRight);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {
                // Toast.fail(error, 1);
            }
        });
    }
    //获取运动
    getSportStepDetail (userId, start) {
        var _this = this;
        var param = {
            "method": "getSportStepDetail",
            "userId": userId,
            "startTime": start,
            "endTime": end,
            "actionName": "watchAction",
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.response) {
                    mescroll.endSuccess();
                    var response = result.response;
                    this.setState({
                        detailData: result.response
                    })
                    _this.buildFaceLineChartStep(response.answerRight);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }

            },
            onError: function (error) {
                // Toast.fail(error, 1);
            }
        });
    }

    /**
    * 答题情况统计
    * @param braceletSportSteps
    */
    buildFaceLineChart = (braceletHeartSteps) => {
        var _this = this;
        var xClazzNameArray = [];
        var AnswerRight = [];
        var AnswerTotal = [];
        var SubjectTotal = [];
        var sumNumberTotal = 0;
        var AnswRightTotal = 0;
        var AnswTotal = 0;
        braceletHeartSteps.forEach((braceletHeartStepObj) => {
            var second = braceletHeartStepObj.x.split(" ")[1];
            var second2 = braceletHeartStepObj.x.split(" ")[0];
            second2 = second2.split("-")[2];
            if (this.state.today == 1) {
                xClazzNameArray.push(second2 + "日");
            } else {
                xClazzNameArray.push(second + ":00");
            }
            var answerRight = braceletHeartStepObj.y1;
            AnswRightTotal += braceletHeartStepObj.y1;
            AnswerRight.push(answerRight);
            var answerTotal = braceletHeartStepObj.y2;
            AnswTotal += braceletHeartStepObj.y2;
            AnswerTotal.push(answerTotal);
            var subjectTotal = braceletHeartStepObj.y3;
            SubjectTotal.push(subjectTotal);
            sumNumberTotal += braceletHeartStepObj.y3;
            xClazzNameArray = unique(xClazzNameArray)

        });
        // console.log(xClazzNameArray,'AnswerTotal')
        // xClazzNameArray=["25日","26日","27日","28日","29日"];
        // AnswerRight=["22.00","11.00"]
        // AnswerTotal=["0.00", "20.00", "0.00", "3.00", "10.00", "20.00", "10.00", "0.00", "10.00", "0.00", "30.00"]
        // SubjectTotal = ["1.00", "3.00", "8.00", "16.00", "50.00", "22.00", "40.00", "33.00", "10.00", "20.00", "10.00", "0.00", "10.00", "0.00", "30.00"]
        var stepOption = _this.buildFaceOption(xClazzNameArray, AnswerRight, AnswerTotal, SubjectTotal)
        var faceChartDiv = <div
        // style={{display:braceletHeartSteps.length == 0 ? "none":"block"}} 
        >
            <div style={{ width: '100%', height: '250px' }} className="echarts_wrap">
                <ReactEcharts
                    option={stepOption}
                    style={{ height: '100%', width: '100%' }}
                    className='' />
            </div>
        </div>;
        _this.setState({
            faceChartDiv,
            dataLegend: [{ name: '答对次数', icon: 'rect', value: AnswRightTotal },
            { name: '答题次数', icon: 'rect', value: AnswTotal },
            { name: '总数', icon: 'rect', value: sumNumberTotal }]
        });
    }

    /**
    * 运动情况统计
    * @param braceletSportSteps
    */
    buildFaceLineChartStep = (braceletHeartSteps) => {
        var _this = this;
        var xClazzNameArray = [];
        var AnswerRight = [];
        var AnswerTotal = [];
        var SubjectTotal = [];
        var sumNumberTotal = 0;
        var AnswRightTotal = 0;
        var AnswTotal = 0;
        braceletHeartSteps.forEach((braceletHeartStepObj) => {
            var second = braceletHeartStepObj.x.split(" ")[1];
            var second2 = braceletHeartStepObj.x.split(" ")[0];
            second2 = second2.split("-")[2];
            if (this.state.today == 0) {
                xClazzNameArray.push(second + ":00");
            } else {
                xClazzNameArray.push(second2 + "日");
            }
            var answerRight = braceletHeartStepObj.y1;
            AnswRightTotal += braceletHeartStepObj.y1;
            AnswerRight.push(answerRight);
            xClazzNameArray = unique(xClazzNameArray)

        });
        var stepOption = _this.buildFaceOptionStep(xClazzNameArray, AnswerRight)
        var faceChartDivStep = <div>
            <div style={{ width: '100%', height: '250px' }} className="echarts_wrap">
                <ReactEcharts
                    option={stepOption}
                    style={{ height: '100%', width: '100%' }}
                    className='' />
            </div>
        </div>;
        _this.setState({
            faceChartDivStep,
            dataLegend: [{ name: '运动步数', icon: 'rect', value: AnswRightTotal }]
        });
    }
    /**
    * 运动情况统计
    * @param braceletSportSteps
    */
    buildFaceLineChartLove = (braceletHeartSteps) => {
        var _this = this;
        var xClazzNameArray = [];
        var AnswerRight = [];
        var AnswerTotal = [];
        var SubjectTotal = [];
        var sumNumberTotal = 0;
        var AnswRightTotal = 0;
        var AnswTotal = 0;
        braceletHeartSteps.forEach((braceletHeartStepObj) => {
            var second = braceletHeartStepObj.x.split(" ")[1];
            var second2 = braceletHeartStepObj.x.split(" ")[0];
            second2 = second2.split("-")[2];
            if (this.state.today == 0) {
                xClazzNameArray.push(second + ":00");
            } else {
                xClazzNameArray.push(second2 + "日");
            }
            var answerRight = braceletHeartStepObj.y1;
            AnswRightTotal += braceletHeartStepObj.y1;
            AnswerRight.push(answerRight);
            xClazzNameArray = unique(xClazzNameArray)

        });
        var stepOption = _this.buildFaceOptionLove(xClazzNameArray, AnswerRight)
        var faceChartDivLove = <div>
            <div style={{ width: '100%', height: '250px' }} className="echarts_wrap">
                <ReactEcharts
                    option={stepOption}
                    style={{ height: '100%', width: '100%' }}
                    className='' />
            </div>
        </div>;
        _this.setState({
            faceChartDivLove,
            dataLegend: [{ name: '爱心总数', icon: 'rect', value: AnswRightTotal }]
        });
    }

    /**
    * 创建折线图的option
    */
    buildFaceOption = (xClazzNameArray, AnswerRight, AnswerTotal, SubjectTotal) => {
        return {
            title: {
                text: '今日答题统计',
                textStyle: {
                    fontSize: 15,
                    fontWeight: 'normal',
                    color: '#fff'          // 主标题文字颜色
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                    lineStyle: {          // 直线指示器样式设置
                        color: '#fff',
                        width: 1,
                        type: 'solid'
                    },
                    label: {
                        backgroundColor: '#6a7985'
                    }
                },
            },
            grid: {
                left: '5',
                right: '5',
                top: '35',
                bottom: '35',//距离下边的距离
                containLabel: true
            },
            legend: {
                show: true,
                itemWidth: 20,
                itemHeight: 6,
                data: [{
                    name: '答对次数', icon: 'rect'
                },
                {
                    name: '答题次数', icon: 'rect'
                },
                {
                    name: '总数', icon: 'rect'
                },
                ],
                formatter: function (name) {
                    var total = 0;
                    var target;
                    for (var i = 0, l = calm.state.dataLegend.length; i < l; i++) {
                        total += calm.state.dataLegend[i].value;
                        if (calm.state.dataLegend[i].name == name) {
                            target = calm.state.dataLegend[i].value;
                        }
                    }
                    return name + '(' + target + ')';
                },
                y: 'bottom',
                x: 'center',
                textStyle: {
                    fontSize: 12,
                    color: '#F1F1F3'
                }
            },
            // toolbox: {
            //     left: 'center',
            //     feature: {
            //         dataZoom: {
            //             yAxisIndex: 'none'
            //         },
            //         restore: {},
            //         saveAsImage: {}
            //     }
            // },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    data: xClazzNameArray,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                            width: 1,
                            type: 'solid'
                        },
                    },

                }
            ],
            yAxis: [
                {
                    type: 'value',
                    minInterval: 1,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                            width: 1,
                            type: 'solid'
                        },
                    },
                }
            ],

            series: [
                {
                    name: '答对次数',
                    type: 'line',
                    // areaStyle: {},
                    // stack: '总量',
                    data: AnswerRight,
                    itemStyle: {
                        //通常情况下：
                        normal: {
                            // color:'rgba(130,231,128,0.4)',
                            color: '#82e780',
                            label: { show: false },
                            lineStyle: {
                                color: '#82e780'
                            }
                        }
                    },
                },
                {
                    name: '答题次数',
                    type: 'line',
                    // areaStyle: {},
                    // stack: '总量',
                    data: AnswerTotal,
                    itemStyle: {
                        //通常情况下：
                        normal: {
                            // color:'rgba(235,222,77,0.4)',
                            color: '#ebde4d',
                            label: { show: false },
                            lineStyle: {
                                color: '#ebde4d'
                            }
                        }
                    },
                },
                {
                    name: '总数',
                    type: 'line',
                    // areaStyle: {},
                    data: SubjectTotal,
                    left: 0,
                    bottom: 0,
                    itemStyle: {
                        //通常情况下：
                        normal: {
                            //    color:'rgba(181,114,8,0.5)',
                            color: '#b57208',
                            label: { show: false },
                            lineStyle: {
                                color: '#b57208'
                            }
                        }
                    },
                }
            ]
        };
    }
    /**
    * 创建折线图的option
    */
    buildFaceOptionLove = (xClazzNameArray, AnswerRight) => {
        return {
            title: {
                text: '今日爱心统计',
                textStyle: {
                    fontSize: 15,
                    fontWeight: 'normal',
                    color: '#fff'          // 主标题文字颜色
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                    lineStyle: {          // 直线指示器样式设置
                        color: '#fff',
                        width: 1,
                        type: 'solid'
                    },
                    label: {
                        backgroundColor: '#6a7985'
                    }
                },
            },
            grid: {
                left: '5',
                right: '5',
                top: '35',
                bottom: '35',//距离下边的距离
                containLabel: true
            },
            legend: {
                show: true,
                itemWidth: 20,
                itemHeight: 6,
                data: [{
                    name: '爱心总数', icon: 'rect'
                }
                ],
                formatter: function (name) {
                    var total = 0;
                    var target;
                    for (var i = 0, l = calm.state.dataLegend.length; i < l; i++) {
                        total += calm.state.dataLegend[i].value;
                        if (calm.state.dataLegend[i].name == name) {
                            target = calm.state.dataLegend[i].value;
                        }
                    }
                    return name + '(' + target + ')';
                },
                y: 'bottom',
                x: 'center',
                textStyle: {
                    fontSize: 12,
                    color: '#F1F1F3'
                }
            },
            // toolbox: {
            //     left: 'center',
            //     feature: {
            //         dataZoom: {
            //             yAxisIndex: 'none'
            //         },
            //         restore: {},
            //         saveAsImage: {}
            //     }
            // },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    data: xClazzNameArray,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                            width: 1,
                            type: 'solid'
                        },
                    },

                }
            ],
            yAxis: [
                {
                    type: 'value',
                    minInterval: 1,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                            width: 1,
                            type: 'solid'
                        },
                    },
                }
            ],

            series: [
                {
                    name: '爱心总数',
                    type: 'line',
                    // areaStyle: {},
                    // stack: '总量',
                    data: AnswerRight,
                    itemStyle: {
                        //通常情况下：
                        normal: {
                            // color:'rgba(130,231,128,0.4)',
                            color: '#82e780',
                            label: { show: false },
                            lineStyle: {
                                color: '#82e780'
                            }
                        }
                    },
                },
            ]
        };
    }
    /**
    * 创建折线图的option
    */
    buildFaceOptionStep = (xClazzNameArray, AnswerRight) => {
        return {
            title: {
                text: '今日运动统计',
                textStyle: {
                    fontSize: 15,
                    fontWeight: 'normal',
                    color: '#fff'          // 主标题文字颜色
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                    lineStyle: {          // 直线指示器样式设置
                        color: '#fff',
                        width: 1,
                        type: 'solid'
                    },
                    label: {
                        backgroundColor: '#6a7985'
                    }
                },
            },
            grid: {
                left: '5',
                right: '5',
                top: '35',
                bottom: '35',//距离下边的距离
                containLabel: true
            },
            legend: {
                show: true,
                itemWidth: 20,
                itemHeight: 6,
                data: [{
                    name: '运动步数', icon: 'rect'
                },

                ],
                formatter: function (name) {
                    var total = 0;
                    var target;
                    for (var i = 0, l = calm.state.dataLegend.length; i < l; i++) {
                        total += calm.state.dataLegend[i].value;
                        if (calm.state.dataLegend[i].name == name) {
                            target = calm.state.dataLegend[i].value;
                        }
                    }
                    return name + '(' + target + ')';
                },
                y: 'bottom',
                x: 'center',
                textStyle: {
                    fontSize: 12,
                    color: '#F1F1F3'
                }
            },
            // toolbox: {
            //     left: 'center',
            //     feature: {
            //         dataZoom: {
            //             yAxisIndex: 'none'
            //         },
            //         restore: {},
            //         saveAsImage: {}
            //     }
            // },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    data: xClazzNameArray,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                            width: 1,
                            type: 'solid'
                        },
                    },

                }
            ],
            yAxis: [
                {
                    type: 'value',
                    minInterval: 1,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(255,255,255,0.2)'
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                            width: 1,
                            type: 'solid'
                        },
                    },
                }
            ],

            series: [
                {
                    name: '运动步数',
                    type: 'line',
                    // areaStyle: {},
                    // stack: '总量',
                    data: AnswerRight,
                    itemStyle: {
                        //通常情况下：
                        normal: {
                            // color:'rgba(130,231,128,0.4)',
                            color: '#82e780',
                            label: { show: false },
                            lineStyle: {
                                color: '#82e780'
                            }
                        }
                    },
                },
            ]
        };
    }

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        console.log(data,"data")
        Bridge.callHandler(data, null, function (error) {
        });
    }
    render () {
        return (
            <div id='detailPage' className='bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">{this.state.today == 0 ? "今日排行榜详情" : "本周排行榜详情"}</span>
                    <span className="am-navbar-right"></span>
                </div>


                    <div className="commonLocation-cont overScroll">
                        <div id="mescroll" className="mescroll">
                            <div id="newsList" className="news-list">
                    {/* <PullToRefresh
                        damping={130}
                        ref={el => this.ptr = el}
                        style={{
                            height: calm.state.clientHeight - 64,
                        }}
                        indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
                        direction='down'
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.setState({ refreshing: true });
                            setTimeout(() => {
                                this.setState({ refreshing: false }, () => {
                                    if (this.state.today == 0) {
                                        this.getStudentAnswerDetail(this.state.userId, start);
                                    } else {
                                        this.getStudentAnswerDetail(this.state.userId, weekStart);
                                    }
                                });
                            }, 1000);
                        }}
                    > */}
                        <div style={{
                            height: calm.state.clientHeight - 64,
                        }}>
                            <div className='grayBorder'></div>
                            <div className='bg_white'>
                                <div className='myDetail line_public p15'>
                                    <img onError={this.src = ""} src={this.state.users ? this.state.users.avatar : ""} />
                                    <div className='textCont'>
                                        <span className='userName text_hidden'>{this.state.users ? this.state.users.userName : ""}</span>
                                        <span className='time'>
                                            {
                                                this.state.today == 0 ?
                                                    <span>{WebServiceUtil.formatMDHM(Date.parse(new Date()))}</span>
                                                    :
                                                    <span>{WebServiceUtil.fun_date(-7)}-{WebServiceUtil.formatMD3(Date.parse(new Date()))}</span>
                                            }
                                        </span>
                                    </div>
                                    <div className='color_9'>{this.state.detailData.clazz ? this.state.detailData.clazz.grade.name + this.state.detailData.clazz.name : ""}</div>

                                </div>
                                <div className="chartCont line_public">
                                    {
                                        this.state.tagType == "love" ? calm.state.faceChartDivLove : this.state.tagType == "step" ? calm.state.faceChartDivStep : calm.state.faceChartDiv
                                    }
                                </div>
                                <div className='textDetail'>
                                    {
                                        this.state.tagType == "answer" ? <div className="line_public item p15">
                                            准确率<span>{this.state.detailData.rigthAccuay ? Math.ceil(this.state.detailData.rigthAccuay * 100) : "0"}% </span>
                                        </div> : ""
                                    }
                                    <div className="line_public item p15">
                                        全班排名<span>{Number(this.state.num)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/* </PullToRefresh> */}
                </div>

			        </div>
		        </div>
             
            </div>
        )
    }
}