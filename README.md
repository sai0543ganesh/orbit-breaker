# Orbit Breaker

A small, dependency-free browser arcade game. Circle a glowing orbit, collect stardust, and avoid incoming fragments as the pace increases.

## Play

Download or clone this repository and open **index.html** in a modern browser. No build step, account, or installation is needed.

| Control | Action |
| --- | --- |
| Left / Right arrows or A / D | Move around the orbit |
| Space | Pause or resume |
| On-screen arrow buttons | Touch and mouse controls |
| Sound button | Toggle synthesized sound effects |

Each stardust pickup earns one point. Your best score is saved locally when browser storage is available. Switching tabs automatically pauses a flight.

## Features

- Responsive layout with keyboard and touch controls
- Canvas rendering with time-based movement
- Gradually increasing difficulty
- Optional synthesized audio, with no audio assets to download
- Local best score and automatic pause
- No frameworks or runtime packages

## Files

```text
index.html   Page structure and accessible controls
style.css    Responsive visual design
game.js      Game loop, input, collisions, scoring and sound
```

The optional Google Fonts stylesheet uses DM Sans and Space Grotesk. System fonts work when offline. The game itself needs no network connection.

## Development status

Initial implementation. This version has not been run or play-tested. Browser compatibility and gameplay balancing still need manual verification.

## License

MIT. See [LICENSE](LICENSE).
