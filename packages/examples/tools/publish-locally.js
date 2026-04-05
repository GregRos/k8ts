#!/usr/bin/env node
const path = require("path")

const EXAMPLES_ROOT = path.resolve(__dirname, "..").replaceAll("\\", "/")
const LIB_DIR = `${EXAMPLES_ROOT}/.lib`
const WORKSPACE_ROOT = `${EXAMPLES_ROOT}/../..`

const fs = require("fs/promises")
const { execa: execa_ } = require("execa")
const k8tsWorkspaceExec = execa_({
    cwd: WORKSPACE_ROOT,
    reject: true,
    stdio: "pipe",
    env: { ...process.env, FORCE_COLOR: "0" }
})
const k8tsExamplesExeca = execa_({
    cwd: `${EXAMPLES_ROOT}`,
    reject: true,
    stdio: "pipe",
    env: { ...process.env, FORCE_COLOR: "0" }
})

const K8TS_PACKAGES = ["@k8ts/instruments", "@k8ts/metadata", "@k8ts/sample-interfaces", "k8ts"]

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true })
}

async function cleanLibDir() {
    console.log("Cleaning .lib directory...")
    try {
        await fs.rm(LIB_DIR, { recursive: true, force: true })
    } catch (error) {
        // Directory might not exist, that's fine
    }
    await ensureDir(LIB_DIR)
}

async function readPackageJson(packagePath) {
    const pkgJsonPath = path.join(packagePath, "package.json")
    const content = await fs.readFile(pkgJsonPath, "utf-8")
    return JSON.parse(content)
}

async function buildWorkspace() {
    console.log(`\nBuilding workspace...`)
    await k8tsWorkspaceExec`yarn build`
}

async function packPackage(packageName) {
    const tgzName = packageName.replaceAll("/", "-")
    console.log(`\nPacking ${packageName}...`)
    const tgzAbsPath = path.join(LIB_DIR, `${tgzName}.tgz`)
    await k8tsWorkspaceExec`yarn workspace ${packageName} pack --out ${tgzAbsPath}`
    const tgzRelPath = path.relative(`${EXAMPLES_ROOT}`, tgzAbsPath).replaceAll("\\", "/")
    return {
        name: packageName,
        tgzRelPath: tgzRelPath
    }
}

async function main() {
    console.log("=".repeat(60))
    console.log("Publishing k8ts packages locally")
    console.log("=".repeat(60))

    await cleanLibDir()

    const packedFiles = []
    await buildWorkspace()
    const allPacks = await Promise.all(K8TS_PACKAGES.map(packPackage))
    const joinedPackSpecs = allPacks.map(p => `${p.name}@file:${p.tgzRelPath}`)
    await k8tsExamplesExeca`yarn add ${joinedPackSpecs}`
}

main()
