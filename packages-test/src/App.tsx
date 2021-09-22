import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';

const Query = lazy(async () => import('./pages/Query'));
const Interview = lazy(async () => import('./pages/Interview'));

function App() {
    return (
        <Router>
            <div className="cont">
                <Suspense fallback={<div>Page is Loading...</div>}>
                    {/* todo */}
                    <Switch>
                        <Route path="/" exact>
                            Testing packages
                        </Route>
                        <Route path="/int" exact>
                            <Interview />
                        </Route>
                        <Route path="/query" exact>
                            <Query />
                        </Route>
                        <Route path="/query/:id" exact component={Query} />
                    </Switch>
                </Suspense>
            </div>
        </Router>
    );
}

export default App;
