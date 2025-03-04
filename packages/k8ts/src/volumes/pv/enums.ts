export type AccessMode = "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany"

type InputAccessMode = AccessMode | "RWX" | "ROX" | "RWO"
export type InputAccessModes = InputAccessMode | InputAccessMode[]

export type VolumeReclaimPolicy = "Retain" | "Delete" | "Recycle"
