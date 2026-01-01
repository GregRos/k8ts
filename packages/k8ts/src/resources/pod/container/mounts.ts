export type PathRooted = `/${string}`
export type ContainerMountPath = `${"" | "." | ".."}${PathRooted}`
