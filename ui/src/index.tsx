import {AppRegistry} from 'react-native';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import AppProvider from './AppProvider';

const rootTag = document.getElementById('root');
AppRegistry.registerComponent('App', () => App);
// @ts-ignore: no types available
AppRegistry.setWrapperComponentProvider(() => AppProvider);
AppRegistry.runApplication('App', {rootTag});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
