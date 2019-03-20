import React from "react";
import {Map, Marker} from "react-amap";
import {Toast} from 'antd-mobile';

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

export default class watchPosition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: {longitude: 108.963007, latitude: 34.190036},
        };
    }

    componentDidMount() {

    }

    renderMarker() {
        return <img style={{width: '40px', height: '40px', borderRadius: '50%'}}
                    src={require("../img/ed0364c4-ea9f-41fb-ba9f-5ce9b60802d0.gif")} alt=""/>
    }

    getPosition = () => {
        this.setState({
            position: {
                longitude: 120 + Math.random() * 10 ,
                latitude: 35 + Math.random() * 10
            }
        });
    };

    render() {

        const plugins = [
            {
                name: 'ToolBar', //地图工具条插件，可以用来控制地图的缩放和平移
                options: {
                    onCreated(ins) {
                        // 地图的每个控件都是插件的形式提供，这里可以获得插件的实例
                        console.log(ins);
                    },
                    locate: false
                },
            }
        ];

        return (
            <div id="watchPosition" style={{height: '100%'}}>
                <Map
                    amapkey='2228dcee9965b2922c14f5cd72c3d0cc'
                    version='1.4.13'
                    loading={Loading}
                    plugins={plugins}
                    center={this.state.position}
                    zoom={10}
                >
                    <Marker
                        position={this.state.position}
                        render={this.renderMarker}
                    />
                    <div onClick={this.getPosition} id="getPosition" className="customLayer">
                        寻
                    </div>
                </Map>
            </div>
        )
    }
}



