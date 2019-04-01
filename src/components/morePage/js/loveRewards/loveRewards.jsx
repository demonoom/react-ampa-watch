import React from "react";
import {
    InputItem, Toast, DatePicker, Popover,
    Modal, Picker, List, Tabs
} from 'antd-mobile';
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
            <div id="loveRewards" className='bg_gray'>
                <div>
                    <div>爱心奖励设置</div>
                    <div onClick={this.toSetSteps}>
                        每日运动目标<span>{this.state.defaultSteps}步</span>
                    </div>
                    <div onClick={this.toSetAnswer}>
                        每日答题数<span>{this.state.defaultAnswerValue}道题</span>
                    </div>
                    <div onClick={this.toSetRight}>
                        每日答题正确率<span>{this.state.defaultRight}%</span>
                    </div>
                </div>
                <div className="steps" style={{ display: "none" }}>
                    <span onClick={this.toCloseSteps}>返回</span>
                    <div>
                        <span>{this.state.defaultSteps}步</span>
                        目标步数
                    </div>
                    <div>
                        <span onClick={this.toDeSteps}>-</span>
                        <span>{this.state.defaultSteps}</span>
                        <span onClick={this.addSteps}>+</span>
                    </div>
                    <div onClick={this.toSaveSteps}>保存</div>
                </div>
                <div className="answers" style={{ display: "none" }}>
                    <span onClick={this.toCloseAnswer}>返回</span>
                    <div>
                        <span>{this.state.defaultAnswerValue}道题</span>
                        目标答题数
                    </div>
                    <div>
                        <span onClick={this.deAnswer}>-</span>
                        <span>{this.state.defaultAnswerValue}</span>
                        <span onClick={this.addAnswer}>+</span>
                    </div>
                    <div onClick={this.toSaveAnswerSum}>保存</div>
                </div>
                <div className="right" style={{ display: "none" }}>
                    <span onClick={this.toCloseRight}>返回</span>
                    <div>
                        <span>{this.state.defaultRight}%</span>
                        目标正确率
                    </div>
                    <div>
                        <span onClick={this.deRight}>-</span>
                        <span>{this.state.defaultRight}</span>
                        <span onClick={this.addRight}>+</span>
                    </div>
                    <div onClick={this.toSaveRight}>保存</div>
                </div>
            </div>
        )
    }
}



