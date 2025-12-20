import { Meta } from "@k8ts/metadata"
import dayjs from "dayjs"
import simpleGit from "simple-git"

export interface GitTraceOptions {
    cwd: string
    absolute: boolean
}

export interface GitTraceProps {
    commit: {
        sha: string
        message: string
        author: string
        date: string
    }
}
export class GitTrace {
    private constructor(readonly props: GitTraceProps) {}

    get metaFields() {
        const hashPart = this.props.commit.sha.slice(0, 7)
        const shortDate = dayjs(this.props.commit.date).format("YYYY-MM-DD")
        const shortMessage = this.props.commit.message.split("\n")[0].slice(0, 20)
        const author = this.props.commit.author

        return Meta.make({
            "git.k8ts.org/": {
                "^sha": hashPart,
                "^message": shortMessage,
                "^author": author,
                "^date": shortDate
            }
        })
    }

    static async make(options?: Partial<GitTraceOptions>) {
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
        return new GitTrace({
            commit: {
                sha: l.latest!.hash,
                message: l.latest!.message,
                author: l.latest!.author_name,
                date: l.latest!.date
            }
        })
    }
}
