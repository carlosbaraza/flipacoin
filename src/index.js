import 'normalize.css';

require('offline-plugin/runtime').install();

import './nav-bar';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import './index.scss';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
