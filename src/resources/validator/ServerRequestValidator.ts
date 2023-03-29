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
 * サーバ証明書のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class ServerRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        const body = request.body;

        // 空かどうか判定し、空と判定した場合にはエラーをスローする
        if (!body || JSON.stringify(body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        // 必須項目チェック
        if (this.isUndefined(body['certType'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'certType'), ResponseCode.BAD_REQUEST);
        }
        if (this.isUndefined(body['actorName'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'actorName'), ResponseCode.BAD_REQUEST);
        }
        if (this.isNull(body['block']) || this.isUndefined(body['block'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'block'), ResponseCode.BAD_REQUEST);
        }
        if (this.isUndefined(body['block']['value']) || this.isNull(body['block']['value'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'block.value'), ResponseCode.BAD_REQUEST);
        }
        if (this.isUndefined(body['block']['ver']) || this.isNull(body['block']['ver'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'block.ver'), ResponseCode.BAD_REQUEST);
        }
        if (this.isNull(body['actor']) || this.isUndefined(body['actor'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'actor'), ResponseCode.BAD_REQUEST);
        }
        if (this.isUndefined(body['actor']['value'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'actor.value'), ResponseCode.BAD_REQUEST);
        }
        if (this.isUndefined(body['actor']['ver'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isDefined, 'actor.ver'), ResponseCode.BAD_REQUEST);
        }

        // 文字列チェック
        if (this.isEmpty(body['certType'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNotEmpty, 'certType'), ResponseCode.BAD_REQUEST);
        }
        if (this.isEmpty(body['actorName'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNotEmpty, 'actorName'), ResponseCode.BAD_REQUEST);
        }
        // 数値チェック
        if (!this.isNumber(body['block']['value'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNumber, 'block.value'), ResponseCode.BAD_REQUEST);
        }
        if (!this.isNumber(body['block']['ver'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNumber, 'block.ver'), ResponseCode.BAD_REQUEST);
        }
        if (!this.isNull(body['actor']['value']) && !this.isNumber(body['actor']['value'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNumber, 'actor.value'), ResponseCode.BAD_REQUEST);
        }
        if (!this.isNull(body['actor']['value']) && !this.isNumber(body['actor']['ver'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNumber, 'actor.ver'), ResponseCode.BAD_REQUEST);
        }
        if (!this.isNumber(body['actor']['ver'])) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.validation.isNumber, 'actor.ver'), ResponseCode.BAD_REQUEST);
        }
        // 制御文字チェック
        // const actorName: string = body['actorName'];
        /* eslint-disable-next-line */
        /*
        if (actorName.search(/[;|\&`()\$<>\*?\{\}\[\]!]/) >= 0) {
            // エラーレスポンスを返す
            throw new AppError(sprintf(Message.IS_STRING_EXPECT, 'actorName'), ResponseCode.BAD_REQUEST);
        }
        */
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

    /**
     * 数値判定
     * @param target
     */
    protected isNumber (target: any): boolean {
        // null, falseは数値ではないと判定
        if (target == null || target === false) {
            return false;
        }
        return !isNaN(Number(target));
    }

    /**
     * null判定
     * @param target
     */
    protected isNull (target: any): boolean {
        return target === null;
    }
}
