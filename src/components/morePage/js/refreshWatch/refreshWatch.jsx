import React from "react";
export default class refreshWatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
    }



    //返回
    toBack = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }

  


    render () {
        return (
            <div id="refreshWatch" className='bg_gray publicList_50'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">刷新手表信息</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div>
                    <div>
                        刷新
                        <i>箭头</i>
                    </div>
                    <div>
                        <span>正在刷新手表</span>
                        <span>26%</span>
                    </div>
                </div>
                <div className='icon_bind am-list-item am-list-item-middle line_public15' onClick={this.toGetWatchData}>
                    <div className="am-list-line">
                        <div className="am-list-content">手表获取信息说明</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>

                </div>

            </div>
        )
    }
}



