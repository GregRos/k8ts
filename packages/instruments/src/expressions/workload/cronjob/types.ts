export type _SetObjectKey<Obj extends object, K extends keyof Obj, V> = {
    [P in keyof Obj]: P extends K ? V : Obj[P]
}
