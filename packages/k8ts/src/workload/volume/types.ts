export type Path_Rooted = `/${string}`
export type MountPath = `${"" | "." | ".."}${Path_Rooted}`
