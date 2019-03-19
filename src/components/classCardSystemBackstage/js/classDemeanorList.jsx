import React from 'react';
import {Icon, Toast} from 'antd-mobile';
import '../css/classDemeanorList.less'

export default class classDemeanorList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var ident = searchArray[0].split('=')[1];
        this.setState({ident})
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = '班级风采列表';
        this.getClazzesByUserId(this.state.ident);
    }

    /**
     * 获取此用户所在班级
     * public List<PBClazz> searchClazzByUserId(String userId, String keyWord)
     */
    getClazzesByUserId(ident) {
        var _this = this;
        var param = {
            "method": 'searchClazzByUserId',
            "userId": ident,
            "keyWord": "",
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    if (WebServiceUtil.isEmpty(result.response) == false) {
                        _this.setState({
                            listData: result.response,
                        })
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }


    toClassDetail(id, name) {
        let url;
        if (id) {
            url = encodeURI(WebServiceUtil.mobileServiceURL + "classDemeanor?ident=" + id + "&className=" + name);
        } else {

        }
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }


    render() {
        let items = [];
        let item = this.state.listData;
        for (var k in item) {
            items.push(<li className="am-list-item am-list-item-middle"
                           onClick={this.toClassDetail.bind(this, item[k].id, item[k].name)}>
                <div className="am-list-line">
                    <div className="am-list-content">
                        {item[k].name}
                    </div>
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>

                </div>
            </li>);
        }
        return (
            <div id="classDemeanorList" style={{height: document.body.clientHeight}}>
                <div className="noticeMsg_common">请在列表中选择班级进行设置</div>
                <ul>
                    {items}
                </ul>
            </div>
        );
    }
}




