import React from "react";
import {Toast, List} from "antd-mobile";
import '../css/addNewLocation.less'
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
            posList.push(
                <Item
                    arrow="horizontal"
                    className="common-space line_public15"
                    multipleLine
                    onClick={() => {
                        _this.intoDetil(v)
                    }}
                    platform="android"
                >
                    <span className="spaceAvatar">
                        <img style={{borderRadius: '50%'}}
                             src={require("../img/ed0364c4-ea9f-41fb-ba9f-5ce9b60802d0.gif")} alt=""/>
                    </span>
                    <span className="space-name text_hidden">{v.homeName}</span>
                    <Brief>{v.homeAddress}</Brief>
                </Item>
            )
        });
        this.setState({posList});
    };

    /**
     * homeAddress: "陕西省西安市雁塔区大雁塔街道大雁塔大雁塔文化休闲景区"
     homeName: "sdsd "
     id: 5
     * @param obj
     */
    intoDetil = (obj) => {
        var url = encodeURI(WebServiceUtil.mobileServiceURL + "updateLocation?id=" + obj.id + '&homeName=' + obj.homeName + '&homeAddress=' + obj.homeAddress);
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    render() {

        return (
            <div id="addNewLocation">
                <div className="am-navbar">
                    <span className="am-navbar-left"><i className="icon-back"></i></span>
                    <span className="am-navbar-title">常用地点</span>
                    <span className="am-navbar-right" onClick={this.addNewPos}>添加</span>
                </div>
                <div className="commonLocation-cont">
                    <div className="WhiteSpace"></div>
                    {this.state.posList}
                </div>
            </div>
        )
    }
}



