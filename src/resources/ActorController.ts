/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Get, Header, Res, Req
} from 'routing-controllers';
/* eslint-enable */
import ActorService from '../services/ActorService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import OperatorService from '../services/OperatorService';
import GetActorReqDto from './dto/GetActorReqDto';
import ActorDto from '../services/dto/ActorServiceDto';
import Db from '../common/Db';

@JsonController('/certification-authority')
export default class ActorController {
    @Get('/actor/:serialNo/:fingerPrint')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getActor (@Req() req: Request, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            await OperatorService.authMe(req);

            // リクエストを取得
            const request = new GetActorReqDto();
            request.setFromJson(req.params);

            // アクター情報データオブジェクトを生成
            const actorDto = new ActorDto();
            actorDto.setSerialNo(request.getSerialNo());
            actorDto.setFingerPrint(request.getFingerPrint());

            // DB接続
            await db.connect();

            // サービス層のアクター情報取得を実行
            const ret = await ActorService.getActorInfo(db.getConnect(), actorDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
