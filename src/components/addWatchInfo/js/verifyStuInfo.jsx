import React from 'react';
import {
   
} from 'antd-mobile';

export default class verifyStuInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        document.title = '验证学生账号';
        var locationHref = window.location.href;
        var 1 = locationHref.substr(locationHref.indexOf("?") + 1);
        var 2 = locationSearch.split("&")[0].split('=')[1];
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
            teacherV.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }


    render() {
        return (
            <div id="verifyStuInfo" style={{height: this.state.clientHeight}}>
               
            </div>
        );
    }
}
