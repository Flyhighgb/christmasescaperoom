# The Midnight Workshop 🎄

An original, cooperative, multiplayer Christmas escape room that runs in the browser.

> Christmas Eve, 11:59 pm. Grandpa Tobias's Great Clock has stopped, and without it Christmas morning can never arrive. Work together through his snowed-in cottage, solve his puzzles, and restart the clock before midnight.

- **Players:** 1 to 12, each on their own device (laptop or tablet is best; phones work in landscape).
- **Ages:** 8+ with adults. Robin the hint bird gives up to three hints per puzzle, the last one being the answer.
- **Length:** about 30 to 60 minutes. The 60-minute timer keeps counting as "overtime" if you go past it, so nobody loses.
- **Multiplayer:** one person creates a room and shares the 4-letter code or link. Everyone sees the same puzzles, live cursors, emoji pings, the shared satchel, chat and hints. The bell puzzle splits its clues between players, so people have to talk to each other.

## Play it on your own computer (2 minutes)

1. Install Node.js 18 or newer from https://nodejs.org
2. In this folder run:
   ```
   npm install
   npm start
   ```
3. Open http://localhost:3000. Other people on the **same Wi-Fi** can join at `http://<your-computer's-IP>:3000`.

## Host it at christmasescaperoom.co.uk (recommended for family in other homes)

The game is a small Node.js web server with WebSockets, so it needs a host that runs Node (not a static-only host). [Render](https://render.com) is the simplest:

1. Put this folder in a GitHub repository (or ask Claude to push it to an empty one you create).
2. On Render: **New → Blueprint**, pick the repository. Render reads `render.yaml` and creates the `midnight-workshop` web service. (Or **New → Web Service** with build command `npm install` and start command `npm start`.)
3. Plan: the **Free** plan is all you need. It sleeps after about 15 idle minutes and takes up to a minute to wake, so open the site a few minutes before you play. While anyone has the game open it stays awake by itself.
4. Custom domain: in the service go to **Settings → Custom Domains** and add `christmasescaperoom.co.uk` and `www.christmasescaperoom.co.uk`. Render then shows the exact DNS records to add.
5. At your domain registrar's DNS settings, add the records Render shows: an **A record** (or ALIAS/ANAME) for the bare domain, and a **CNAME** for `www` pointing at your `*.onrender.com` address. Remove any old A/AAAA records for the same names. Render issues the HTTPS certificate automatically once DNS has updated (usually minutes, sometimes a few hours).
6. Visit https://christmasescaperoom.co.uk, create a room, and send the link to everyone.

Tip: do a test run a few days before Christmas so you know the domain and certificate are working.

## On the day

- One person (the "host") opens the site, enters a name and presses **Create a new room**, then shares the link.
- When everyone's in the lobby, anyone presses **Begin the adventure**.
- Sit together or get on a video call, because talking is half the fun.
- If someone's browser closes, they just reopen the same link and rejoin where they left off.
- **Play again** on the victory screen resets the room.

The host should **not** read `SOLUTIONS.md` if they want to play too!

## Files

- `server.js`: web + WebSocket server, rooms and room codes.
- `puzzles.js`: puzzle rules, answers and hints (checked on the server).
- `public/`: the game itself: `art.js` (all illustrations, hand-built SVG), `game.js` (gameplay & UI), `audio.js` (synthesised bells and music), `style.css`.
