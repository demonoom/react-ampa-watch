import React from "react";
import {Map, Polyline} from "react-amap";
import {Toast} from 'antd-mobile';

const arr = [
    {longitude: '116.411743', latitude: '39.916485'},
    {longitude: '117.204551', latitude: '38.993892'},
    {longitude: '114.559940', latitude: '38.039917'},
    {longitude: '115.484404', latitude: '38.882533'},
    {longitude: '117.705878', latitude: '39.899659'},
];

import '../css/watchTrail.less'

const loadingStyle = {
    position: 'relative',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const Loading = <div style={loadingStyle}>正在生成地图...</div>;

export default class watchTrail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: {longitude: '116.397477', latitude: '39.908692'},
            zoom: 7,
            map: null,
            path: arr,
        };
    }

    componentWillMount() {
        // var locationHref = decodeURI(window.location.href);
        // var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        // var userId = locationSearch.split("&")[0].split('=')[1];
        // var mac = locationSearch.split("&")[1].split('=')[1];
        // this.setState({userId, mac});

    }

    componentDidMount() {

    }

    /**
     * 三天的选择
     */
    timeChoose = (type) => {
        return () => {
            console.log(type);
        };
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
                        <span onClick={this.timeChoose('1')}>今天</span>
                        <span onClick={this.timeChoose('2')}>昨天</span>
                        <span onClick={this.timeChoose('3')}>前天</span>
                    </div>
                </Map>
            </div>
        )
    }
}



