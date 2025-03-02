import type { Unit } from "../units/types"

export type ReqLimit<Expr extends string> = `${Expr}--->${Expr}`
export type ReqLimit_CPU = ReqLimit<Unit.CPU>
export type ReqLimit_Memory = ReqLimit<Unit.Memory>
export type ReqLimit_Storage = ReqLimit<Unit.Storage>
