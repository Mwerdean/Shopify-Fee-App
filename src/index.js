import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/styles.css';
import { BrowserRouter } from 'react-router-dom'


ReactDOM.render(

<AppProvider
    apiKey=""
    shopOrigin=""
>
    <BrowserRouter>
        <App />
    </BrowserRouter>
</AppProvider>
, document.getElementById('root'));
registerServiceWorker();
