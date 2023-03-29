/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * レスポンスインターフェース
 */
export interface Idto {
    /**
     * データ構造取得(JSON用連想配列)
     */
    getAsJson(): {};

    /**
     * データ構造設定(JSON用連想配列)
     */
    setFromJson(obj: {}): void;

    /**
     * データ構造コピー
     */
    clone<T>(): T;
}
