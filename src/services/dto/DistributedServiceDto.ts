/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Operator from '../../resources/dto/OperatorDto';
/* eslint-enable */

/**
 * 証明書配布状況登録サービスデータ
 */
export default class DistributedServiceDto {
    /**
     * オペレータ情報
     */
    private operator: Operator = null;

    /**
     * シリアル番号
     */
    private serialNo: string = null;

    /**
     * フィンガープリント
     */
    private fingerPrint: string = null;

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
}
