/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
/* eslint-enable */

/**
 * オペレータ種別
 */
export namespace OperatorType {
    /**
     * 個人(0)
     */
    export const TYPE_IND: number = 0;

    /**
     * アプリケーション(2)
     */
    export const TYPE_APP: number = 2;

    /**
     * 運営メンバー(3)
     */
    export const TYPE_MANAGE_MEMBER: number = 3;
}

/**
 * クッキー種別
 */
export namespace CookieType {
    /**
     * 個人
     */
    export const TYPE_PERSONAL_COOKIE: string = 'operator_type0_session';

    /**
     * アプリケーション
     */
    export const TYPE_APPLICATION_COOKIE: string = 'operator_type2_session';

    /**
     * 運営メンバー
     */
    export const TYPE_MANAGER_COOKIE: string = 'operator_type3_session';
}

/**
 * オペレータ情報モデル(ヘッダー)
 */
export default class Operator implements Idto {
    /**
     * セッションID
     */
    private sessionId: string = null;

    /**
     * セッションキー
     */
    private sessionKey: string = null;

    /**
     * オペレータID
     */
    private operatorId: number = null;

    /**
     * オペレータタイプ
     */
    private type: number = null;

    /**
     * ログインID
     */
    private loginId: string = null;

    /**
     * 名前
     */
    private name: string = null;

    /**
     * 携帯番号
     */
    private mobilePhone: string = null;

    /**
     * 権限
     */
    private auth: object = null;

    /**
     * ブロックコード
     */
    private blockCode: number = null;

    /**
     * ブロックバージョン
     */
    private blockVersion: number = null;

    /**
     * アクターコード
     */
    private actorCode: number = null;

    /**
     * アクターバージョン
     */
    private actorVersion: number = null;

    /**
     * PXR-ID
     */
    private pxrId: string = '';

    /**
     * エンコード済みのデータ
     */
    private encodeData: string = '';

    /**
     * セッションID取得
     */
    public getSessionId (): string {
        return this.sessionId;
    }

    /**
     * セッションID設定
     * @param sessionId
     */
    public setSessionId (sessionId: string) {
        this.sessionId = sessionId;
    }

    /**
     * セッションID取得
     */
    public getSessionKey (): string {
        return this.sessionKey;
    }

    /**
     * セッションID設定
     * @param sessionKey
     */
    public setSessionKey (sessionKey: string) {
        this.sessionKey = sessionKey;
    }

    /**
     * オペレータID取得
     */
    public getOperatorId (): number {
        return this.operatorId;
    }

    /**
     * オペレータID設定
     * @param operatorId
     */
    public setOperatorId (operatorId: number) {
        this.operatorId = operatorId;
    }

    /**
     * オペレータタイプ取得
     */
    public getType (): number {
        return this.type;
    }

    /**
     * オペレータタイプ設定
     * @param type
     */
    public setType (type: number) {
        this.type = type;
    }

    /**
     * ログインID取得
     */
    public getLoginId (): string {
        return this.loginId;
    }

    /**
     * ログインID設定
     * @param loginId
     */
    public setLoginId (loginId: string) {
        this.loginId = loginId;
    }

    /**
     * 名前取得
     */
    public getName (): string {
        return this.name;
    }

    /**
     * 名前設定
     * @param name
     */
    public setName (name: string) {
        this.name = name;
    }

    /**
     * 携帯番号取得
     */
    public getMobilePhone (): string {
        return this.mobilePhone;
    }

    /**
     * 携帯番号設定
     * @param mobilePhone
     */
    public setMobilePhone (mobilePhone: string) {
        this.mobilePhone = mobilePhone;
    }

    /**
     * ブロックコード取得
     */
    public getBlockCode (): number {
        return this.blockCode;
    }

    /**
     * ブロックコード設定
     * @param blockCode
     */
    public setBlockCode (blockCode: number) {
        this.blockCode = blockCode;
    }

    /**
     * ブロックバージョン取得
     */
    public getBlockVersion (): number {
        return this.blockVersion;
    }

    /**
     * ブロックバージョン設定
     * @param blockVersion
     */
    public setBlockVersion (blockVersion: number) {
        this.blockVersion = blockVersion;
    }

    /**
     * アクターコード取得
     */
    public getActorCode (): number {
        return this.actorCode;
    }

    /**
     * アクターコード設定
     * @param actorCode
     */
    public setActorCode (actorCode: number) {
        this.actorCode = actorCode;
    }

    /**
     * アクターバージョン取得
     */
    public getActorVersion (): number {
        return this.actorVersion;
    }

    /**
     * アクターバージョン設定
     * @param actorVersion
     */
    public setActorVersion (actorVersion: number) {
        this.actorVersion = actorVersion;
    }

    /**
     * 権限取得
     */
    public getAuth (): object {
        return this.auth;
    }

    /**
     * 権限設定
     * @param auth
     */
    public setAuth (auth: object) {
        this.auth = auth;
    }

    /**
     * エンコード済みデータ取得
     */
    public getEncodeData (): string {
        return this.encodeData;
    }

    /**
     * エンコード済みデータ設定
     * @param _encodeData
     */
    public setEncodeData (_encodeData: string) {
        this.encodeData = _encodeData;
    }

    /**
     * PXR-ID取得
     */
    public getPxrId (): string {
        return this.pxrId;
    }

    /**
     * PXR-ID設定
     * @param pxrId
     */
    public setPxrId (pxrId: string) {
        this.pxrId = pxrId;
    }

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            sessionId: this.sessionId,
            operatorId: this.operatorId,
            type: this.type,
            loginId: this.loginId,
            name: this.name,
            mobilePhone: this.mobilePhone,
            auth: this.auth,
            pxrId: this.pxrId,
            blockCode: {
                _value: this.blockCode,
                _ver: this.blockVersion
            },
            actorCode: {
                _value: this.actorCode,
                _ver: this.actorVersion
            }
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.sessionId = obj['sessionId'];
        this.operatorId = obj['operatorId'] ? Number(obj['operatorId']) : 0;
        this.type = obj['type'] ? Number(obj['type']) : 0;
        this.loginId = obj['loginId'];
        this.name = obj['name'];
        this.mobilePhone = obj['mobilePhone'];
        this.auth = obj['auth'];
        this.pxrId = obj['pxrId'];
        if (obj['block']) {
            this.blockCode = obj['block']['_value'] ? Number(obj['block']['_value']) : 0;
            this.blockVersion = obj['block']['_ver'] ? Number(obj['block']['_ver']) : 0;
        }
        if (obj['actor']) {
            this.actorCode = obj['actor']['_value'] ? Number(obj['actor']['_value']) : 0;
            this.actorVersion = obj['actor']['_ver'] ? Number(obj['actor']['_ver']) : 0;
        }
    }

    /**
     * データ構造コピー
     */
    public clone<T> (): T {
        const clone = new (this.constructor as { new(): T })();
        Object.assign(clone, this);
        return clone;
    }
}
