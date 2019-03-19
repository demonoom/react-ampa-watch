import React from 'react';
import {
    Toast,
    List,
    Radio,
    Modal,
    PullToRefresh,
    Checkbox,
    Flex
} from 'antd-mobile';
import '../css/moralEducation.less'
import { ucs2 } from 'punycode';

const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
const alert = Modal.alert;
const RadioItem = Radio.RadioItem;
var moralEd;

export default class moralEducation extends React.Component {
    constructor(props) {
        super(props);
        moralEd = this;
        this.state = {
            clientHeight: document.body.clientHeight,
            searchData: [],
            calmHeight: document.body.clientHeight - 150
        };
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '德育教室信息列表';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var uid = locationSearch.split("&")[0].split("=")[1];
        this.setState({ "uid": uid });
        //添加对视窗大小的监听,在屏幕转换以及键盘弹起时重设各项高度
        window.addEventListener('resize', moralEd.onWindowResize)
        this.searchClassroomName(uid);
    }

    componentWillUnmount() {
        //解除监听
        window.removeEventListener('resize', moralEd.onWindowResize)
    }

    /**
     * 视窗改变时改变高度
     */
    onWindowResize() {
        setTimeout(function () {
            moralEd.setState({
                clientHeight: document.body.clientHeight,
                calmHeight: document.body.clientHeight - 150
            });
        }, 100)
    }

    /**
     * searchClassroomName搜索班级的名称
     */
    searchClassroomName(uid) {
        var _this = this;
        var param = {
            "method": 'searchClazz',
            "aid": uid,
            "keyWord": "",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' && result.success == true) {
                    moralEd.setState({
                        searchData: result.response
                    })
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.info(error);
            }
        });
    }


    /**
     * 跳转获取ClassId页面
     * @param {*} item
     */

    toAssessMoralE(v) {
        var url = WebServiceUtil.mobileServiceURL + "assessMoralEducation?id=" + v.id + '&cName=' + encodeURI(v.name);
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }

    render() {
        var _this = this;
        return (
            <div id="moralEducation" style={{ height: moralEd.state.clientHeight }}>
                <div className='tableDiv' style={{ height: moralEd.state.clientHeight }}>
                    <div className="noticeMsg_common">请在列表中选择班级进行设置</div>
                    {
                        moralEd.state.searchData.map((v, i) => {
                            return <div className="am-list-item am-list-item-middle" onClick={this.toAssessMoralE.bind(this, v)}>
                                <div className="am-list-line">
                                    <div className="am-list-content">{v.name}</div>
                                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                                </div>
                            </div>
                        })
                    }
                </div>

            </div>
        );
    }
}