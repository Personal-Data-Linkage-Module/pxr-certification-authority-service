/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore,
} from 'routing-controllers';
import PostDistributedReqDto from './dto/PostDistributedReqDto';
/* eslint-enable */
import OperatorService from '../services/OperatorService';
import DistributedDto from '../services/dto/DistributedServiceDto';
import DistributedService from '../services/DistributedService';
import DistributedRequestValidator from './validator/DistributedRequestValidator';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import Db from '../common/Db';

@JsonController('/certification-authority')
export default class DistributedController {
    @Post('/distributed')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(DistributedRequestValidator)
    async postDistributed (@Req() req: Request, @Body() dto: PostDistributedReqDto, @Res() res: Response): Promise<any> {
        const db: Db = new Db();
        try {
            // オペレーターセッション情報を取得する
            const domain = await OperatorService.authMe(req);
            const operator = await OperatorService.convertOperator(domain);

            // リクエストを取得
            const request = new PostDistributedReqDto();
            request.setFromJson(req.body);

            // 証明書配布状況登録データオブジェクトを生成
            const distributedDto = new DistributedDto();
            distributedDto.setOperator(operator);
            distributedDto.setSerialNo(request.getSerialNo());
            distributedDto.setFingerPrint(request.getFingerPrint());

            // DB接続
            await db.connect();

            // サービス層の証明書配布状況登録を実行
            const ret = await DistributedService.updateDistributed(db.getConnect(), distributedDto);
            return ret;
        } finally {
            // DB切断
            // await db.disconnect();
        }
    }
}
