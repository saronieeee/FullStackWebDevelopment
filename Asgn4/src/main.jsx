/*
#######################################################################
#
# Copyright (C) 2020-2025  David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#######               DO NOT MODIFY THIS FILE               ###########
#######################################################################
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import loader from './data/loader';
loader();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
);

