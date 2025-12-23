import { doddle, type DoddleAsync } from "doddle"

export declare const DATA_SOURCE: unique symbol

export class DataSource_Lazy<T = any> {
    private readonly _data: DoddleAsync<T>
    constructor(getter: () => T | Promise<T>) {
        this._data = doddle(async () => getter())
    }

    get() {
        return this._data.pull()
    }
}
