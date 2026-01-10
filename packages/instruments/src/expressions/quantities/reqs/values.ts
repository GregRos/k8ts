import { isEmpty, mapValues, merge } from "lodash"
import { toCdkQuantityRecord, type CdkQuanitity } from "../util"
import type { Reqs_ReqLimit } from "./types"

export class Reqs_Values {
    constructor(private _record: Record<string, Reqs_ReqLimit>) {}

    toObject(): {
        requests?: Record<string, CdkQuanitity>
        limits?: Record<string, CdkQuanitity>
    } {
        const kubernetesForm = mapValues(this._record, (value, key) => {
            const result = {} as any
            if (value.request) {
                result.requests = toCdkQuantityRecord({
                    [key]: value.request.val
                })
            }
            if (value.limit) {
                result.limits = toCdkQuantityRecord({
                    [key]: value.limit.val
                })
            }
            if (!isEmpty(result)) {
                return result
            }
            return undefined
        })

        return merge({}, ...Object.values(kubernetesForm).filter(x => x !== undefined))
    }
}
