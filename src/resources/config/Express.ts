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
import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import setupLogging from './Logging';
import setupHealthCheck from "./HealthCheck";
import GlobalValidate from '../validator/GlobalValidate';
import GlobalErrorHandler from '../handler/GlobalErrorHandler';
import SwaggerUi = require('swagger-ui-express');
import ActorController from '../ActorController';
import ClientController from '../ClientController';
import DistributedController from '../DistributedController';
import ListController from '../ListController';
import RootController from '../RootController';
import ServerController from '../ServerController';
import ValidController from '../ValidController';
import cookieParser = require('cookie-parser');
import Config from '../../common/Config';
import ClientCertificateChain from '../../resources/ClientCertificateChain';
/* eslint-enable */

export class ExpressConfig {
    app: express.Express;

    constructor () {
        this.app = express();

        setupLogging(this.app);
        // SDE-MSA-PRIN 監視に優しい設計にする （MSA-PRIN-CD-04）
        setupHealthCheck(this.app);
        // SDE-MSA-PRIN ステートレスにする （MSA-PRIN-SD-01）

        this.app.use(bodyParser.json({ limit: '100mb' }));
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        /**
         * HelmetによるHTTPヘッダーのセキュリティ対策設定
         */
        this.app.use(helmet());

        // SDE-IMPL-RECOMMENDED Content-Security-Policyの設定は以下で行ってください
        this.app.use(helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:']
                // mediaSrc: ['media1.com', 'media2.com'],
                // scriptSrc: ['scripts.example.com'],
            }
        }));

        // Swaggaer設定ファイルを読込
        const SwaggerConfig = Config.ReadConfig('./config/openapi.json');

        // Swagger UIのセットアップ
        this.app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(SwaggerConfig));

        this.setupControllers();
    }

    setupControllers () {
        // const resourcesPath = path.resolve('dist', 'resources');

        useContainer(Container);

        useExpressServer(this.app, {
            // SDE-IMPL-RECOMMENDED CORS（Cross-Origin Resource Sharing）設定は以下で行ってください。
            // cors: {
            //     methods: ['GET', 'PUT', 'POST', 'DELETE'],
            //     credentials: true,
            //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            //     exposedHeaders: [],
            //     maxAge: 1800
            // },
            defaultErrorHandler: false,
            controllers: [
                ActorController,
                ClientController,
                DistributedController,
                ListController,
                RootController,
                ServerController,
                ValidController,
                ClientCertificateChain
            ],
            middlewares: [GlobalValidate, GlobalErrorHandler],
            development: false
        });
    }
}
