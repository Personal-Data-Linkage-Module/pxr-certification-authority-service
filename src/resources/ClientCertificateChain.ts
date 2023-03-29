/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { JsonController, Get, Header } from 'routing-controllers';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import config = require('config');
import fs = require('fs');
/* eslint-enable */

@JsonController('/certificate-authority')
export default class {
    @Get('/client/cert-chain')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async get () {
        return {
            chained_client_cert: fs.readFileSync(config.get('certificate-chain'), 'utf-8')
        };
    }
}
