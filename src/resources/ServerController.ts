/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Get, Post, Delete, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
/* eslint-enable */
import GetServerReqDto from './dto/GetServerReqDto';
import PostServerReqDto from './dto/PostServerReqDto';
import OperatorService from '../services/OperatorService';
import ServerDto from '../services/dto/ServerServiceDto';
import ServerService from '../services/ServerService';
import DeleteServerReqDto from './dto/DeleteServerReqDto';
import Subject from './dto/SubjectDto';
import ServerRequestValidator from './validator/ServerRequestValidator';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import Db from '../common/Db';
import Config from '../common/Config';

@JsonController('/certification-authority')
export default class ServerController {
    // 設定ファイル読込
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Get('/server/:serialNo/:fingerPrint')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getServer (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new GetServerReqDto();
            request.setFromJson(req.params);

            // サーバ証明書データオブジェクトを生成
            const serverDto = new ServerDto();
            serverDto.setOperator(operator);
            serverDto.setSerialNo(request.getSerialNo());
            serverDto.setFingerPrint(request.getFingerPrint());

            // DB接続
            await db.connect();

            // サービス層のサーバ証明書取得を実行
            const ret = await ServerService.getCertificate(db.getConnect(), serverDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }

    @Delete('/server/:serialNo/:fingerPrint')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async deleteServer (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new DeleteServerReqDto();
            request.setFromJson(req.params);

            // サーバ証明書データオブジェクトを生成
            const serverDto = new ServerDto();
            const subject = new Subject();
            serverDto.setOperator(operator);
            subject.setFromJson(this.configure['server']['subject']);
            serverDto.setSubject(subject);
            serverDto.setPrivateKeyPath(this.configure['server']['privateKeyPath']);
            serverDto.setCertPath(this.configure['server']['certPath']);
            serverDto.setPeriodDay(this.configure['server']['periodDay']);
            serverDto.setSerialNo(request.getSerialNo());
            serverDto.setFingerPrint(request.getFingerPrint());

            // DB接続
            await db.connect();

            // サービス層のサーバ証明書失効を実行
            const ret = await ServerService.revokeCertificate(db.getConnect(), this.configure['opensslPath'], serverDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }

    @Post('/server')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(ServerRequestValidator)
    async postServer (@Req() req: Request, @Body() dto: PostServerReqDto, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new PostServerReqDto();
            request.setFromJson(req.body);

            // 登録サブジェクトを生成
            const subject = new Subject();
            subject.setFromJson(this.configure['server']['subject']);
            subject.OU = request.getActor().value;

            // サーバ証明書データオブジェクトを生成
            const serverDto = new ServerDto();
            serverDto.setOperator(operator);
            serverDto.setSubject(subject);
            serverDto.setPrivateKeyPath(this.configure['server']['privateKeyPath']);
            serverDto.setCertPath(this.configure['server']['certPath']);
            serverDto.setPeriodDay(this.configure['server']['periodDay']);
            serverDto.setActor(request.getActor());
            serverDto.setBlock(request.getBlock());

            // DB接続
            await db.connect();

            // サービス層のサーバ証明書生成を実行
            const ret = await ServerService.createCertificate(db.getConnect(), this.configure['opensslPath'], serverDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
