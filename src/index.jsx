import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, Link} from 'react-router';
import App from './components/App';
import "./helpers/webServiceUtil";

//手环绑定的班级列表页
const clazzOfRingBinding = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/classCardSystemBackstage/js/clazzOfRingBinding').default)
    }, 'clazzOfRingBinding')
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
        </Route>
    </Router>, document.getElementById('example')
);
