---
title: "screenshots in dwm"
description: "short explanation on how to trigger scrot while running dwm without patches"
pubDate: "07/16/2024"
updatedDate: "07/18/2024"
---

Finally, a new post after 3 months, been busy... Today I will be using `scrot` for screen grabbing inside dwm. For this to work I'll be using a helper macro that spawns a shell command, which should already be inside your `config.h` file. There is another work around to this that will be explained at the end.

### Method 1

Find or create the macro inside `config.h`.

```c
#define SHCMD(cmd) { .v = (const char*[]){ "/bin/sh", "-c", cmd, NULL } }
```

Define your screenshot command, in my case I'll name it `SSCMD`.

```c
#define SSCMD "scrot -s -l mode=edge -e 'xclip -selection clipboard -t image/png -i $f' /home/{USER}/Pictures/screenshots/screenshot_%Y-%m-%d_%H.%M.%S.png"
```

| Part                                                                 | Description                       |
| -------------------------------------------------------------------- | --------------------------------- |
| `scrot`                                                              | Screen capture utility            |
| `-s`                                                                 | Select area to capture            |
| `-l mode=edge`                                                       | Highlight selection edges         |
| `-e '...'`                                                           | Run command after capture         |
| `xclip -selection clipboard -t image/png -i $f`                      | Copy screenshot to clipboard      |
| `/home/{USER}/Pictures/screenshots/screenshot_%Y-%m-%d_%H.%M.%S.png` | Save path with timestamp filename |

Finnaly add a new keybinding.

```c
static const Key keys[] = {
    // ...
    { MODKEY|ShiftMask,         XK_s,           spawn,          SHCMD(SSCMD) },
    // ...
}
```

If you find some trouble you can try adding a small delay just like this:

```c
#define SSCMD "sleep 0.2; scrot ..."
```

### Method 2

Apply the [keypressrelease patch](https://dwm.suckless.org/patches/keypressrelease/).
