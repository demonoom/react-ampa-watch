import React from 'react';
import {
    List,
    WhiteSpace,
    Button,
    WingBlank,
    InputItem,
    Modal,
    Toast
} from 'antd-mobile';
import '../css/updateMoralEducation.less';

var updateMoralEdu;
const prompt = Modal.prompt;


export default class updateMoralEducation extends React.Component {
    constructor(props) {
        super(props);
        updateMoralEdu = this;
        this.state = {
            cols: 1,
            data: [],
            showData: {}
        };
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var id = locationSearch.split("&")[0].split("=")[1];
        var name = decodeURI(locationSearch.split("&")[1].split("=")[1]);
        updateMoralEdu.setState({
            "id": id,
            "cName": name
        })
        window.addEventListener('resize', updateMoralEdu.onWindowResize)
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = `${decodeURI(updateMoralEdu.state.cName)}`;
        this.findMoralEducationById(updateMoralEdu.state.id)
    }

    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', updateMoralEdu.onWindowResize)
    }

    /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            updateMoralEdu.setState({
                clientHeight: updateMoralEdu.state.clientHeight
            });
        }, 100)
    }

    /**
     * 查看对应教室ID的德育信息
     */
    findMoralEducationById(id) {
        var _this = this;

        var param = {
            "method": 'findMoralEducationById',
            "id": id,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    _this.setState({
                        "showData": result.response,
                        "health": result.response.health,
                        "politeness": result.response.politeness
                    })
                } else {
                    Toast.fail(result.msg, 3);
                }
            },
            onError: function (error) {
                Toast.info(error);
            }
        });
    }

    /**
     * 提交新增的德育项
     */
    addMoralEducationTableItem = () => {

        var politeness = updateMoralEdu.state.politeness + ''
        var health = updateMoralEdu.state.health + ''

        if (politeness.trim().length == 0) {
            Toast.fail('请填写礼貌评分', 2)
            return
        }
        if (politeness.trim() > 100 || politeness.trim() < 0) {
            Toast.fail('请填写有效的礼貌评分', 3)
            return
        }
        if (health.trim().length == 0) {
            Toast.fail('请填写健康评分', 2)
            return
        }
        if (health.trim() > 100 || health.trim() < 0) {
            Toast.fail('请填写有效的健康评分', 3)
            return
        }
        const param = {
            "method": "updateMoralEducation",
            "moralEducationJson": {
                "id": updateMoralEdu.state.id,
                "health": health,
                "politeness": politeness
            }
        }

        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('修改成功');
                    setTimeout(function () {
                        var data = {
                            method: 'finishForRefresh',
                        };
                        Bridge.callHandler(data, null, function (error) {
                        });
                    }, 1000)
                }
            },
            onError: function (error) {
                message.error(error)
            }
        });
    }


    render() {
        const CustomChildren = ({extra, onClick, children}) => (
            <div className="am-list-item am-list-item-middle"
                 onClick={onClick}
            >
                <div className="am-list-line">
                    <div className="am-list-content">{children}<i className="redStar">*</i></div>
                    <span className="choiceData am-list-extra" style={{float: 'right', color: '#888'}}>{extra}</span>
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>

        );
        return (
            <div id="addMoralEducation" style={{height: updateMoralEdu.state.clientHeight}}>
                {/*选择班级*/}
                {/* <Picker
                    data={this.state.classData}
                    cols={1}
                    value={this.state.classAsyncValue}
                    onPickerChange={this.onClassPickerChange}
                    onOk={this.getClassKey}
                >
                    <List.Item arrow="horizontal"
                               onClick={this.getClazzesByUserId.bind(this, JSON.parse(localStorage.getItem("userIdKey")).userId)}>选择班级<i
                        className="redStar">*</i></List.Item>
                </Picker>
                <WhiteSpace size="lg"/>
                */}
                {/*选择日期*/}
                {/* <DatePicker
                    mode="date"
                    title="选择日期"
                    extra="Optional"
                    value={this.state.customChildValue}
                    onOk={this.onDatePickerChange}
                    onChange={v => this.setState({customChildValue:v})}
                    extra="请选择"
                >
                 <CustomChildren>选择日期</CustomChildren>
                    {/* <List.Item arrow="horizontal">选择日期<i className="redStar">*</i></List.Item> 
                </DatePicker>
                <WhiteSpace size="lg"/> */}
                    <div className='CourseTableArea'>
                    <div className="classSearchResultInfo">
                    <List>
                    <InputItem
                    className="politeValue"
                    clear
                    placeholder="请输入分数"
                    value={updateMoralEdu.state.politeness}
                    onChange={v => {
                    updateMoralEdu.setState({"politeness": v})
                }}
                    ref={el => this.autoFocusInst = el}
                    >班级礼貌评分</InputItem>
                    <InputItem
                    className="healthValue"
                    clear
                    placeholder="请输入分数"
                    value={updateMoralEdu.state.health}
                    onChange={v => {
                    updateMoralEdu.setState({"health": v})
                }}
                    ref={el => this.autoFocusInst = el}
                    >班级健康评分</InputItem>
                    </List>
                    </div>
                    </div>
                    <div className='addCourseButton'>
                    <WhiteSpace size="lg" />
                    <WingBlank>
                    <Button type="warning" onClick={this.addMoralEducationTableItem}>提交</Button>
                    </WingBlank>
                    </div>
                    </div>
                    );
                    }
                }