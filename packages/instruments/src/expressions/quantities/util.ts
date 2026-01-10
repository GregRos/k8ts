export interface CdkQuanitity<T extends string | number = string | number> {
    value: T
}
export function isCdkQuanitity<T extends string | number>(input: any): input is CdkQuanitity<T> {
    return typeof input === "object" && input !== null && "value" in input && Object.keys(input).length === 1
}
export function toCdkQuantity<T extends string | number | undefined>(
    input: T
): T extends undefined ? undefined : CdkQuanitity<Exclude<T, undefined>> {
    return { value: input } as any
}

export type SkipUndefinedKeys<R extends Record<string, any>> = {
    [K in keyof R as R[K] extends undefined ? never : K]: CdkQuanitity<R[K]>
}
export type NormEmptyObjectToUndefined<T> = T extends Record<string, never> ? undefined : T

export function toCdkQuantityRecord<R extends Record<string, any>>(
    input: R
): NormEmptyObjectToUndefined<SkipUndefinedKeys<R>> {
    const output: any = {}
    for (const key in input) {
        const quantity = toCdkQuantity(input[key])
        if (quantity !== undefined) {
            output[key] = quantity
        }
    }
    if (Object.keys(output).length === 0) {
        return undefined as any
    }
    return output
}
