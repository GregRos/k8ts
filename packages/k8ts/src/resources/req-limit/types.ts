import type { Dim } from "../units"

export type ReqLimit<Expr extends string> = `${Expr}--->${Expr}`
export type ReqLimit_CPU = ReqLimit<Dim.CPU>
export type ReqLimit_Memory = ReqLimit<Dim.Data>
export type ReqLimit_Storage = ReqLimit<Dim.Data>
