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

    get text() {
        const hashPart = this.props.commit.sha.slice(0, 7)
        const shortDate = dayjs(this.props.commit.date).format("YYYY-MM-DD")
        const shortMessage = this.props.commit.message.split("\n")[0].slice(0, 20)
        const author = this.props.commit.author
        return `${hashPart} '${shortMessage}⋯' (${author}@${shortDate})`
    }

    static async make(options?: Partial<GitTraceOptions>) {
        options = {
            cwd: ".",
            absolute: false,
            ...options
        }
        const sg = simpleGit(options.cwd)
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
