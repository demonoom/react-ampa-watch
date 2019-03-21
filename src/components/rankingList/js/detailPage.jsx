import React from "react";
import ReactEcharts from 'echarts-for-react';
import { } from 'antd-mobile';
var calm;
export default class detailPage extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            faceChartDiv: [],
        };
    }
    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '运动排行列表详情页';
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', this.onWindowResize);
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        this.getClassFaceEmotionByVidLineChart(111)
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
     * 获取表情数据折线图
     */
    getClassFaceEmotionByVidLineChart(vId) {
        var _this = this;
        var param = {
            "method": "getClassFaceEmotionByVidLineChart",
            "vid": vId
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                var response = result.response;
                _this.buildFaceLineChart(response);
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

    var AttentionArr = [];
    var ConfuseArr = [];
    var ThinkArr = [];
    var JoyArr = [];
    var UnderstandArr = [];
    var SupersizeArr = [];

    braceletHeartSteps.forEach(function (braceletHeartStepObj) {
        var second = braceletHeartStepObj.second;
        xClazzNameArray.push(WebServiceUtil.formatHMS(second));

        var attention = braceletHeartStepObj.attention;
        AttentionArr.push(attention.toFixed(2));
        var confuse = braceletHeartStepObj.confuse;
        ConfuseArr.push(confuse.toFixed(2));
        var thinking = braceletHeartStepObj.thinking;
        ThinkArr.push(thinking.toFixed(2));
        var joy = braceletHeartStepObj.joy;
        JoyArr.push(joy.toFixed(2));
        var understand = braceletHeartStepObj.understand;
        UnderstandArr.push(understand.toFixed(2));
        var surprise = braceletHeartStepObj.surprise;
        SupersizeArr.push(surprise.toFixed(2));
    });
    var stepOption = _this.buildFaceOption(xClazzNameArray, AttentionArr, ConfuseArr, ThinkArr, JoyArr, UnderstandArr, SupersizeArr)
    var faceChartDiv = <div
    // style={{display:braceletHeartSteps.length == 0 ? "none":"block"}} 
    >
        <div style={{ width: '100%', height: '300px' }} className="echarts_wrap">
            <ReactEcharts
                option={stepOption}
                style={{ height: '100%', width: '100%' }}
                theme='macarons'
                className='' />
        </div>
    </div>;
    _this.setState({ faceChartDiv });
}

    /**
  * 创建折线图的option
  */
 buildFaceOption = (xClazzNameArray, AttentionArr, ConfuseArr, ThinkArr, JoyArr, UnderstandArr, SupersizeArr) => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                lineStyle: {          // 直线指示器样式设置
                    color: '#888',
                    width: 1,
                    type: 'solid'
                },
            },
        },
        legend: {
            show: false,
            data: [],
            bottom: 0,
            right: '5',
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
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#888',
                        width: 1,
                        type: 'solid'
                    },
                },
                axisLabel: {
                    textStyle: {
                        color: '#fff',
                        fontSize: 38
                    },
                    //这个是倾斜角度，也是考虑到文字过多的时候，方式覆盖采用倾斜
                    rotate: 0,
                    //这里是考虑到x轴文件过多的时候设置的，如果文字太多，默认是间隔显示，设置为0，标示全部显示，当然，如果x轴都不显示，那也就没有意义了
                    interval: 'auto',
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#888',
                        width: 1,
                        type: 'solid'
                    },
                },


            }
        ],
        // toolbox: {
        //     left: 'right',
        //     feature: {
        //         dataZoom: {
        //             yAxisIndex: 'none'
        //         },
        //         restore: {},
        //         saveAsImage: {}
        //     }
        // },
        series: [
            {
                name: 'attention',
                type: 'line',
                smooth: true,
                data: AttentionArr,
                left: 0,
                bottom: 0,
                symbolSize: 6,
                // markLine: {
                //     silent: true,
                //     data: [{
                //         yAxis: 90
                //     }]
                // },
                itemStyle: {
                    //通常情况下：
                    normal: {
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: '#FFC107'
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
                name: 'confuse',
                type: 'line',
                // stack: '总量',
                data: ConfuseArr,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                    }
                }
            },
            {
                name: 'think',
                type: 'line',
                // stack: '总量',
                data: ThinkArr,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                    }
                }
            },
            {
                name: 'joy',
                type: 'line',
                // stack: '总量',
                data: JoyArr,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                    }
                }
            },
            {
                name: 'understand',
                type: 'line',
                // stack: '总量',
                data: UnderstandArr,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                    }
                }
            },
            {
                name: 'supersize',
                type: 'line',
                // stack: '总量',
                data: SupersizeArr,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                    }
                }
            },
        ]
    };
}


    render(){
        
        return (
            <div>
                <div>布拉布拉</div>
                <div>
                    准确率：<span>80%</span>
                    全班排名:<span>12</span>
                </div>
                <div>今日答题统计</div>
                    {calm.state.faceChartDiv}
              iiiiis
            </div>
        )
    }
}