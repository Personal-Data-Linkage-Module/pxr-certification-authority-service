/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
import Subject from './SubjectDto';
/* eslint-enable */
import Config from '../../common/Config';
import moment = require('moment-timezone');
const config = Config.ReadConfig('./config/config.json');

/**
 * ルート証明書取得(GET)レスポンスモデル
 */
export default class GetRootResDto implements Idto {
    /**
     * 証明書タイプ
     */
    public certType: string = null;

    /**
     * サブジェクト
     */
    public subject: Subject = null;

    /**
     * シリアル番号
     */
    public serialNo: string = null;

    /**
     * フィンガープリント
     */
    public fingerPrint: string = null;

    /**
     * 有効期間開始
     */
    public validPeriodStart: Date = null;

    /**
     * 有効期間終了
     */
    public validPeriodEnd: Date = null;

    /**
     * 証明書(PEM)
     */
    public certificate: string = null;

    /**
     * 日付指定フォーマット
     */
    private readonly MOMENT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            certType: this.certType,
            subject: this.subject ? this.subject.getAsJson() : null,
            serialNo: this.serialNo,
            fingerPrint: this.fingerPrint,
            validPeriodStart: moment(this.validPeriodStart).tz(config['timezone']).format(this.MOMENT_FORMAT),
            validPeriodEnd: moment(this.validPeriodEnd).tz(config['timezone']).format(this.MOMENT_FORMAT),
            certificate: this.certificate
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.certType = obj['certType'];
        this.subject = new Subject();
        this.subject.setFromJson(obj['subject']);
        this.serialNo = obj['serialNo'];
        this.fingerPrint = obj['fingerPrint'];
        this.validPeriodStart = obj['validPeriodStart'] ? new Date(obj['validPeriodStart']) : null;
        this.validPeriodEnd = obj['validPeriodEnd'] ? new Date(obj['validPeriodEnd']) : null;
        this.certificate = obj['certificate'];
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
