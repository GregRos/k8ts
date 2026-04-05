export function cleanBody<T>(body: T): Omit<T, "metadata" | "apiVersion" | "kind"> {
    const { metadata, apiVersion, kind, ...rest } = body as any
    return rest
}
export type SourcedPropertyDescriptor = PropertyDescriptor & {
    source: object
}
export function getDeepPropertyDescriptor(
    obj: any,
    propertyKey: string | symbol
): SourcedPropertyDescriptor | undefined {
    let current = obj
    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, propertyKey)
        if (descriptor) {
            return {
                ...descriptor,
                source: current
            }
        }
        current = Object.getPrototypeOf(current)
    }
    return undefined
}
