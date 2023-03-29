/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from '../common/AppError';
import OperatorDomain from '../domains/OperatorDomain';
import Operator from '../resources/dto/OperatorDto';
import { Request } from 'express';
import { doPostRequest } from '../common/DoRequest';
import Config from '../common/Config';
import request = require('request');
/* eslint-enable */
import urljoin = require('url-join');
const Message = Config.ReadConfig('./config/message.json');

/**
 * オペレーターサービスとの連携クラス
 */
export default class OperatorService {
    /**
     * オペレーターのセッション情報を取得する
     * @param req リクエストオブジェクト
     */
    static async authMe (req: Request): Promise<OperatorDomain> {
        const { cookies } = req;
        const sessionId = cookies[OperatorDomain.TYPE_PERSONAL_KEY]
            ? cookies[OperatorDomain.TYPE_PERSONAL_KEY]
            : cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                ? cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                : cookies[OperatorDomain.TYPE_MANAGER_KEY];
        // Cookieからセッションキーが取得できた場合、オペレーターサービスに問い合わせる
        if (typeof sessionId === 'string' && sessionId.length > 0) {
            const bodyData = JSON.stringify({ sessionId: sessionId });
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(bodyData)
                },
                body: bodyData
            };
            try {
                // 設定ファイル読込
                const configure = Config.ReadConfig('./config/config.json');
                const url = urljoin(configure['sessionUrl']);
                const result = await doPostRequest(
                    url,
                    options
                );
                // ステータスコードにより制御
                const { statusCode } = result.response;
                if (statusCode === 204 || statusCode === 400) {
                    throw new AppError(Message.NOT_AUTHORIZED, 401);
                } else if (statusCode !== 200) {
                    throw new AppError(Message.FAILED_TAKE_SESSION, 500);
                }
                let data = result.body;
                while (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                return new OperatorDomain(data);
            } catch (err) {
                if (err.name === AppError.NAME) {
                    throw err;
                }
                throw new AppError(Message.FAILED_CONNECT_TO_OPERATOR, 500, err);
            }

        // ヘッダーにセッション情報があれば、それを流用する
        } else if (req.headers.session) {
            let data = decodeURIComponent(req.headers.session + '');
            while (typeof data === 'string') {
                data = JSON.parse(data);
            }
            return new OperatorDomain(data, req.headers.session + '');

        // セッション情報が存在しない場合、未ログインとしてエラーをスローする
        } else {
            throw new AppError(Message.NOT_AUTHORIZED, 401);
        }
    }

    /**
     * OperatorDomainからOperatorに変換する
     * @param domain
     */
    static async convertOperator (domain: OperatorDomain) : Promise<Operator> {
        const operator = new Operator();

        operator.setSessionId(domain.sessionId);
        operator.setOperatorId(domain.operatorId);
        operator.setType(domain.type);
        operator.setLoginId(domain.loginId);
        operator.setName(domain.name);
        operator.setAuth(domain.auth);
        operator.setBlockCode(domain.blockCode);
        operator.setBlockVersion(domain.blockVersion);
        operator.setActorCode(domain.actorCode);
        operator.setActorVersion(domain.actorVersion);
        operator.setPxrId(domain.pxrId);
        operator.setEncodeData(domain.encoded);

        return operator;
    }
}
