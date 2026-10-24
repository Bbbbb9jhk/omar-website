import { hydrateRoot } from 'react-dom/client';
import { App } from './site';
hydrateRoot(document, <App path={window.location.pathname} />);
