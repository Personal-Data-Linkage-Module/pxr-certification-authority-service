/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Operator from '../../resources/dto/OperatorDto';
import Subject from '../../resources/dto/SubjectDto';
import CodeVersion from '../../resources/dto/CodeVersionDto';
/* eslint-enable */

/**
 * サーバ証明書サービスデータ
 */
export default class ServerServiceDto {
    /**
     * オペレータ情報
     */
    private operator: Operator = null;

    /**
     * ブロックコード、バージョン
     */
    public block: CodeVersion = null;

    /**
     * アクターカタログコード、バージョン
     */
    public actor: CodeVersion = null;

    /**
     * シリアル番号
     */
    private serialNo: string = null;

    /**
     * フィンガープリント
     */
    private fingerPrint: string = null;

    /**
     * サブジェクト
     */
    private subject: Subject = null;

    /**
     * 秘密鍵パス
     */
    private privateKeyPath: string = null;

    /**
     * 証明書パス
     */
    private certPath: string = null;

    /**
     * 有効期間日数
     */
    private periodDay: number = null;

    /**
     * オペレータ情報取得
     */
    public getOperator (): Operator {
        return this.operator;
    }

    /**
     * オペレータ情報設定
     * @param operator
     */
    public setOperator (operator: Operator) {
        this.operator = operator;
    }

    /**
     * ブロックコード、バージョン取得
     */
    public getBlock (): CodeVersion {
        return this.block;
    }

    /**
     * ブロックコード、バージョン設定
     * @param block
     */
    public setBlock (block: CodeVersion) {
        this.block = block;
    }

    /**
     * アクターカタログコード、バージョン取得
     */
    public getActor (): CodeVersion {
        return this.actor;
    }

    /**
     * アクターカタログコード、バージョン設定
     * @param actor
     */
    public setActor (actor: CodeVersion) {
        this.actor = actor;
    }

    /**
     * シリアル番号取得
     */
    public getSerialNo (): string {
        return this.serialNo;
    }

    /**
     * シリアル番号設定
     * @param serialNo
     */
    public setSerialNo (serialNo: string) {
        this.serialNo = serialNo;
    }

    /**
     * フィンガープリント取得
     */
    public getFingerPrint (): string {
        return this.fingerPrint;
    }

    /**
     * フィンガープリント設定
     * @param fingerPrint
     */
    public setFingerPrint (fingerPrint: string) {
        this.fingerPrint = fingerPrint;
    }

    /**
     * サブジェクト取得
     */
    public getSubject (): Subject {
        return this.subject;
    }

    /**
     * サブジェクト設定
     * @param subject
     */
    public setSubject (subject: Subject) {
        this.subject = subject;
    }

    /**
     * 秘密鍵パス取得
     */
    public getPrivateKeyPath (): string {
        return this.privateKeyPath;
    }

    /**
     * 秘密鍵パス設定
     * @param privateKeyPath
     */
    public setPrivateKeyPath (privateKeyPath: string) {
        this.privateKeyPath = privateKeyPath;
    }

    /**
     * 証明書パス取得
     */
    public getCertPath (): string {
        return this.certPath;
    }

    /**
     * 証明書パス設定
     * @param certPath
     */
    public setCertPath (certPath: string) {
        this.certPath = certPath;
    }

    /**
     * 有効期間日数取得
     */
    public getPeriodDay (): number {
        return this.periodDay;
    }

    /**
     * 有効期間日数設定
     * @param periodDay
     */
    public setPeriodDay (periodDay: number) {
        this.periodDay = periodDay;
    }
}
