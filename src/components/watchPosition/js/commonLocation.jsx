import React from "react";
import {Toast, List} from "antd-mobile";

const Item = List.Item;
const Brief = Item.Brief;

export default class commonLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posList: [],
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var mac = locationSearch.split("&")[1].split('=')[1];
        var macId = locationSearch.split("&")[2].split('=')[1];
        this.setState({userId, mac, macId});
    }

    componentDidMount() {
        this.getWatch2gHomePoint()
    }

    addNewPos = () => {
        var url = WebServiceUtil.mobileServiceURL + "addNewLocation?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId;
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    /**
     * 查看手表家
     *  public List<Watch2gHomePoint> getWatch2gHomePoint(String watchId)
     */
    getWatch2gHomePoint = () => {
        var _this = this;
        var param = {
            "method": 'getWatch2gHomePoint',
            "actionName": "watchAction",
            "watchId": this.state.macId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.success) {
                        if (!!result.response) {
                            _this.buildPosList(result.response)
                        }
                    }
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    buildPosList = (data) => {
        var _this = this;
        var posList = [];
        data.map((v) => {
            console.log(v);
            posList.push(
                <Item
                    arrow="horizontal"
                    multipleLine
                    onClick={() => {
                        _this.intoDetil(v)
                    }}
                    platform="android"
                >
                    {v.homeName}<Brief>{v.homeAddress}</Brief>
                </Item>
            )
        });
        this.setState({posList});
    };

    intoDetil = (obj) => {
        console.log(obj);
    };

    render() {

        return (
            <div id="commonLocation">
                <div onClick={this.addNewPos}>添加新地点</div>
                <div>
                    {this.state.posList}
                </div>
            </div>
        )
    }
}



