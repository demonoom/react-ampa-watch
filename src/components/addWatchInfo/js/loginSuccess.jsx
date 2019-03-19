import React from 'react';
import {
   
} from 'antd-mobile';

export default class loginSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        document.title = '注册成功';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var loginType = searchArray[0].split('=')[1];
        this.setState({
            loginType
        })
    }
    componentDidMount(){
        Bridge.setShareAble("false");
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize() {
        // this
        setTimeout(() => {
            this.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }


    render() {
        return (
            <div id="loginSuccess" style={{height: this.state.clientHeight}}>
               {/* {
                   this.state.loginType == 1 ?
                   <div>
                       <span>注册成功</span>
                       <span>开启守护之旅</span>
                       <span>马上进入</span>
                   </div>
                   :
                   <div>
                       <span>注册成功</span>
                       <span>等待管理员验证</span>
                   </div>
               } */}
            </div>
        );
    }
}
