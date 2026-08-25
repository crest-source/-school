import { useEffect } from 'react';
import { SchoolHubApp } from './app';
import './styles.css';

export default function App() {
  useEffect(() => {
    if (!window.SchoolHubApp) {
      window.SchoolHubApp = new SchoolHubApp();
    } else {
      window.SchoolHubApp.render();
    }
  }, []);

  return <div id="app-root"></div>;
}

