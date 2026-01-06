import { Meta } from "@k8ts/metadata"
import dayjs from "dayjs"
import simpleGit from "simple-git"

export interface Trace_Git_CreateOptions {
    cwd: string
    absolute: boolean
}

export interface Trace_Git_Props {
    commit: {
        sha: string
        message: string
        author: string
        date: string
    }
}
export class Trace_Git {
    private constructor(readonly props: Trace_Git_Props) {}

    get metaFields() {
        const hashPart = this.props.commit.sha.slice(0, 7)
        const shortDate = dayjs(this.props.commit.date).format("YYYY-MM-DD")
        const shortMessage = this.props.commit.message.split("\n")[0].slice(0, 50)
        const author = this.props.commit.author

        return new Meta({
            "git.k8ts.org/": {
                "^sha": hashPart,
                "^message": shortMessage,
                "^author": author,
                "^date": shortDate
            }
        })
    }

    static async create(options?: Partial<Trace_Git_CreateOptions>) {
        options = {
            cwd: ".",
            absolute: false,
            ...options
        }
        try {
            var sg = simpleGit(options.cwd)
        } catch (err: any) {
            if (err.code === "ENOENT") {
                console.warn(`Git not found or not a repo; skipping git trace.`)
                return undefined
            }
            throw err
        }
        const isRepo = await sg.checkIsRepo()
        if (!isRepo) {
            return undefined
        }
        const l = await sg.log({
            maxCount: 1
        })
        return new Trace_Git({
            commit: {
                sha: l.latest!.hash,
                message: l.latest!.message,
                author: l.latest!.author_name,
                date: l.latest!.date
            }
        })
    }
}
