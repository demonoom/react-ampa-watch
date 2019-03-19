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
import '../css/addMoralEducation.less';

var addMoralEdu;
const prompt = Modal.prompt;


export default class addMoralEducation extends React.Component {
    constructor(props) {
        super(props);
        addMoralEdu = this;
        this.state = {
            data: [],
            classData: [],
            clientHeight:document.body.clientHeight
        };
    }
    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var id = locationSearch.split("&")[0].split("=")[1];
        var name = decodeURI(locationSearch.split("&")[1].split("=")[1]);
        this.setState({
            "id": id,
            "name": name
        });
        window.addEventListener('resize', addMoralEdu.onWindowResize)
    }
    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = `${decodeURI(addMoralEdu.state.name)}`;
    }
    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', addMoralEdu.onWindowResize)
    }
     /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            addMoralEdu.setState({
                clientHeight: addMoralEdu.state.clientHeight
            });
        }, 100)
    }
    /**
     * 提交新增的德育项
     */
    addMoralEducationTableItem = () => {
        if (addMoralEdu.state.politeness.trim() == '') {
            Toast.fail('请填写礼貌评分')
            return
        }
        if(addMoralEdu.state.politeness.trim() > 100 || addMoralEdu.state.politeness.trim() < 0){
            Toast.fail('请填写有效的礼貌评分')
            return
        }
        if (addMoralEdu.state.health.trim() == '') {
            Toast.fail('请填写卫生评分')
            return
        }
        if(addMoralEdu.state.health.trim() > 100 || addMoralEdu.state.health.trim() < 0){
            Toast.fail('请填写有效的卫生评分')
            return
        }
        const param = {
            "method": "saveMoralEducation",
            "moralEducationJson": {
                "cid": addMoralEdu.state.id,
                "health": addMoralEdu.state.health,
                "politeness": addMoralEdu.state.politeness,
            }
        }
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    Toast.success('添加成功');
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
                message.error(error);
            }
        });
    }


    /**
     *获取班级的ID
     */
    getClazzesByUserId(id) {
        var _this = this;
        var param = {
            "method": 'getClazzesByUserId',
            "userId": id
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        var arr = [];
                        result.response.forEach(function (v, i) {
                            arr.push({
                                value: v.id, label: v.name
                            })
                        })
                        _this.setState({ classData: arr })
                    }
                }
            },
            onError: function (error) {
                message.error(error)
            }
        });
    }

    render() {
        const CustomChildren = ({ extra, onClick, children }) => (
            <div className="am-list-item am-list-item-middle"
                onClick={onClick}
            >
                <div className="am-list-line">
                    <div className="am-list-content">{children}<i className="redStar">*</i></div>
                    <span className="choiceData am-list-extra" style={{ float: 'right', color: '#888' }}>{extra}</span><div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>

        );
        return (
            <div id="addMoralEducation" style={{ height: addMoralEdu.state.clientHeight }}>
                <div className='CourseTableArea'>
                    <div className="classSearchResultInfo">
                        <List>
                            <InputItem
                                className="politeValue"
                                clear
                                placeholder="请输入分数"
                                onChange={v => {
                                    this.setState({
                                        "politeness": v
                                    })
                                }}
                                ref={el => addMoralEdu.autoFocusInst = el}
                            >班级礼貌评分</InputItem>
                            <InputItem
                                className="healthValue"
                                clear
                                placeholder="请输入分数"
                                onChange={v => {
                                    addMoralEdu.setState({
                                        "health": v
                                    })
                                }}
                                ref={el => this.autoFocusInst = el}
                            >班级卫生评分</InputItem>
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