/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    IsNumber,
    IsDefined
} from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';
/* eslint-enable */

/**
 * 証明書一覧取得(GET)リクエストモデル
 */
export default class GetListByActorCodeReqDto {
    @Transform(transformToNumber)
    @IsNumber()
    @IsDefined()
    actorCode: number;
}
