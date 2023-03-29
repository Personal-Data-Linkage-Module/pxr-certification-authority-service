/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Get, Post, Delete, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import PostClientReqDto from './dto/PostClientReqDto';
/* eslint-enable */
import OperatorService from '../services/OperatorService';
import Subject from './dto/SubjectDto';
import DeleteClientReqDto from './dto/DeleteClientReqDto';
import GetClientReqDto from './dto/GetClientReqDto';
import ClientDto from '../services/dto/ClientServiceDto';
import ClientService from '../services/ClientService';
import ClientRequestValidator from './validator/ClientRequestValidator';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import Db from '../common/Db';
import Config from '../common/Config';

@JsonController('/certification-authority')
export default class ClientController {
    // 設定ファイル読込
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Get('/client/:serialNo/:fingerPrint')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getClient (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new GetClientReqDto();
            request.setFromJson(req.params);

            // クライアント証明書データオブジェクトを生成
            const clientDto = new ClientDto();
            clientDto.setOperator(operator);
            clientDto.setSerialNo(request.getSerialNo());
            clientDto.setFingerPrint(request.getFingerPrint());

            // DB接続
            await db.connect();

            // サービス層のクライアント証明書取得を実行
            const ret = await ClientService.getCertificate(db.getConnect(), clientDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }

    @Delete('/client/:serialNo/:fingerPrint')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async deleteClient (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // DB接続
            await db.connect();

            // リクエストを取得
            const request = new DeleteClientReqDto();
            request.setFromJson(req.params);

            // サーバ証明書データオブジェクトを生成
            const clientDto = new ClientDto();
            clientDto.setOperator(operator);
            const subject = new Subject();
            subject.setFromJson(this.configure['client']['subject']);
            clientDto.setSubject(subject);
            clientDto.setPrivateKeyPath(this.configure['client']['privateKeyPath']);
            clientDto.setCertPath(this.configure['client']['certPath']);
            clientDto.setPeriodDay(this.configure['client']['periodDay']);
            clientDto.setSerialNo(request.getSerialNo());
            clientDto.setFingerPrint(request.getFingerPrint());

            // サービス層のサーバ証明書失効を実行
            const ret = await ClientService.revokeCertificate(db.getConnect(), this.configure['opensslPath'], clientDto);

            // レスポンスを戻す
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }

    @Post('/client')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(ClientRequestValidator)
    async postClient (@Req() req: Request, @Body() dto: PostClientReqDto, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // DB接続
            await db.connect();

            // リクエストを取得
            const request = new PostClientReqDto();
            request.setFromJson(req.body);

            // 登録サブジェクトを生成
            const subject = new Subject();
            subject.setFromJson(this.configure['client']['subject']);
            subject.OU = request.getActor().value;

            // クライアント証明書データオブジェクトを生成
            const clientDto = new ClientDto();
            clientDto.setOperator(operator);
            clientDto.setSubject(subject);
            clientDto.setPrivateKeyPath(this.configure['client']['privateKeyPath']);
            clientDto.setCertPath(this.configure['client']['certPath']);
            clientDto.setPeriodDay(this.configure['client']['periodDay']);
            clientDto.setActor(request.getActor());
            clientDto.setBlock(request.getBlock());

            // サービス層のクライアント証明書生成を実行
            const ret = await ClientService.createCertificate(db.getConnect(), this.configure['opensslPath'], clientDto);

            // レスポンスを戻す
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
