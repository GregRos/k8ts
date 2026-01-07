export type GVK_sGreek = "alpha" | "beta"
export type GVK_sVersion_Trailer = `${GVK_sGreek}${number}`
export type GVK_sVersion = `v${number}${GVK_sVersion_Trailer | ""}`
