/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
/* eslint-enable */

/**
 * クライアント証明書失効(DELETE)リクエストモデル
 */
export default class DeleteClientReqDto implements Idto {
    /**
     * シリアル番号
     */
    private serialNo: string = null;

    /**
     * フィンガープリント
     */
    private fingerPrint: string = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
            serialNo: this.serialNo,
            fingerPrint: this.fingerPrint
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.serialNo = obj['serialNo'];
        this.fingerPrint = obj['fingerPrint'];
    }

    /**
     * データ構造コピー
     */
    public clone<T> (): T {
        const clone = new (this.constructor as { new(): T })();
        Object.assign(clone, this);
        return clone;
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
