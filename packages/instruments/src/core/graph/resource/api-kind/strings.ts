export type GVK_sGreek = "alpha" | "beta"
export type GVK_sVersion_Trailer = `${GVK_sGreek}${number}`
export type GVK_sVersion = `v${number}${GVK_sVersion_Trailer | ""}`
export type GVK_sGroup = string
export type GVK_sKind = string
export type GVK_sSlash<A extends string, B extends string> = `${A}/${B}`
