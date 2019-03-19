import React from 'react';
import {List, WhiteSpace, DatePicker, InputItem, WingBlank, Button, Toast} from 'antd-mobile';
import '../css/definedTerm.less'

const nowTimeStamp = Date.now();
const now = new Date(nowTimeStamp);

export default class definedTerm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            startDate: now,
            startDateTime: WebServiceUtil.formatYMD(new Date(now).getTime()),
            endDate: now,
            endDateTime: WebServiceUtil.formatYMD(new Date(now).getTime()),
            inputValue: '',
        };
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '自定义学期';
    }

    /**
     * 开始时间确定的回调
     */
    startDateOnOk(v) {
        this.setState({startDateTime: WebServiceUtil.formatYMD(new Date(v).getTime())})
    }

    /**
     * 结束时间确定的回调
     * @param v
     */
    endDateOnOk(v) {
        this.setState({endDateTime: WebServiceUtil.formatYMD(new Date(v).getTime())})
    }

    /**
     * 学期名称输入的回调
     * @param e
     */
    inputOnChange(e) {
        this.setState({inputValue: e})
    }

    /**
     * 提交的回调
     */
    addCourseTableItem = () => {
        var inputValue = this.state.inputValue;
        var startDateTime = this.state.startDateTime;
        var endDateTime = this.state.endDateTime;
        if (WebServiceUtil.isEmpty(inputValue)) {
            Toast.fail('请确定已选择时间并填写学期名称',3);
            return
        }
        if (startDateTime === endDateTime) {
            Toast.fail('日期设置错误,请检查',3);
            return
        }
        var time = new Date().getFullYear() + '';
        if (time - startDateTime.substr(0, 4) > 0 || time - endDateTime.substr(0, 4) > 0) {
            Toast.fail('无法选择今年之前的日期', 5);
            return
        }
        var param = {
            "method": 'addSemester',
            "term":
                {
                    "creatorId": JSON.parse(localStorage.getItem('loginUserSchedule')).colUid,
                    "name": inputValue,
                    "begin": startDateTime,
                    "end": endDateTime
                }
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    //添加成功
                    Toast.success('添加成功');
                    setTimeout(function () {
                        var data = {
                            method: 'finish',
                        };

                        Bridge.callHandler(data, null, function (error) {
                            // Toast.fail(error);
                            console.log(error);
                        });
                    }, 1000)
                } else {
                    Toast.fail(result.msg,3)
                }
            },
            onError: function (error) {
                // message.error(error);
            }
        });
    }

    render() {
        return (
            <div id="definedTerm" style={{height: document.body.clientHeight}}>
                <WhiteSpace size="lg"/>
                <DatePicker
                    mode="date"
                    extra="Optional"
                    value={this.state.startDate}
                    onChange={date => this.setState({startDate: date})}
                    onOk={v => this.startDateOnOk(v)}
                >
                    <List.Item arrow="horizontal">学期开始时间</List.Item>
                </DatePicker>
                <WhiteSpace size="lg"/>
                <DatePicker
                    mode="date"
                    extra="Optional"
                    value={this.state.endDate}
                    onChange={date => this.setState({endDate: date})}
                    onOk={v => this.endDateOnOk(v)}
                >
                    <List.Item arrow="horizontal">学期结束时间</List.Item>
                </DatePicker>
                <WhiteSpace size="lg"/>
                <InputItem
                    placeholder="请输入学期名称"
                    onChange={this.inputOnChange.bind(this)}
                    value={this.state.inputValue}
                >学期名称</InputItem>
                <div className='addCourseButton'>
                    <WhiteSpace size="lg"/>
                    <WingBlank>
                        <Button type="warning" onClick={this.addCourseTableItem}>提交</Button>
                    </WingBlank>
                </div>
            </div>
        );
    }
}
