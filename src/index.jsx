import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, Link} from 'react-router';
import App from './components/App';
import "./helpers/webServiceUtil";

/**
 * 注册学生账号
 * @param location
 * @param cb
 */
const stuAccountRegist = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/stuAccountRegist/js/stuAccountRegist').default)
    }, 'stuAccountRegist')
};

/**添加手表信息 */
const addWatchInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/addWatchInfo').default)
    }, 'addWatchInfo')
};

const bindStudentInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/bindStudentInfo').default)
    }, 'bindStudentInfo')
};

const verifyStuInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/verifyStuInfo').default)
    }, 'verifyStuInfo')
};

const loginSuccess = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/loginSuccess').default)
    }, 'verifyStuInfo')
};

//更多页面
const morePage =(location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/morePage').default)
    }, 'morePage')
};

const validationMes = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/stuAccountRegist/js/validationMes').default)
    }, 'bindStudentInfo')
};

const watchPosition = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/watchPosition/js/watchPosition').default)
    }, 'watchPosition')
};

import './index.less';

class Index extends React.Component {
    render() {
        return (
            <div className="body">
                <ul role="nav">
                    <li>
                        <Link
                            to="/addWatchInfo?userId=23836"
                            style={{fontSize: '24px'}}>添加手表信息</Link>
                    </li>
                    <li>
                        <Link
                            to="/stuAccountRegist"
                            style={{fontSize: '24px'}}>注册学生账号</Link>
                    </li>
                    <li>
                        <Link
                            to="/morePage"
                            style={{fontSize: '24px'}}>morePage</Link>
                    </li>
                </ul>
            </div>
        );
    }
}

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            {
                <IndexRoute component={Index}/>
            }
            <Route path="addWatchInfo" getComponent={addWatchInfo}/>
            <Route path="bindStudentInfo" getComponent={bindStudentInfo}/>
            <Route path="verifyStuInfo" getComponent={verifyStuInfo}/>
            <Route path="loginSuccess" getComponent={loginSuccess}/>
            <Route path="stuAccountRegist" getComponent={stuAccountRegist}/>
            <Route path="validationMes" getComponent={validationMes}/>
            <Route path="morePage" getComponent={morePage}/>
            <Route path="watchPosition" getComponent={watchPosition}/>
        </Route>
    </Router>, document.getElementById('example')
);
