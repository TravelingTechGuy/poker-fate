# PokerFate™

PokerFate™ is a fun, interactive web app for poker players who just can't decide their next move. Featuring a responsive, casino-style poker chip that acts as a spinning decision wheel, the app randomly selects your action (Check, Call, Raise, All In!, or Fold) and plays dynamic, context-appropriate sound effects generated entirely using the Web Audio API.

It also features a toggle for an "All In River" mode, instantly swapping the graphic to a 50/50 "Fold or Call" layout for those intense final decisions.

[See it running here](https://pokerfate.netlify.app) [![Netlify Status](https://api.netlify.com/api/v1/badges/8d28d4f1-7788-4053-b809-dbe1e2c773ed/deploy-status)](https://app.netlify.com/projects/pokerfate/deploys)

## Features
- **Scalable SVG Poker Chip:** A crisp, scalable graphic completely generated with SVG for high-quality curves and dynamic text paths.
- **Dynamic Sound Engine:** Action-specific sound effects synthesized on the fly (e.g. happy arpeggios for "Raise" and sad descents for "Fold").
- **Responsive Mobile-First Design:** Fills the screen seamlessly on any device.
- **Game Modes:** Regular mode (5 choices) and "All In River" mode (2 choices).

## How to run locally

You don't need any complex build tools to run PokerFate™. Since it uses modern vanilla HTML, CSS, and JavaScript, you just need a simple HTTP server to serve the static files.

If you have Python 3 installed on your machine, you can run the app locally by following these steps:

1. Open a terminal and navigate to this project folder.
2. Start the built-in Python HTTP server on port 8080:
   ```bash
   python3 -m http.server 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`.

## License
This project is licensed under the MIT License - see the [LICENSE.md](file:///Users/ttg/Code/Poker/poker-fate/LICENSE.md) file for details. All rights reserved Traveling Tech Guy LLC.
