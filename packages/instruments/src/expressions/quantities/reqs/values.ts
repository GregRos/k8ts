import { isEmpty, mapValues, merge } from "lodash"
import { toCdkQuantity, type CdkQuanitity } from "../util"
import type { Reqs_ReqLimit } from "./types"

export class Reqs_Values {
    constructor(private _record: Record<string, Reqs_ReqLimit>) {}

    get record() {
        return this._record
    }

    private _toObjectTransform<T>(f: (value: string | number) => T): {
        requests?: Record<string, T>
        limits?: Record<string, T>
    } {
        const kubernetesForm = mapValues(this._record, (value, key) => {
            const result = {} as any
            if (value.request) {
                result.requests = {
                    [key]: f(value.request.val)
                }
            }
            if (value.limit) {
                result.limits = {
                    [key]: f(value.limit.val)
                }
            }
            if (!isEmpty(result)) {
                return result
            }
            return undefined
        })

        return merge({}, ...Object.values(kubernetesForm).filter(x => x !== undefined))
    }

    toBareObject() {
        return this._toObjectTransform(x => x)
    }

    toObject(): {
        requests?: Record<string, CdkQuanitity>
        limits?: Record<string, CdkQuanitity>
    } {
        return this._toObjectTransform(toCdkQuantity)
    }
}
