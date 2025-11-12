import './style.css';
import { App } from './app';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (root) new App(root);
});
