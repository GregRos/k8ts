import type { Unit } from "./types"

export function T(n: number) {
    return `${n}T` as Unit.Storage
}

export function G(n: number) {
    return `${n}G` as Unit.Storage & Unit.Memory
}

export function M(n: number) {
    return `${n}M` as Unit.Storage & Unit.Memory
}

export function K(n: number) {
    return `${n}K` as Unit.Storage & Unit.Memory
}

export function m(n: number) {
    return `${n}m` as Unit.CPU
}

export function Gi(n: number) {
    return `${n}Gi` as Unit.Storage & Unit.Memory
}

export function Mi(n: number) {
    return `${n}Mi` as Unit.Storage & Unit.Memory
}

export function d(n: number) {
    return `${n * 24}h` as Unit.Time
}

export function h(n: number) {
    return `${n}h` as Unit.Time
}

export function s(n: number) {
    return `${n}s` as Unit.Time
}

export function ms(n: number) {
    return `${n}ms` as Unit.Time
}
