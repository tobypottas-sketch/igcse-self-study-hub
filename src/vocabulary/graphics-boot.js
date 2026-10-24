import { installGraphicsHandlers } from './graphics-runtime.js';

// Own entry point so the PNG load/error handlers exist before the first view renders; app.js stays untouched.
installGraphicsHandlers(document.getElementById('vocabularyApp'));
