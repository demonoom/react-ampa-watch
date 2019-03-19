import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, Link} from 'react-router';
import App from './components/App';
import "./helpers/webServiceUtil";


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
import './index.less';

class Index extends React.Component {
    render() {
        return (
            <div className="body">
                <ul role="nav">
                    <li>
                        <Link
                            to="/clazzOfRingBinding"
                            style={{fontSize: '24px'}}>统计</Link>
                      
                    </li>
                    <li>
                        <Link
                            to="/addWatchInfo?logigType=1"
                            style={{fontSize: '24px'}}>添加手表信息</Link>
                    </li>
                    <li>
                        <Link
                            to="/bindStudentInfo?logigType=1"
                            style={{fontSize: '24px'}}>bindStudentInfo</Link>
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
            <Route path="clazzOfRingBinding" getComponent={clazzOfRingBinding}/>
            <Route path="addWatchInfo" getComponent={addWatchInfo}/>
            <Route path="bindStudentInfo" getComponent={bindStudentInfo}/>
        </Route>
    </Router>, document.getElementById('example')
);
