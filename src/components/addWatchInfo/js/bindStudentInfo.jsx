import React from 'react';
import {
    InputItem,
} from 'antd-mobile';

export default class bindStudentInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            littleAntName: "",
        };
    }

    componentWillMount () {
        document.title = '绑定学生账号';
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var f = locationSearch.split("&")[0].split('=')[1];
    }
    componentDidMount () {
        Bridge.setShareAble("false");
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize () {
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
            littleAntName: value,

        });
    }


    render () {
        return (
            <div id="bindStudentInfo" style={{ height: this.state.clientHeight }}>
                <h5>绑定学生账号</h5>
                <InputItem
                    className=""
                    placeholder="请输入小蚂蚁"
                    value={this.state.littleAntName}
                    onChange={this.stuOnChange}
                ></InputItem>
            </div>
        );
    }
}
