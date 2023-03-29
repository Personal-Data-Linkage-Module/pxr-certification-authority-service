/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
import Certificate from './CertificateDto';
/* eslint-enable */

/**
 * 証明書一覧取得(GET)レスポンスモデル
 */
export default class GetListResDto implements Idto {
    /**
     * 証明書一覧
     */
    public list: Certificate[] = [];

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const certList: {}[] = [];
        for (let index = 0; index < this.list.length; index++) {
            certList.push(this.list[index].getAsJson());
        }
        return certList;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param list
     */
    public setFromJson (list: []): void {}

    /**
     * データ構造コピー
     */
    public clone<T> (): T {
        const clone = new (this.constructor as { new(): T })();
        Object.assign(clone, this);
        return clone;
    }
}
