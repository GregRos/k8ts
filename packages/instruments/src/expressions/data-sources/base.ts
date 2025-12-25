import { doddle, type DoddleAsync } from "doddle"

/** Unique symbol used to identify data source objects. */
export declare const DATA_SOURCE: unique symbol

/**
 * Lazy-loading data source that caches the result of a getter function. The getter is executed only
 * once, and the result is memoized for subsequent calls.
 *
 * @example
 *     const lazy = new DataSource_Lazy(() => expensiveComputation())
 *     const value1 = await lazy.get() // Computes value
 *     const value2 = await lazy.get() // Returns cached value
 *
 * @typeParam T - The type of data this source provides
 */
export class DataSource_Lazy<T = any> {
    private readonly _data: DoddleAsync<T>

    /**
     * Creates a new lazy data source.
     *
     * @param getter - Function that computes or retrieves the value (can be async)
     */
    constructor(getter: () => T | Promise<T>) {
        this._data = doddle(async () => getter())
    }

    /**
     * Retrieves the value, computing it on first call and returning cached value on subsequent
     * calls.
     *
     * @returns Promise resolving to the data value
     */
    get() {
        return this._data.pull()
    }
}
