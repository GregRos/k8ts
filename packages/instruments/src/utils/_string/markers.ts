import chalk from "chalk"

const interchangeable = {
    diamond: "◆",
    star: "★",
    four_shapes: "❖",
    four_star: "✦",
    star_circled_filled: "✪",

    aster: "✱",
    helm: "☸ ",
    ball_circled: "◉",
    lines_circled: "◍ ",
    plus_circled: "⊕ ",

    triangle_down: "▼",
    dot_triangled: "◬",
    diamond_diamonded: "◈",
    circle_squared_filled: "◙",
    triangle_filled_half: "◭",
    heart_arrow: "❥",
    bullet_squared_filled: "◘",
    copyright: "©",
    section: "§",
    paragraph: "¶",
    weird_circle: "¤",
    euro: "€",
    yen: "¥",
    plus_filled: "✚",
    mac_char: "⌘ "
}

const colors = [
    chalk.redBright,
    chalk.yellowBright,
    chalk.blue,
    chalk.magenta,
    chalk.cyan,
    chalk.blueBright
]

const numbered = Object.values(interchangeable)

// We want to have symbols be as distinct as possible
// that means we use each symbol with a different color

// Instead of using all symbols of a single color, then all symbols of another color
// We mix it up, so we only get repeat colors after all symbols have been used

// we can get combinations of color + symbol like this:
// symbol = i % symbols.length
// color = (Math.floor(i / colors.length) + i)

export function getMarkerForIndex(index: number) {
    const clampedIndex = index % numbered.length
    const multiplier = Math.floor(index / numbered.length)
    const char = numbered[clampedIndex]
    const color = colors[(multiplier + clampedIndex) % colors.length]
    const colored = color(char)
    return `${colored} `
}

export function getMarkerForExternal() {
    const external = "∃"
    return chalk.yellowBright(external)
}
