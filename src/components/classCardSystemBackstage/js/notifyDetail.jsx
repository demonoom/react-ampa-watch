import React from 'react';
import {Card, Toast} from 'antd-mobile';
import '../css/notifyDetail.less'

export default class notifyDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
        };
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var locationSearchArray = locationSearch.split("&");
        var locationSearchId = locationSearchArray[0].split("=")[1];
        this.getClassBrandStudentDutyById(locationSearchId);
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        document.title = "通知详情";
    }

    getClassBrandStudentDutyById(id) {
        var param = {
            "method": 'getClassBrandNoticeListById',
            "id": id,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.msg == '调用成功' || result.success) {
                    this.setState({
                        data: result.response
                    })
                }
            },
            onError: function (error) {
                Toast.info('获取详情失败', error);
            }
        });
    }

    render() {
        return (
            <div id="notifyDetail" style={{height: document.body.clientHeight}}>
                <Card title={"卡片标题"} className="card">
                    <p className="createDate">{this.state.data.createTime}</p>
                    <div className="content" style={{maxHeight: document.body.clientHeight - 85}}>
                        <p className="title" dangerouslySetInnerHTML={{ __html: this.state.data.noticeTitle }}></p>
                        <div className="text" dangerouslySetInnerHTML={{ __html: this.state.data.noticeContent }}></div>
                    </div>
                </Card>
            </div>
        );
    }
}
