import { type ResourceIdent_Parsed, separator } from "./ident"

/**
 * Attempts to parse a reference key string into its kind and name components. Returns undefined if
 * the string cannot be parsed.
 *
 * @param ref - The reference key string to parse (format: "Kind/Name")
 * @returns The parsed reference key, or undefined if parsing fails
 */

export function tryParse(ref: string): ResourceIdent_Parsed | undefined {
    if (typeof ref !== "string") {
        return undefined
    }
    if (ref == null) {
        return undefined
    }
    if (typeof ref === "object") {
        return undefined
    }
    const [kind, name] = ref.split(separator).map(s => s.trim())
    if (!kind || !name) {
        return undefined
    }
    return {
        kind,
        name
    }
} /**
 * String format template for reference keys.
 *
 * @template Kind - The Kubernetes resource kind
 * @template Name - The resource name
 */

export type ResourceIdent_sFormat<Kind extends string, Name extends string> = `${Kind}/${Name}`
