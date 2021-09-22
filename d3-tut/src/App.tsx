import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';

import { FaApple, FaBusAlt, FaBullhorn, FaCashRegister } from 'react-icons/fa';
import { BsAlarm, BsArrowBarUp, BsBook } from 'react-icons/bs';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Base = lazy(() => import(/* webpackChunkName: "base" */ './d3tut/Base'));
const BaseTree = lazy(() => import(/* webpackChunkName: "base_tree" */ './d3tut/BaseTree'));
const BaseGauge = lazy(() => import(/* webpackChunkName: "base_gauge" */ './d3tut/BaseGauge'));
const FilterLine = lazy(() => import(/* webpackChunkName: "filter_line" */ './d3tut/FilterLine'));
const BaseRealDataChart = lazy(
    () => import(/* webpackChunkName: "base_real_data_chart" */ './d3tut/BaseRealDataChart')
);
const RacingBar = lazy(() => import(/* webpackChunkName: "racing_bar" */ './d3tut/RacingBar'));
const BaseLine = lazy(() => import(/* webpackChunkName: "base_line" */ './d3tut/BaseLine'));
const BaseBar = lazy(() => import(/* webpackChunkName: "base_bar" */ './d3tut/BaseBar'));
const ZoomableLine = lazy(() => import(/* webpackChunkName: "zoomable_line" */ './d3tut/ZoomableLine'));

function App() {
    return (
        <div className="App">
            <Router>
                <header className="App-header" style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Link to="/">
                        <BsAlarm />
                    </Link>
                    <Link to="/tree">
                        <FaApple />
                    </Link>
                    <Link to="/gauge">
                        <FaBusAlt />
                    </Link>
                    <Link to="/filterline">
                        <FaBullhorn />
                    </Link>
                    <Link to="/realdata">
                        <FaCashRegister />
                    </Link>
                    <Link to="/racebar">
                        <BsArrowBarUp />
                    </Link>
                    <Link to="/line">
                        <BsBook />
                    </Link>
                    <Link to="/bar">
                        <MdVisibilityOff />
                    </Link>
                    <Link to="/zoomline">
                        <MdVisibility />
                    </Link>
                </header>
                <div className="cont">
                    <Suspense fallback={<div>Page is Loading...</div>}>
                        {/* todo */}
                        <Switch>
                            <Route path="/" exact>
                                <Base />
                            </Route>
                            <Route path="/tree" exact>
                                <BaseTree />
                            </Route>
                            <Route path="/gauge" exact>
                                <BaseGauge />
                            </Route>
                            <Route path="/filterline" exact>
                                <FilterLine />
                            </Route>
                            <Route path="/realdata" exact>
                                <BaseRealDataChart />
                            </Route>
                            <Route path="/racebar" exact>
                                <RacingBar />
                            </Route>
                            <Route path="/line" exact>
                                <BaseLine />
                            </Route>
                            <Route path="/bar" exact>
                                <BaseBar />
                            </Route>
                            <Route path="/zoomline" exact>
                                <ZoomableLine />
                            </Route>
                        </Switch>
                    </Suspense>
                </div>
            </Router>
        </div>
    );
}

export default App;
