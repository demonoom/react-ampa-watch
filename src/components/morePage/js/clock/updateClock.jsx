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



function sortByKey (array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    })
}

export default class updateClock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: "",
            flag: true,
            checked: false,
            repeatDefault: true,
            defaleSelect: ["周三", "周四", "周五"].join(""),
            alarmValue: ["yuiouio"],
            typeValue: ["震动"],
            notciceTime: 46762000,
            timeArr: ["周三", "周四", "周五"],
            sendData: [],
            allData:[],
            checkedData:[
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
        var clockId = searchArray[1].split('=')[1];
        var macAddr = searchArray[2].split('=')[1];
        var ident = searchArray[3].split('=')[1];
        this.setState({
            clockId,
            watchId,
            macAddr,
            ident
        })
        this.getInitData(clockId);
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
        ms.connect(pro);
    }
    componentDidMount () {

    }

    //根据ID获取
    getInitData = (clockId) => {
        var param = {
            "method": 'getWatch2gClocksById',
            "watchClockId": clockId,
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    this.setState({
                        defaleSelect: JSON.parse(result.response.repeatType).length == 0 ? "永不" : JSON.parse(result.response.repeatType).join(""),
                        alarmValue: [result.response.clockType],
                        notciceTime: result.response.noticeTime,
                        timeArr: JSON.parse(result.response.repeatType),
                        initTimeArr:JSON.parse(result.response.repeatType),
                        typeValue: [result.response.noticeType],
                        initClockData:result.response
                    }, () => {
                    })
                } else {
                    Toast.fail(result.msg,1,null,false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    //选择器改变事件
    onPickerChange = (val) => {
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
    //点击时间确定
    timeSure = () => {
        this.setState({
            flag: false
        })
    }
    //取消时间
    onCancelTime = () => {
        this.setState({
            time: this.state.time
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
        prompt('请输入关系', '', [
            { text: '取消' },
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
    onSelectChange = (e, data,index) => {
        if (e.target.checked) {
            var arr = [];
            var tempArr = [];
            var allArr = [];
            arr.push(data.extra);
            tempArr.push(data.value);
            allArr.push(data)
            this.setState({
                timeArr: this.state.timeArr.concat(arr),
                sendData: this.state.sendData.concat(tempArr),
                allData:this.state.allData.concat(allArr),
            }, () => {
            })
        } else {
            this.state.timeArr.forEach((v, i) => {
                if (v == data.extra) {
                    this.state.timeArr.splice(i, 1);
                    this.state.sendData.splice(i, 1);
                }
                this.setState({
                    timeArr: this.state.timeArr,
                    sendData: this.state.sendData,
                    allData:this.state.allData
                },()=>{
                })
            })

            this.state.allData.forEach((v,i)=>{
                if(data.value == v.value){
                    this.state.allData.splice(i, 1);
                }
                this.setState({
                    allData:this.state.allData
                })
            })
        }

    }
    //弹出星期选择框
    onRepeat = () => {
        this.setState({
            repeatDefault: false,
            checkedData:this.state.checkedData
        })
    }
    //星期的取消选择
    cancelSelect = () => {
        this.setState({
            repeatDefault: true,
            timeArr:this.state.initTimeArr
        })
    }
    //星期的确定选择
    sureSelect = () => {
        var tempArr = [];
        var timeTempArr = [];
        this.state.checkedData.forEach((v,i)=>{
            if(this.state.timeArr.indexOf(v.extra) != -1){
                tempArr.push(v)
            }
        })
        tempArr = sortByKey(tempArr, "value")
        tempArr.forEach((v,i)=>{
            timeTempArr.push(v.extra)
        })
        this.setState({
            defaleSelect: timeTempArr.length == 0 ? "永不 " : timeTempArr.join(" "),
            timeArr:timeTempArr,
            repeatDefault: true
        })
    }
    //保存
    toSave = () => {
        var param = {
            "method": 'updateWatch2gClock',
            "clockId": this.state.clockId,
            "clockType": this.state.alarmValue[0],
            "noticeTime": this.state.flag ? WebServiceUtil.formatHMS(this.state.notciceTime) : (this.state.time + "").split(" ")[4],
            "repeatType": JSON.stringify(this.state.timeArr),
            "noticeType": this.state.typeValue[0],
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info("修改成功",1,null,false);
                    this.useabledData(this.state.watchId,2)
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


    //删除闹钟
    todelete = () => {
        var param = {
            "method": 'deleteWatch2gClock',
            "clockId": this.state.clockId,
            "actionName": "watchAction",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    Toast.info("删除成功",1,null,false)
                    this.useabledData(this.state.watchId,0)
                    //关闭当前窗口，并刷新上一个页面
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




    /**
     * 删除弹出框
     */
    showAlert = (event) => {
        event.stopPropagation();
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }
        const alertInstance = alert('您确定要删除该闹钟吗?', '', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确定', onPress: () => this.todelete() },
        ], phone);
    };

      //返回
      toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }


     //获取有用的列表
     useabledData=(watchId,isOpen)=>{
        var param = {
            "method": 'getWatch2gClocksByWatchId',
            "watchId":watchId,
            "actionName": "watchAction"
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {
                    var commandJson = {
                        "command": "watch2GClock",
                        data: {
                            "macAddress": this.state.macAddr,
                            "clockStatus": isOpen,
                            "watch2gClock": result.response,
                        }
                    };
                    ms.send(commandJson);
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }
    render () {
        return (
            <div id="addClock" className='publicList_50 bg_gray'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">编辑闹钟</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="commonLocation-cont">
                    <div className='grayBorder'></div>
                    <div className='line_public15'>
                        <Picker
                            data={alarmType}
                            value={this.state.alarmValue}
                            cols={1}
                            className="forss"
                            extra={this.state.alarmValue}
                            onChange={this.onAlarmChange}
                            onOk={this.alarmSure}
                            onDismiss={this.onCancelClock}
                        >
                            <List.Item arrow="horizontal">闹钟类型</List.Item>
                        </Picker>
                    </div>
                    <div className="line_public15">
                        <DatePicker
                            mode="time"
                            extra={WebServiceUtil.formatHM(this.state.notciceTime)}
                            value={this.state.time}
                            onChange={this.timeChange}
                            onOk={this.timeSure}
                            onDismiss={this.onCancelTime}
                        >
                            <List.Item arrow="horizontal">提醒时间</List.Item>
                        </DatePicker>
                    </div>
                    <div className='am-list-item am-list-item-middle line_public15 repeatBtn activeDiv' onClick={this.onRepeat}>
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
                            {this.state.checkedData.map((v,i)=> (
                                <div className='line_public checkItem'>
                                    <CheckboxItem key={v.value} checked={this.state.timeArr.indexOf(v.extra) == -1 ? "" : "checked"} onChange={(checked) => this.onSelectChange(checked, v,i)}>
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
                        onDismiss={this.onCancelType}
                    >
                        <List.Item arrow="horizontal">提醒方式</List.Item>
                    </Picker>
                    {/* <List.Item
                        extra={<Switch
                            checked={this.state.checked}
                            onChange={this.offChange}
                        />}
                    >Off</List.Item> */}

                    <div className='btns my_flex'>
                        <div  className='leftBtn' onClick={this.showAlert}>删除</div>
                        <div className='rightBtn' onClick={this.toSave}>保存</div>
                    </div>
                </div>
                <div className="mask" style={{ display: this.state.repeatDefault ? "none" : "block" }}></div>
            </div>
        )
    }
}



