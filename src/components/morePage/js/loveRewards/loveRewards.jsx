import React from "react";
import {
    InputItem, Toast, DatePicker, Popover,
    Modal, Picker, List, Tabs
} from 'antd-mobile';
import '../../css/loveRewards.less'
const Item = Popover.Item;
const alert = Modal.alert;
export default class loveRewards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultSteps: 0,
            defaultAnswerValue: 0,
            defaultRight: 0,
            defaultId: ""
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watchId = locationSearch.split("&")[0].split('=')[1];
        var studentId = locationSearch.split("&")[1].split('=')[1];
        var bindType = locationSearch.split("&")[2].split('=')[1];
        this.setState({
            watchId, studentId, bindType
        })
        this.getWatch2gLoveOptionByStudentId(studentId)

    }
    //获取默认爱心数／步数／答题率
    getWatch2gLoveOptionByStudentId = (studentId) => {
        var param = {
            "method": 'getWatch2gLoveOptionByStudentId',
            "studentId": studentId,
            "pageNo": -1,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.success && result.response) {
                    this.setState({
                        data: result.response,
                        defaultSteps: result.response[0].optionValue,
                        defaultAnswerValue: result.response[1].optionValue,
                        defaultRight: result.response[2].optionValue
                    })
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    componentDidMount () {
    }

    //设置步数
    toSetSteps = () => {
        $(".steps").show();
        this.setState({
            defaultId: this.state.data[0].id
        }, () => {
        })
    }
    //设置每日答题数
    toSetAnswer = () => {
        $(".answers").show()
        this.setState({
            defaultId: this.state.data[1].id
        }, () => {
        })
    }
    //设置每日答题率
    toSetRight = () => {
        $(".right").show()
        this.setState({
            defaultId: this.state.data[2].id
        }, () => {
            console.log(this.state.defaultId)
        })
    }
    //关闭步数页面
    toCloseSteps = () => {
        $(".steps").hide();
    }
    //关闭答题数
    toCloseAnswer = () => {
        $(".answers").hide()
    }
    //关闭答题率页面
    toCloseRight = () => {
        $(".right").hide()
    }

    //减少步数按钮
    toDeSteps = () => {
        if (this.state.defaultSteps == 3000) {
            Toast.info("不能再低了哦", 1, null, false)
            return
        }
        this.state.defaultSteps -= 1000;
        this.setState({
            defaultSteps: this.state.defaultSteps
        })
    }
    //增加步数按钮
    addSteps = () => {
        if (this.state.defaultSteps == 10000) {
            Toast.info("到达最大值", 1, null, false)
            return
        }
        this.state.defaultSteps += 1000;
        this.setState({
            defaultSteps: this.state.defaultSteps
        })
    }
    //减少答题数
    deAnswer = () => {
        if (this.state.defaultAnswerValue == 1) {
            Toast.info("到达最小值", 1, null, false)
            return
        }
        this.state.defaultAnswerValue -= 1;
        this.setState({
            defaultAnswerValue: this.state.defaultAnswerValue
        })
    }
    //增加答题数按钮
    addAnswer = () => {
        this.state.defaultAnswerValue += 1;
        this.setState({
            defaultAnswerValue: this.state.defaultAnswerValue
        })
    }

    //减少正确率按钮
    deRight = () => {
        if (this.state.defaultRight == 40) {
            Toast.info("到达最小值", 1, null, false)
            return
        }
        this.state.defaultRight -= 10;
        this.setState({
            defaultRight: this.state.defaultRight
        })
    }
    //增加正确率按钮
    addRight = () => {
        if (this.state.defaultRight == 100) {
            Toast.info("到达最大值", 1, null, false)
            return
        }
        this.state.defaultRight += 10;
        this.setState({
            defaultRight: this.state.defaultRight
        })
    }

    //保存步数
    toSaveSteps = () => {
       
        this.setWatch2gLoveOptionById(this.state.defaultSteps)
    }
    //保存答题数
    toSaveAnswerSum = () => {
        this.setWatch2gLoveOptionById(this.state.defaultAnswerValue)

    }
    //保存答题率
    toSaveRight = () => {
        this.setWatch2gLoveOptionById(this.state.defaultRight)
    }
    //设置爱心数据
    setWatch2gLoveOptionById = (optionValue) => {
        var param = {
            "method": 'setWatch2gLoveOptionById',
            "id": this.state.defaultId,
            "optionValue": optionValue,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                console.log(result, "result")
                if (result.success && result.response) {
                    Toast.info("保存成功", 1, null, false);
                    $(".right").hide();
                    $(".steps").hide();
                    $(".answers").hide();
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }
    render () {
        return (
            <div id="loveRewards" className='bg_gray publicList_50'>
                <div className='bg_gray'>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">爱心奖励设置</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="commonLocation-cont">
                        <div className="mask transparent" style={{ display: this.state.bindType == 2 ? "block" : "none" }}></div>
                        <div className="WhiteSpace"></div>
                        <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetSteps}>
                            <div className="am-list-line">
                                <div className="am-list-content">每日运动目标</div>
                                <div className="am-list-extra">{this.state.defaultSteps}步</div>
                                <div className={this.state.bindType == 2 ? "am-list-arrow" : "am-list-arrow am-list-arrow-horizontal"}></div>
                            </div>
                        </div>
                        <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetAnswer}>
                            <div className="am-list-line">
                                <div className="am-list-content">每日答题数</div>
                                <div className="am-list-extra">{this.state.defaultAnswerValue}道题</div>
                                <div className={this.state.bindType == 2 ? "am-list-arrow" : "am-list-arrow am-list-arrow-horizontal"}></div>
                            </div>
                        </div>
                        <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetRight}>
                            <div className="am-list-line">
                                <div className="am-list-content">每日答题正确率</div>
                                <div className="am-list-extra">{this.state.defaultRight}%</div>
                                <div className={this.state.bindType == 2 ? "am-list-arrow" : "am-list-arrow am-list-arrow-horizontal"}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='steps step bg_gray publicList_50' style={{ display: "none" }}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toCloseSteps}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">设置运动目标</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="WhiteSpace"></div>
                    <div className="icon-targetBg">
                        <div className="targetTitle">目标运动步数</div>
                        <div className="targetCont">{this.state.defaultSteps}</div>
                        <div className="targetIcon icon-step"></div>
                    </div>
                    <div className="operation">
                        <span onClick={this.toDeSteps} className="icon-operation icon-Reduction" ></span>
                        <span onClick={this.addSteps} className="icon-operation icon-plusSign"></span>
                    </div>
                    <div className="tags">完成每日目标宝贝可获得2爱心</div>
                    <div className="submitBtn" onClick={this.toSaveSteps}>保存</div>
                    <div className="tags tags-step">研究表明，青少年每天坚持30分钟快走或慢跑（每分钟110步以上）对健康益处较大，推荐每日目标8000步。</div>
                </div>
                <div className="answers step bg_gray publicList_50" style={{ display: "none" }}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toCloseAnswer}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">设置答题目标</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="WhiteSpace"></div>
                    <div className="icon-targetBg">
                        <div className="targetTitle">目标答题数</div>
                        <div className="targetCont">{this.state.defaultAnswerValue}</div>
                        <div className="targetIcon icon-Questions"></div>
                    </div>
                    <div className="operation">
                        <span onClick={this.deAnswer} className="icon-operation icon-Reduction" ></span>
                        <span onClick={this.addAnswer} className="icon-operation icon-plusSign"></span>
                    </div>
                    <div className="tags">完成每日目标宝贝可获得2爱心</div>
                    <div className="submitBtn" onClick={this.toSaveAnswerSum}>保存</div>
                </div>
                <div className="right step bg_gray publicList_50" style={{ display: "none" }}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toCloseRight}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">设置正确率目标</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="WhiteSpace"></div>
                    <div className="icon-targetBg">
                        <div className="targetTitle">目标答题正确率</div>
                        <div className="targetCont">{this.state.defaultRight}%</div>
                        <div className="targetIcon icon-TargetRight"></div>
                    </div>
                    <div className="operation">
                        <span onClick={this.deRight} className="icon-operation icon-Reduction" ></span>
                        <span onClick={this.addRight} className="icon-operation icon-plusSign"></span>
                    </div>
                    <div className="tags">完成每日目标宝贝可获得2爱心</div>
                    <div className="submitBtn" onClick={this.toSaveRight}>保存</div>
                </div>
            </div>
        )
    }
}



