import React from "react";
import {
    DatePicker, List, Picker, InputItem, Toast,
    Modal, WhiteSpace, Switch, Checkbox, Flex
} from 'antd-mobile';

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

const checkedData = [
    { value: 1, label: '星期一', extra: "周一" },
    { value: 2, label: '星期二', extra: "周二" },
    { value: 3, label: '星期三', extra: "周三" },
    { value: 4, label: '星期四', extra: "周四" },
    { value: 5, label: '星期五', extra: "周五" },
    { value: 6, label: '星期六', extra: "周六" },
    { value: 7, label: '星期日', extra: "周日" },
];
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
            allData: []
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var watchId = searchArray[0].split('=')[1];
        this.setState({
            watchId
        })
    }
    componentDidMount () {

    }

    //选择器改变事件
    onPickerChange = (val) => {
        console.log(val, "val")
        this.setState({
            typeValue: val,
        });
    };

    //时间改变
    timeChange = (time) => {
        var tempTime = time + ""
        this.setState({
            time: time
        })
    }
    //取消时间
    onCancel = () => {
        this.setState({
            time: ""
        })
    }

    //闹钟类型改变
    onAlarmChange = (v) => {
        console.log(v, "onAlarmChange")
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
        prompt('请输入关系', '', [
            { text: '取消' },
            {
                text: '确定', onPress: value => {
                    console.log(`输入的内容:${value}`);
                    console.log(value, "value");
                    this.setState({
                        alarmValue: [value],
                    }, () => {
                        console.log(this.state.alarmValue)
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
                console.log(this.state.allData, "allData")
            })
        } else {
            this.state.allData.forEach((v, i) => {
                if (data.value == v.value) {
                    this.state.allData.splice(i, 1);
                }
                this.setState({
                    allData: sortByKey(this.state.allData, "value")
                }, () => {
                    console.log(this.state.allData, "allData")
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
            defaleSelect: this.state.timeArr.length == 0 ? "永不" : this.state.timeArr.join(" ")
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
                    Toast.info("保存成功", 1);
                    setTimeout(function () {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    }, 1000)
                } else {

                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    render () {
        return (
            <div id="addClock">
                <Picker
                    data={alarmType}
                    value={this.state.alarmValue}
                    cols={1}
                    className="forss"
                    extra={this.state.flag ? "请选择" : this.state.alarmValue}
                    onChange={this.onAlarmChange}
                    onOk={this.alarmSure}
                    onDismiss={this.onCancel}
                >
                    <List.Item arrow="horizontal">闹钟类型</List.Item>
                </Picker>
                <DatePicker
                    mode="time"
                    value={this.state.time}
                    onChange={this.timeChange}
                    onDismiss={this.onCancel}
                >
                    <List.Item arrow="horizontal">提醒时间</List.Item>
                </DatePicker>
                <div onClick={this.onRepeat}>重复 <span>{this.state.defaleSelect}</span></div>
                <div style={{ display: this.state.repeatDefault ? "none" : "block" }}>
                    <div><span onClick={this.cancelSelect}>取消</span><span onClick={this.sureSelect}>确定</span></div>
                    <List>
                        {checkedData.map((v, i) => (
                            <CheckboxItem key={v.value} onChange={(checked) => this.onSelectChange(checked, v, i)}>
                                {v.label}
                            </CheckboxItem>
                        ))}
                    </List>
                    {/* {
                        checkedData.map((v, i) => {
                            return <label><input onChange={this.onSelectChange} type="checkbox" value={v.extra} title={v.value} />{v.label}</label>
                        })
                    } */}
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
                <div onClick={this.toSave}>保存</div>
            </div>
        )
    }
}



