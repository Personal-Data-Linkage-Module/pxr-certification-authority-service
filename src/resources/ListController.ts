/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Get, Header, Res, Req
} from 'routing-controllers';
import GetListReqDto from './dto/GetListReqDto';
/* eslint-enable */
import OperatorService from '../services/OperatorService';
import ListService from '../services/ListService';
import ListDto from '../services/dto/ListServiceDto';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import { transformAndValidate } from 'class-transformer-validator';
import GetListByActorCodeReqDto from './dto/GetListByActorCodeReqDto';
import Db from '../common/Db';

@JsonController('/certification-authority')
export default class ListController {
    @Get('/list')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getList (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            await OperatorService.authMe(req);

            // リクエストを取得
            const request = new GetListReqDto();
            request.setFromJson(req.params);

            // 証明書一覧データオブジェクトを生成
            const listDto = new ListDto();

            // DB接続
            await db.connect();

            // サービス層の証明書一覧取得を実行
            const ret = await ListService.getCertificateList(db.getConnect(), listDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }

    @Get('/list/:actorCode')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getListByActorCode (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            const dto = await transformAndValidate(
                GetListByActorCodeReqDto,
                req.params
            );

            // オペレーターセッション情報を取得する
            await OperatorService.authMe(req);

            // DB接続
            await db.connect();

            // サービス層の証明書一覧取得を実行
            const ret = await ListService.getListByActorCode(db.getConnect(), dto.actorCode);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
