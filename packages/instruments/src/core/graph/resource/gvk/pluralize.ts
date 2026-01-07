export function pluralize(word: string): string {
    if (["s", "sh", "ch", "x", "z", "ro"].some(suffix => word.endsWith(suffix))) {
        return `${word}es`
    }
    if (["ay", "ey", "iy", "oy", "uy"].some(suffix => word.endsWith(suffix))) {
        return `${word}s`
    }
    if (word.endsWith("y")) {
        return `${word.slice(0, -1)}ies`
    }
    return `${word}s`
}
