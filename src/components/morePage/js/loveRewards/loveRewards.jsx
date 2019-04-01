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
            defaultSteps: 3000,
            defaultAnswerValue: 3,
            defaultRight: 80
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var watchId = locationSearch.split("&")[0].split('=')[1];
        this.setState({
            watchId,
        })

    }
    componentDidMount () {
    }

    toSetSteps = () => {
        $(".steps").show();
    }
    toSetAnswer = () => {
        $(".answers").show()
    }
    toSetRight = () => {
        $(".right").show()
    }

    toCloseSteps = () => {
        $(".steps").hide();
    }
    toCloseAnswer = () => {
        $(".answers").hide()
    }
    toCloseRight = () => {
        $(".right").hide()
    }

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
    addSteps = () => {
        this.state.defaultSteps += 1000;
        this.setState({
            defaultSteps: this.state.defaultSteps
        })
    }

    deAnswer = () => {
        if (this.state.defaultAnswerValue == 0) {
            Toast.info("不能再低了哦", 1, null, false)
            return
        }
        this.state.defaultAnswerValue -= 1;
        this.setState({
            defaultAnswerValue: this.state.defaultAnswerValue
        })
    }
    addAnswer = () => {
        this.state.defaultAnswerValue += 1;
        this.setState({
            defaultAnswerValue: this.state.defaultAnswerValue
        })
    }
    deRight = () => {
        if (this.state.defaultRight == 0) {
            Toast.info("不能再低了哦", 1, null, false)
            return
        }
        this.state.defaultRight -= 1;
        this.setState({
            defaultRight: this.state.defaultRight
        })
    }
    addRight = () => {
        if (this.state.defaultRight == 100) {
            Toast.info("不能再高了哦", 1, null, false)
            return
        }
        this.state.defaultRight += 1;
        this.setState({
            defaultRight: this.state.defaultRight
        })
    }

    toSaveSteps = () => {
        console.log("steps")
    }
    toSaveAnswerSum = () => {
        console.log("answer")
    }
    toSaveRight = () => {
        console.log("right")
    }
    render () {
        return (
            <div id="loveRewards" className='bg_gray publicList_50'>
                <div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetSteps}>
                        <div className="am-list-line">
                            <div className="am-list-content">每日运动目标</div>
                            <div className="am-list-extra">{this.state.defaultSteps}步</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetAnswer}>
                        <div className="am-list-line">
                            <div className="am-list-content">每日答题数</div>
                            <div className="am-list-extra">{this.state.defaultAnswerValue}道题</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.toSetRight}>
                        <div className="am-list-line">
                            <div className="am-list-content">每日答题正确率</div>
                            <div className="am-list-extra">{this.state.defaultRight}%</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                </div>
                <div className='steps step bg_gray publicList_50' style={{ display: "none" }}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toCloseSteps}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">每日运动目标</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div>
                        <span>{this.state.defaultSteps}步</span>
                        目标步数
                    </div>
                    <div>
                        <span onClick={this.toDeSteps}>-</span>
                        <span>{this.state.defaultSteps}</span>
                        <span onClick={this.addSteps}>+</span>
                    </div>
                    <div className="submitBtn" onClick={this.toSaveSteps}>保存</div>
                </div>
                <div className="answers step bg_gray publicList_50" style={{ display: "none" }}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toCloseAnswer}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">目标答题数</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div>
                        <span>{this.state.defaultAnswerValue}道题</span>
                        目标答题数
                    </div>
                    <div>
                        <span onClick={this.deAnswer}>-</span>
                        <span>{this.state.defaultAnswerValue}</span>
                        <span onClick={this.addAnswer}>+</span>
                    </div>
                    <div className="submitBtn" onClick={this.toSaveAnswerSum}>保存</div>
                </div>
                <div className="right step bg_gray publicList_50" style={{ display: "none" }}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.toCloseRight}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">目标正确率</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div>
                        <span>{this.state.defaultRight}%</span>
                        目标正确率
                    </div>
                    <div>
                        <span onClick={this.deRight}>-</span>
                        <span>{this.state.defaultRight}</span>
                        <span onClick={this.addRight}>+</span>
                    </div>
                    <div className="submitBtn" onClick={this.toSaveRight}>保存</div>
                </div>
            </div>
        )
    }
}



