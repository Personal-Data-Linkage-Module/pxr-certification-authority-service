/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Idto } from './IdtoDto';
/* eslint-enable */

/**
 * ルート証明書生成(POST)リクエストモデル
 */
export default class PostRootReqDto implements Idto {
    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const obj: {} = {
        };
        return obj;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
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
