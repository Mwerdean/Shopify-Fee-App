import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/styles.css';


ReactDOM.render(
<AppProvider
    apiKey=""
    shopOrigin=""
>
    <App />
</AppProvider>
, document.getElementById('root'));
registerServiceWorker();
