import config from './config/index.js';
import app from './app.js';

/**
 * Start Express server.
 */
const server = app.listen(config.port, () => {
    console.log(
        '  App is running at http://localhost:%d in %s mode',
        config.port,
        process.env.NODE_ENV
    );
    console.log('  Press CTRL-C to stop\n');
});

export default server;
