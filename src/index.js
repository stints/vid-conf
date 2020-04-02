import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";

import Lobby from './components/lobby';
import Room from './components/room';

import Signal from './signal';

import './index.css';
import 'bulma/css/bulma.css';

const App = () => {
  const signal = new Signal();
  return (
    <BrowserRouter>
      <main>
        <Switch>
          <Route path="/room/:roomid">
            <Room signal={ signal }/>
          </Route>
          <Route path="/">
            <Lobby signal={ signal } />
          </Route>
        </Switch>
      </main>
    </BrowserRouter>
  );
}

const root = document.querySelector('#root');
ReactDOM.render(<App />, root);
