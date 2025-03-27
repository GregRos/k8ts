export type Prefix$<T extends object> = {
    [K in keyof T as K extends string ? `$${K}` : never]: T[K]
}
