import chalk from "chalk"
import PE from "pretty-error"
function getPrettyError() {
    const PrettyError = require("pretty-error")
    const pe = new PrettyError()
    const whatRegexp =
        /(?<async>async )?(?:(?<target>[a-zA-Z0-9_]+)?\.(?<method>[a-zA-Z0-9_]+|<anonymous>)|(?<method2>.*))/
    pe.filter((o: any) => {
        const result = whatRegexp.exec(o.what)
        if (!result) {
            return true
        }
        let { async, target, method, method2 } = result.groups as any

        let flags = []
        if (async) {
            flags.push("📨")
        }
        if (o.packageName === "[current]") {
            flags.push("🏠")
        } else {
            flags.push("📦")
        }

        const targ = chalk.bold.blue(target ?? "")
        o.what = method
            ? `${targ}.${chalk.yellowBright(method)}`
            : method2
              ? chalk.yellowBright(method2)
              : "???"
        o.file = chalk.underline.greenBright(o.file)
        const preFileFlags = flags.join(" ")
        o.file = `${preFileFlags} ${o.file}`
        return true
    })
    pe.appendStyle({
        "pretty-error > header": {
            padding: "0 2"
        },
        // the 'colon' after 'Error':
        "pretty-error > header > colon": {
            // we hide that too:
            display: "none"
        },

        // our error message
        "pretty-error > header > message": {
            // we can use black, red, green, yellow, blue, magenta, cyan, white,
            // grey, bright-red, bright-green, bright-yellow, bright-blue,
            // bright-magenta, bright-cyan, and bright-white

            // it understands paddings too!
            padding: "1 1" // top/bottom left/right
        },

        // each trace item ...
        "pretty-error > trace > item": {
            // ... can have a margin ...
            marginLeft: 2,

            // ... and a bullet character!
            bullet: '"<grey>o</grey>"',
            marginTop: 0,
            marginBottom: 0
            // Notes on bullets:
            //
            // The string inside the quotation mark gets used as the character
            // to show for the bullet point.
            //
            // You can set its color/background color using tags.
            //
            // This example sets the background color to white, and the text color
            // to cyan, the character will be a hyphen with a space character
            // on each side:
            // example: '"<bg-white><cyan> - </cyan></bg-white>"'
            //
            // Note that we should use a margin of 3, since the bullet will be
            // 3 characters long.
        },

        "pretty-error > trace > item > header > pointer > file": {
            color: "bright-cyan"
        },

        "pretty-error > trace > item > header > pointer > colon": {
            color: "cyan"
        },

        "pretty-error > trace > item > header > pointer > line": {
            color: "bright-cyan"
        },

        "pretty-error > trace > item > header > what": {
            color: "bright-white"
        },

        "pretty-error > trace > item > footer > addr": {
            display: "none"
        }
    })
    return pe as PE
}
export const MyPrettyError = getPrettyError()
