import simpleGit from "simple-git"

export interface GitTraceOptions {
    cwd: string
    absolute: boolean
}

export async function getGitTrace(options: GitTraceOptions) {
    const sg = simpleGit(options.cwd)
    const isRepo = await sg.checkIsRepo()
    if (!isRepo) {
        return null
    }
    const r = await sg.log({
        maxCount: 1
    })
    console.log(r)
}
