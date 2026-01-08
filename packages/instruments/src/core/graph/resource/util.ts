export function cleanBody<T>(body: T): Omit<T, "metadata" | "apiVersion" | "kind"> {
    const { metadata, apiVersion, kind, ...rest } = body as any
    return rest
}
