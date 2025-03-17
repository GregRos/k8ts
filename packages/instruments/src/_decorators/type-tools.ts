export type AttachedTarget<Input extends Record<keyof Input, () => any>, Target extends object> = {
    [K in keyof Input]: (self: Target) => ReturnType<Input[K]>
}
