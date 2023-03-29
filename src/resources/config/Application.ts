/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */
/* eslint-disable */
import * as config from 'config';
import { Container } from 'typedi';
import { Server } from 'net';

import { ExpressConfig } from './Express';
import { systemLogger } from '../../common/logging';
/* eslint-enable */

export class Application {
    server!: Server;
    express: ExpressConfig;

    constructor () {
        this.express = Container.get(ExpressConfig);
        const port = config.get('ports.http');

        // WEBサーバを開始
        if (process.env.NODE_ENV !== 'test') {
            this.server = this.express.app.listen(parseInt(port + ''), '0.0.0.0', () => {
                systemLogger.info(`
                    ----------------
                    Server Started!

                    Http: http://localhost:${port}
                    ----------------
                `);
            });
        }
    }

    async start () {
        return new Promise<void>((resolve, reject) => {
            this.server = this.express.app.listen(config.get('ports.http'), () => {
                systemLogger.info(`
                    ----------------
                    Server Started!
    
                    Http: http://localhost:${config.get('ports.http')}
                    ----------------
                `);
                resolve();
            });
        });
    }

    async stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => { resolve(); });
        });
    }
}
