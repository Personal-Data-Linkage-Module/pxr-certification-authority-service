/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
/* eslint-enable */
import { sprintf } from 'sprintf-js';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 証明書配布状況登録のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class DistributedRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        const body = request.body;

        // 空かどうか判定し、空と判定した場合にはエラーをスローする
        if (!body || JSON.stringify(body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        // 必須項目チェック
        if (this.isUndefined(body['serialNo'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'serialNo'), ResponseCode.BAD_REQUEST);
        }
        if (this.isUndefined(body['fingerPrint'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'fingerPrint'), ResponseCode.BAD_REQUEST);
        }

        // 文字列チェック
        if (this.isEmpty(body['serialNo'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNotEmpty, 'serialNo'), ResponseCode.BAD_REQUEST);
        }
        if (this.isEmpty(body['fingerPrint'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNotEmpty, 'fingerPrint'), ResponseCode.BAD_REQUEST);
        }

        next();
    }

    /**
     * 空判定
     * @param target
     */
    protected isEmpty (target: any): boolean {
        // null, ''は空文字数値と判定
        return target == null || target === '';
    }

    /**
     * undefined判定
     * @param target
     */
    protected isUndefined (target: any): boolean {
        return target === undefined;
    }
}
