import React from "react";
import {Map, Polyline} from "react-amap";
import {Toast} from 'antd-mobile';

import '../css/watchTrail.less'

const loadingStyle = {
    position: 'relative',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const Loading = <div className="emptyLoading"><div className="loading-icon"></div><div>正在生成地图...</div></div>;

export default class watchTrail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: {longitude: '116.397477', latitude: '39.908692'},
            zoom: 10,
            map: null,
            path: [],
            type: 0
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
        this.getWatch2gLocationRecordByWatch2gId(0)
    }

    /**
     * 根据手表名称获取历史路径
     * public List<Watch2gLocationRecord> getWatch2gLocationRecordByWatch2gId(String Watch2gId,String type) throws Exception{
     */
    getWatch2gLocationRecordByWatch2gId = (type) => {
        var _this = this;
        var param = {
            "method": 'getWatch2gLocationRecordByWatch2gId',
            "Watch2gId": this.state.macId,
            "actionName": "watchAction",
            "type": type,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.success) {
                        if (!!result.response) {
                            var path = result.response.map((v) => {
                                return {
                                    longitude: v.longitude,
                                    latitude: v.latitude
                                }
                            });

                            _this.setState({
                                path, position: {
                                    longitude: path[0].longitude,
                                    latitude: path[0].latitude
                                }
                            })
                        } else {
                            Toast.info('未查询到记录', 1);
                            _this.setState({path: []})
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

    /**
     * 三天的选择
     */
    timeChoose = (type) => {
        return () => {
            this.getWatch2gLocationRecordByWatch2gId(type);
            this.setState({type});
        };
    };

    popView = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, null);
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

        const lineEvents = {
            created: (ins) => {
                console.log(ins)
            },
            click: () => {
                console.log('line clicked')
            },
        };

        return (
            <div id="watchTrail" style={{height: '100%'}}>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.popView}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">运动轨迹</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="watchTrail-cont">
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
                        <Polyline
                            path={this.state.path}
                            events={lineEvents}
                        />
                        <div id='timeChoose' className='customLayer'>
                        <span className={this.state.type == 0 ? 'select' : ''}
                              onClick={this.timeChoose('0')}>今天</span>
                            <span className="right-line"></span>
                            <span className={this.state.type == 1 ? 'select' : ''}
                                  onClick={this.timeChoose('1')}>昨天</span>
                            <span className="right-line"></span>
                            <span className={this.state.type == 2 ? 'select' : ''}
                                  onClick={this.timeChoose('2')}>前天</span>
                        </div>
                    </Map>
                </div>
            </div>
        )
    }
}



