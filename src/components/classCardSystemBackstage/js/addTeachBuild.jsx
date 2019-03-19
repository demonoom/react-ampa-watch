import React from "react";
import { InputItem, Toast,List,Radio} from 'antd-mobile';
import "../css/addTeachBuild.less"
var addTeachB;
const RadioItem = Radio.RadioItem;
export default class addTeachBuild extends React.Component {
    constructor(props) {
        super(props);
        addTeachB = this;
        this.state = {
            teachBuildValue: ""
        }
    }
    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '添加教学楼页面';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var uid = locationSearch.split("&")[0].split("=")[1];
        addTeachB.setState({
            "uid": uid
        })
    }
    /**
     * 提交新增的教学楼名称
     */
    submitNewTeactBuild() {

        var param;
        if(addTeachB.state.value == undefined){
            param = {
                "method": 'addSchoolBuilding',
                "building": {
                    "name": addTeachB.state.teachBuildValue,
                    "creatorId": addTeachB.state.uid
                }
            };
        }else {
            param = {
                "method": 'addSchoolBuilding',
                "building": {
                    "name": addTeachB.state.teachBuildValue,
                    "creatorId": addTeachB.state.uid,
                    "type":addTeachB.state.value
                }
            };
        }
        console.log(param);
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    addTeachB.setState({
                        "teachBuildValue": ""
                    })
                    Toast.success('提交成功', 1);
                    var data = {
                        method: 'finishForRefresh',
                    };
                    Bridge.callHandler(data, null, function (error) {
                        console.log(error);
                    });
                } else {
                    Toast.fail(result.msg, 3);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }
    /**
     * 是否为危险区的改变
     */
    onChange = (value) => {
        this.setState({
          value,
        });
      };
    render() {
        const data = [
            { value: 1, label: '危险区' },
            { value: 3, label: '打卡区' },
        ];
        return (
            <div id="addTeachBuild">
                <div className='teachBuild'>
                    <InputItem
                        placeholder="请选择教学楼"
                        data-seed="logId"
                        onChange={v => {
                            addTeachB.setState({
                                "teachBuildValue": v
                            })
                        }}
                        value={this.state.teachBuildValue}
                    >教学楼名称<i className='redStar'>*</i></InputItem>
                </div>

                <div className="isDangerArea">
                    <List renderHeader={() => '选择区域：'}>
                        {data.map(i => (
                            <RadioItem key={i.value} checked={this.state.value === i.value} onChange={() => this.onChange(i.value)}>
                                {i.label}
                            </RadioItem>
                        ))}
                    </List>
                </div>
                <div className="bottomBox submitBtn">
                    <span className="submit" onClick={this.submitNewTeactBuild}>提 交</span>
                </div>
            </div>
        )
    }
}