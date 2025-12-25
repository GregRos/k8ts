export type Path_Rooted = `/${string}`
export type Container_Mount_Path = `${"" | "." | ".."}${Path_Rooted}`
