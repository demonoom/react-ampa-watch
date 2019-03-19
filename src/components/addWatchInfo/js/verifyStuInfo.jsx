import React from 'react';
import {
    InputItem
} from 'antd-mobile';

export default class verifyStuInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stuName:"",
            schoolName:""
        };
    }

    componentWillMount() {
        document.title = '验证学生账号';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var q = locationSearch.split("&")[0].split('=')[1];
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
    stuOnChange = (value) => {
        console.log(value, "p")
        this.setState({
            stuName: value,

        });
    }
    schoolOnChange=(value)=>{
        console.log(value, "schoolName")
        this.setState({
            schoolName: value,

        });
    }
    submmit=()=>{
        var url = WebServiceUtil.mobileServiceURL + "loginSuccess";
        var data = {
            method: 'openNewPage',
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    render() {
        return (
            <div id="verifyStuInfo" style={{height: this.state.clientHeight}}>
             <h5>验证学生账号</h5>
              <h5>小蚂蚁账号</h5>
             <InputItem
                                className=""
                                placeholder="请输入孩子姓名"
                                value={this.state.stuName}
                                onChange={this.stuOnChange}
            ></InputItem>
              <h5>小蚂蚁账号</h5>
             <InputItem
                                className=""
                                placeholder="输入此账号所在的学校名称"
                                value={this.state.schoolName}
                                onChange={this.schoolOnChange}
                            ></InputItem>
            <div onClick={this.submmit}>确定</div>
            </div>
        );
    }
}
