/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Get, Post, Header, Res, Req
} from 'routing-controllers';
/* eslint-enable */
import OperatorService from '../services/OperatorService';
import Subject from './dto/SubjectDto';
import GetRootReqDto from './dto/GetRootReqDto';
import PostRootReqDto from './dto/PostRootReqDto';
import RootDto from '../services/dto/RootServiceDto';
import RootService from '../services/RootService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import Db from '../common/Db';
import Config from '../common/Config';

@JsonController('/certification-authority')
export default class RootController {
    // 設定ファイル読込
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Get('/root')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getRoot (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new GetRootReqDto();
            request.setFromJson(req.params);

            // ルート証明書データオブジェクトを生成
            const rootDto = new RootDto();
            rootDto.setOperator(operator);

            // DB接続
            await db.connect();

            // サービス層のルート証明書取得を実行
            const ret = await RootService.getCertificate(db.getConnect(), rootDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }

    @Post('/root')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async postRoot (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new PostRootReqDto();
            request.setFromJson(req.params);

            // ルート証明書データオブジェクトを生成
            const rootDto = new RootDto();
            rootDto.setOperator(operator);
            const subject = new Subject();
            subject.setFromJson(this.configure['root']['subject']);
            rootDto.setSubject(subject);
            rootDto.setPrivateKeyPath(this.configure['root']['privateKeyPath']);
            rootDto.setCertPath(this.configure['root']['certPath']);
            rootDto.setPeriodDay(this.configure['root']['periodDay']);

            // DB接続
            await db.connect();

            // サービス層のルート証明書生成を実行
            const ret = await RootService.createCertificate(db.getConnect(), this.configure['opensslPath'], rootDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
