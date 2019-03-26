import React from "react";
import ReactEcharts from 'echarts-for-react';
import '../css/detailPage.less';
import '../css/macarons';
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
            detailData: {}
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
        this.setState({
            userId,
            today
        })
        this.getUserById(userId)
        if(today == 1){
            this.getStudentAnswerDetail(userId,start);
        }else {
            this.getStudentAnswerDetail(userId,weekStart);
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
        setTimeout(function () {
            this.setState({ clientHeight: document.body.clientHeight });
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
                }else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }


    /**
    * 获取表情数据折线图
    */
    getStudentAnswerDetail (userId,start) {
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
                if(result.response){
                    var response = result.response;
                    this.setState({
                        detailData: result.response
                    })
                    _this.buildFaceLineChart(response.answerRight);
                }else {
                    Toast.fail(result.msg, 1);
                }
               
            },
            onError: function (error) {
                // Toast.fail(error, 1);
            }
        });
    }

    /**
    * 情况统计
    * @param braceletSportSteps
    */
    buildFaceLineChart = (braceletHeartSteps) => {
        var _this = this;
        var xClazzNameArray = [];
        var AnswerRight = [];
        var AnswerTotal = [];
        var SubjectTotal = [];
        braceletHeartSteps.forEach((braceletHeartStepObj) => {
            var second = braceletHeartStepObj.x.split(" ")[1];
            var second2 = braceletHeartStepObj.x.split(" ")[0];
            second2 = second2.split("-")[2];
            if (this.state.today == 1) {
                xClazzNameArray.push(second + ":00");
            } else {
                xClazzNameArray.push(second2 + "日");
            }
            var answerRight = braceletHeartStepObj.y1;
            AnswerRight.push(answerRight.toFixed(2));
            var answerTotal = braceletHeartStepObj.y2;
            AnswerTotal.push(answerTotal.toFixed(2));
            var subjectTotal = braceletHeartStepObj.y3;
            SubjectTotal.push(subjectTotal.toFixed(2));
            xClazzNameArray = unique(xClazzNameArray)

        });
        // console.log(xClazzNameArray,'xx')
        // xClazzNameArray=["25日","26日","27日","28日"]
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
        _this.setState({ faceChartDiv });
    }

    /**
  * 创建折线图的option
  */
    buildFaceOption = (xClazzNameArray, AnswerRight, AnswerTotal, SubjectTotal) => {
        return {
            title:{
                text:'今日答题统计',
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
                left:'8%',
                right:'5%',
                top:'40',
                bottom: '10%',//距离下边的距离
            },
            // legend: {
            //     show: false,
            //     data: [],
            //     bottom: 0,
            //     right: '0',
            // },
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
                    name: '总数',
                    type: 'line',
                    areaStyle: {},
                    smooth: true,
                    data: AnswerRight,
                    left: 0,
                    bottom: 0,
                    symbolSize: 3,
                    itemStyle: {
                        //通常情况下：
                       normal:{
                           color:'#49c6ff',
                           lineStyle:{
                               color:'#49c6ff'
                           }
                       }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                        }
                    }
                },
                {
                    name: '答题次数',
                    type: 'line',
                    areaStyle: {},
                    // stack: '总量',
                    data: AnswerTotal,
                    itemStyle: {
                        //通常情况下：
                        normal:{
                            color:'#d615f5',
                            lineStyle:{
                                color:'#d615f5'
                            }
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                        }
                    }
                },
                {
                    name: '答对次数',
                    type: 'line',
                    areaStyle: {},
                    // stack: '总量',
                    data: SubjectTotal,
                    itemStyle: {
                        //通常情况下：
                        normal:{
                            color:'#6be6c1',
                            lineStyle:{
                                color:'#6be6c1'
                            }
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                        }
                    }
                }
            ]
        };
    }
    render () {
        return (
            <div id='detailPage'>
                <div className="am-navbar">
                    <span className="am-navbar-left"><i className="icon-back"></i></span>
                    <span className="am-navbar-title">今日排行榜详情</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont overScroll">
                    <div className='grayBorder'></div>
                    <div className='bg_white'>
                        <div className='myDetail line_public p15'>
                            <img src={this.state.users ? this.state.users.avatar : ""} />
                            <div className='textCont'>
                                <span className='userName text_hidden'>{this.state.users ? this.state.users.userName : ""}</span>
                                <span  className='time'>
                            {
                                this.state.today == 1 ?
                                    <span>{WebServiceUtil.formatMDHM(Date.parse(new Date()))}</span>
                                    :
                                    <span>{WebServiceUtil.fun_date(-7)}-{WebServiceUtil.formatMD3(Date.parse(new Date()))}</span>
                            }
                        </span>
                            </div>
                            <div className='color_9'>{this.state.detailData.clazz ? this.state.detailData.clazz.grade.name + this.state.detailData.clazz.name : ""}</div>

                        </div>
                        <div className="chartCont line_public">
                            {calm.state.faceChartDiv}
                        </div>
                        <div className='textDetail'>
                            <div className="line_public item p15">
                                准确率<span>{Math.ceil(this.state.detailData.rigthAccuay * 100)}%</span>
                            </div>
                            <div className="line_public item p15">
                                全班排名<span>{this.state.detailData.totalClassTop}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}