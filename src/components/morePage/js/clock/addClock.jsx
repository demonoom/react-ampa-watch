import React from "react";
import {
    DatePicker, List, Picker, Toast,
    Modal, Switch, Checkbox, Flex
} from 'antd-mobile';
import '../../css/addClock.less';
import { WatchWebsocketConnection } from '../../../../helpers/watch_websocket_connection';
window.ms = null;
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;

const alert = Modal.alert;
const prompt = Modal.prompt;
const clockType = [{
    value: '震动',
    label: '震动'
}, {
    value: '响铃',
    label: '响铃'
},
{
    value: '震动+响铃',
    label: '震动+响铃'
}]
const alarmType = [
    {
        value: '起床',
        label: '起床'
    },
    {
        value: '出门',
        label: '出门'
    },
    {
        value: '午休',
        label: '午休'
    },
    {
        value: '写作业',
        label: '写作业'
    }, {
        value: '-1',
        label: '自定义'
    }
]
var myDate = new Date();

function sortByKey (array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    })
}
export default class addClock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: "",
            typeValue: ["震动"],
            flag: true,
            checked: false,
            repeatDefault: true,
            defaleSelect: "永不",
            timeArr: [],
            alarmValue: ["起床"],
            time: myDate,
            allData: [],
            checkedData: [
                { value: 1, label: '星期一', extra: "周一" },
                { value: 2, label: '星期二', extra: "周二" },
                { value: 3, label: '星期三', extra: "周三" },
                { value: 4, label: '星期四', extra: "周四" },
                { value: 5, label: '星期五', extra: "周五" },
                { value: 6, label: '星期六', extra: "周六" },
                { value: 7, label: '星期日', extra: "周日" },
            ]
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var watchId = searchArray[0].split('=')[1];
        var ident = searchArray[1].split('=')[1];
        var macAddr = searchArray[2].split('=')[1];
        this.setState({
            watchId,
            macAddr
        })
        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": ident,
                "machineType": "0",
                "version": '1.0',
                // "webDevice": WebServiceUtil.createUUID()
            }
        };
        ms = new WatchWebsocketConnection();
        console.log(pro, "pro")
        ms.connect(pro);
    }
    componentDidMount () {
        this.watchListener();

    }


    //消息监听
    watchListener () {
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {
                Toast.info(warnMsg,1,null,false)
            }, onMessage: function (info) {
                console.log(info, "info")
            }
        };
    }


    //选择器改变事件
    onPickerChange = (val) => {
        this.setState({
            typeValue: val,
        });
    };

    //时间改变
    timeChange = (time) => {
        this.setState({
            time: time
        })
    }
    //取消时间
    onCancel = () => {
        this.setState({
            time: myDate
        })
    }

    //闹钟类型改变
    onAlarmChange = (v) => {
        this.setState({
            alarmValue: v
        })
    }
    //闹钟类型点击确定
    alarmSure = (val) => {
        if (val[0] == -1) {
            $(".am-modal-input input").focus();
            this.showModal()
        }
    }

    //自定义关系
    showModal () {
        this.setState({
            flag: false
        })
        prompt('请输入闹钟名称', '', [
            {
                text: '取消', onPress: () => {
                    this.setState({
                        alarmValue: ["起床"]
                    })
                }
            },
            {
                text: '确定', onPress: value => {
                    this.setState({
                        alarmValue: [value],
                    }, () => {
                    });
                }
            },
        ], 'default', '')
    }

    //开关项
    offChange = (val) => {
        this.setState({
            checked: !this.state.checked,
        });
    }

    //星期的选择
    onSelectChange = (e, data, index) => {
        if (e.target.checked) {
            var allArr = [];
            allArr.push(data)
            this.setState({
                allData: sortByKey(this.state.allData.concat(allArr), "value")
            }, () => {
            })
        } else {
            this.state.allData.forEach((v, i) => {
                if (data.value == v.value) {
                    this.state.allData.splice(i, 1);
                }
                this.setState({
                    allData: sortByKey(this.state.allData, "value")
                }, () => {
                })
            })
        }

    }
    //弹出星期选择框
    onRepeat = () => {
        this.setState({
            repeatDefault: false
        })
    }
    //星期的取消选择
    cancelSelect = () => {
        this.setState({
            repeatDefault: true,
            defaleSelect: this.state.timeArr.length == 0 ? "永不" : this.state.timeArr.join(" "),
        })
    }
    //星期的确定选择
    sureSelect = () => {
        this.state.timeArr = [];
        this.state.allData.forEach((v, i) => {
            this.state.timeArr.push(v.extra);
        })
        this.setState({
            timeArr: this.state.timeArr
        }, () => {
            this.setState({
                defaleSelect: this.state.timeArr.length == 0 ? "永不" : this.state.timeArr.join(" "),
                repeatDefault: true
            })

        })

    }
    //保存
    toSave = () => {
        var param = {
            "method": 'addWatch2gClock',
            "clockType": this.state.alarmValue[0],
            "noticeTime": (this.state.time + "").split(" ")[4],
            "repeatType": JSON.stringify(this.state.timeArr),
            "noticeType": this.state.typeValue[0],
            "watchId": this.state.watchId,
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info("保存成功",1,null,false);
                    var commandJson = {
                        "command": "watch2GClock",
                        data: {
                            "macAddress": this.state.macAddr,
                            "clockStatus": 1,
                            "watch2gClock": result.response,
                        }
                    };
                    console.log(commandJson, "commandJson")
                    ms.send(commandJson);
                    setTimeout(function () {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    }, 1000)
                } else {
                    Toast.fail(result.msg,1,null,false);
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
            <div id="addClock" className='public_list bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">添加闹钟</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont">
                    <div className='grayBorder'></div>
                    <div className='line_public'>
                        <Picker
                            data={alarmType}
                            value={this.state.alarmValue}
                            cols={1}
                            className="forss"
                            extra={this.state.flag ? "请选择" : this.state.alarmValue}
                            onChange={this.onAlarmChange}
                            onOk={this.alarmSure}
                        >
                            <List.Item arrow="horizontal">闹钟类型</List.Item>
                        </Picker>
                    </div>
                    <div className="line_public">
                        <DatePicker
                            mode="time"
                            value={this.state.time}
                            onChange={this.timeChange}
                            onDismiss={this.onCancel}
                        >
                            <List.Item arrow="horizontal">提醒时间</List.Item>
                        </DatePicker>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public repeatBtn' onClick={this.onRepeat}>
                        <div className="am-list-line">
                            <div className="am-list-content">重复</div>
                            <div className="am-list-extra">{this.state.defaleSelect}</div>
                            <div className="am-list-arrow am-list-arrow-horizontal"></div>
                        </div>
                    </div>
                    <div className='checkRepeat maskInnerBt' style={{ display: this.state.repeatDefault ? "none" : "block" }}>
                        <div className='am-picker-popup-header'>
                            <div className='am-picker-popup-item am-picker-popup-header-left' onClick={this.cancelSelect}>取消</div>
                            <div className='am-picker-popup-item am-picker-popup-title'></div>
                            <div className='am-picker-popup-item am-picker-popup-header-right' onClick={this.sureSelect}>确定</div></div>
                        <List>
                            {this.state.checkedData.map((v, i) => (
                                <div className='checkItem line_public'>
                                    <CheckboxItem key={v.value} onChange={(checked) => this.onSelectChange(checked, v, i)}>
                                        {v.label}
                                    </CheckboxItem>
                                </div>
                            ))}
                        </List>
                    </div>
                    <Picker
                        data={clockType}
                        value={this.state.typeValue}
                        cols={1}
                        className="forss"
                        extra={this.state.typeValue}
                        onChange={this.onPickerChange}
                        onOk={this.typeSure}
                        onDismiss={this.onCancel}
                    >
                        <List.Item arrow="horizontal">提醒方式</List.Item>
                    </Picker>
                    {/* <List.Item
                        extra={<Switch
                            checked={this.state.checked}
                            onChange={this.offChange}
                        />}
                    >Off</List.Item> */}
                    <div className='submitBtn' onClick={this.toSave}>保存</div>
                </div>
                    <div className="mask" style={{ display: this.state.repeatDefault ? "none" : "block" }}></div>
            </div>
        )
    }
}



