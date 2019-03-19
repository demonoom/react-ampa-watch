import React from "react";
import {Toast,} from 'antd-mobile';
import '../css/stuAccountRegist.less'

export default class stuAccountRegist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        Toast.info('123');
    }


    render() {
        return (
            <div id="stuAccountRegist">
                stuAccountRegist
            </div>
        )
    }
}



