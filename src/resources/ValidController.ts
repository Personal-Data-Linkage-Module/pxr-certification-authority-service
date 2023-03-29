/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
/* eslint-enable */
import PostValidReqDto from './dto/PostValidReqDto';
import ValidDto from '../services/dto/ValidServiceDto';
import OperatorService from '../services/OperatorService';
import ValidService from '../services/ValidService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import ValidRequestValidator from './validator/ValidRequestValidator';
import Db from '../common/Db';

@JsonController('/certification-authority')
export default class ValidController {
    @Post('/valid')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(ValidRequestValidator)
    async postValid (@Req() req: Request, @Body() dto: PostValidReqDto, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            await OperatorService.authMe(req);

            // リクエストを取得
            const request = new PostValidReqDto();
            request.setFromJson(req.body);

            // クライアント証明書有効性検証データオブジェクトを生成
            const validDto = new ValidDto();
            validDto.setSerialNo(request.getSerialNo());
            validDto.setFingerPrint(request.getFingerPrint());

            // DB接続
            await db.connect();

            // サービス層のクライアント証明書有効性検証を実行
            const ret = await ValidService.isCertificateValid(db.getConnect(), validDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
