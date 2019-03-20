import React from 'react';
import {

} from 'antd-mobile';
import '../css/loginSuccess.less'
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
            loginType,
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

    //进入主页
    toHomePge=()=>{
        console.log("ok")
    }

    render() {
        return (
            <div id="loginSuccess" style={{height: this.state.clientHeight}}>
               {
                   this.state.loginType == 1 ?
                   <div className="p38">
                       <div className="picDiv">
                           <img src={require('../../images/successPic.png')} alt=""/>
                       </div>
                       <div className="success-cont">
                           <div className="success-prompt">注册成功</div>
                           <div className="success-validation">开启守护之旅</div>
                       </div>
                       <div className="submitBtn" onClick={this.toHomePge}>立即开启</div>
                   </div>
                   :
                   <div className="p38">
                       <div className="picDiv">
                           <img src={require('../../images/successPic.png')} alt=""/>
                       </div>
                       <div className="success-cont">
                           <div className="success-prompt">注册成功</div>
                           <div className="success-validation">等待管理员验证</div>
                       </div>
                       <div className="submitBtn" onClick={this.toHomePge}>完成</div>
                   </div>
               }
            </div>
        );
    }
}
