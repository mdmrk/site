---
title: "yt-dlp + mpv - fast and lean video player"
description: "watching videos and other media through yt-dlp and mpv"
pubDate: "04/17/2024"
---

With Youtube making everything possible to block third-party clients and adblockers to keep you at their bloated site, there are alternatives still available. At the time of writing this, you can browse [Indivious](https://yewtu.be/) or [Piped](piped.yt) and they're good alternatives.

On the other hand, you can watch YT on your video player `mpv` using yt-dlp to extract the video from its url. That simple:

```zsh
mpv --ytdl-format=bestvideo+bestaudio [url]
# or
yt-dlp -f bestvideo+bestaudio [url] -g | xargs mpv
```

Enjoy!
