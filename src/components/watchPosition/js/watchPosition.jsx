import React from "react";
import {Map, Marker} from "react-amap";
import {Toast, NavBar, Icon, Popover} from 'antd-mobile';
import {WatchWebsocketConnection} from '../../../helpers/watch_websocket_connection'

import '../css/watchPosition.less'

const loadingStyle = {
    position: 'relative',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const Loading = <div style={loadingStyle}>正在生成地图...</div>;

const Item = Popover.Item;

//消息通信js
window.ms = null;

export default class watchPosition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: {longitude: '116.397477', latitude: '39.908692'},
            zoom: 17,
            map: null,
            visible: false,
            selected: '',
            watchName: '',
            popoverLay: [],
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        this.setState({userId});

        var phone;
        if (navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }

        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": userId,
                "machineType": phone,
                "version": '1.0',
            }
        };
        ms = new WatchWebsocketConnection();
        ms.connect(pro);
        this.msListener();
    }

    componentDidMount() {
        this.getWatch2gsByGuardianUserId()
    }

    /**
     * 查询此人监护的手表列表
     * public List<Watch2g> getWatch2gsByGuardianUserId(String userId, String pageNo)
     */
    getWatch2gsByGuardianUserId = () => {
        var _this = this;
        var param = {
            "method": 'getWatch2gsByGuardianUserId',
            "actionName": "watchAction",
            "userId": this.state.userId,
            "pageNo": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (!!result.response) {
                        _this.buildStuList(result.response)
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

    buildStuList = (data) => {
        var popoverLay = [];
        data.forEach((v) => {
            popoverLay.push(
                (<Item macId={v.id} mac={v.macAddress} key={v.id}>{v.watchName}</Item>)
            );
        });
        this.setState({popoverLay, mac: data[0].macAddress, macId: data[0].id, watchName: data[0].watchName}, () => {
            this.watch2GLocaltionRequest()
        });
        // setTimeout(() => {
        //     this.watch2GLocaltionRequest()
        // }, 300)
    };

    /**
     * 获取手表位置
     */
    watch2GLocaltionRequest = () => {
        var obj = {
            "command": "watch2GLocaltionRequest",
            "data": {"macAddress": this.state.mac, "guardianId": this.state.userId}
        };
        ms.send(obj);
    };

    msListener() {
        var _this = this;
        ms.msgWsListener = {
            onError: function (errorMsg) {
                // Toast.fail(errorMsg)
            }, onWarn: function (warnMsg) {
                // Toast.fail(warnMsg)
            }, onMessage: function (info) {
                if (info.command === 'sendWatch2GLocaltionData') {
                    if (info.data.macAddress == _this.state.mac && info.data.guardianId == _this.state.userId) {
                        if ((info.data.longitude == '0.0' && info.data.latitude == '0.0') || (isNaN(info.data.longitude) && isNaN(info.data.latitude))) {
                            Toast.fail('获取定位失败');
                            return
                        }

                        var position = {
                            "longitude": info.data.longitude,
                            "latitude": info.data.latitude,
                        };
                        _this.setState({position})
                    }
                }
            }
        }
    }

    /**
     * 设置坐标点样式
     * @returns {*}
     */
    renderMarker() {
        return <div className="user-positioning"><img style={{ borderRadius: '50%'}}
                                                      src={require("../img/ed0364c4-ea9f-41fb-ba9f-5ce9b60802d0.gif")}
                                                      alt=""/></div>
    }

    /**
     * 手动获取位置
     */
    getPosition = () => {
        this.state.map.setZoom(17);
        this.watch2GLocaltionRequest();
    };

    /**
     * 获取运动轨迹（跳转）
     */
    getTrail = () => {
        var url = WebServiceUtil.mobileServiceURL + "watchTrail?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    /**
     * 设置点（跳转）
     */
    addSafeAddress = () => {

        var url = WebServiceUtil.mobileServiceURL + "commonLocation?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    onSelect = (opt) => {
        this.setState({
            watchName: opt.props.children,
            visible: false,
            // selected: opt.props.value,
            mac: opt.props.mac,
            macId: opt.props.macId,
        }, () => {
            this.watch2GLocaltionRequest();
            this.state.map.setZoom(17);
        });
    };

    render() {

        const plugins = [
            {
                name: 'ToolBar', //地图工具条插件，可以用来控制地图的缩放和平移
                options: {
                    locate: false
                },
            }
        ];

        const events = {
            created: (ins) => {
                this.setState({map: ins})
            }
        };

        return (
            <div id="watchPosition" style={{height: '100%'}}>
                <NavBar
                    mode="light"
                    leftContent={
                        <Popover mask
                                 overlayClassName="fortest"
                                 overlayStyle={{color: 'currentColor'}}
                                 visible={this.state.visible}
                                 placement="bottomLeft"
                                 overlay={this.state.popoverLay}
                                 align={{
                                     overflow: {adjustY: 0, adjustX: 0},
                                     offset: [10, 0],
                                 }}
                                 onVisibleChange={(visible) => {
                                     this.setState({
                                         visible,
                                     });
                                 }}
                                 onSelect={this.onSelect}
                        >
                            <div style={{
                                height: '100%',
                                padding: '0',
                                marginRight: '-15px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <i className="icon-back"></i>{this.state.watchName}
                            </div>
                        </Popover>
                    }
                >
                    定位
                </NavBar>
                <div className="map-cont">
                    <Map
                        amapkey={WebServiceUtil.amapkey}
                        version={WebServiceUtil.version}
                        loading={Loading}
                        plugins={plugins}
                        center={this.state.position}
                        zoom={this.state.zoom}
                        showBuildingBlock={true}
                        buildingAnimation={true}
                        viewMode='3D'
                        events={events}
                        rotateEnable={false}
                    >
                        <Marker
                            position={this.state.position}
                            render={this.renderMarker}
                        />
                        <div onClick={this.getPosition} id="getPosition" className="customLayer">
                            <i className="icon-positioning"></i>
                        </div>
                        <div className="orbital-position">
                            <div onClick={this.getTrail} id="getTrail" className="customLayer line_public">
                            </div>
                            <div onClick={this.addSafeAddress} id="safeAddress" className="customLayer">
                            </div>
                        </div>

                    </Map>
                </div>

            </div>
        )
    }
}



