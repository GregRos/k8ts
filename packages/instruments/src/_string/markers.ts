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

const colors = [chalk.red, chalk.green, chalk.yellow, chalk.blue, chalk.magenta, chalk.cyan]

const numbered = Object.values(interchangeable)

export function getMarkerForIndex(index: number, alias: string) {
    const clamedIndex = index % numbered.length
    const multiplier = Math.floor(index / numbered.length)
    const char = numbered[clamedIndex]
    const color = colors[multiplier % colors.length]
    const marker = [char, alias].join(" ")
    const colored = color(marker)
    return colored
}

export const external = "∃"
