import { readFile } from "fs/promises"
export class Proverbs {
    constructor(private _proverbs: string[]) {}
    static async make(file: string) {
        const loaded = await readFile(file, "utf-8")
        const lines = loaded.split("\n")
        return new Proverbs(lines)
    }

    get random() {
        const idx = Math.floor(Math.random() * this._proverbs.length)
        return this._proverbs[idx]
    }
}
