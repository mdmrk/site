---
title: "Zig package manager, easy guide"
description: "zig package manager"
pubDate: "04/15/2024"
---

In this blog post I will sum up Zig's package manager on version `0.12.0-dev.3653+e45bdc6bd` of the language.

## build.zig.zon

A Zig program has a file `build.zig.zon` in its root. Think of this file as a kind of `package.json`. It stores some information about your project like name, version and dependencies.

## adding a new remote dependency

Zig doesn't provide an official package repository. Our remote dependencies must come from sources we specify manually. To add a new dependency use `zig fetch --save <url>`. Note that dependencies are required to include a `build.zig.zon` and that the url must be a **tarball**. If it's not present, it won't work. e.g.:

```zsh
foo@bar:~$ zig fetch --save https://github.com/PiergiorgioZagaria/zmath/archive/refs/heads/main.tar.gz
error: unable to determine name; fetched package has no build.zig.zon file
foo@bar:~$
```

`build.zig.zon` included

```zsh
foo@bar:~$ zig fetch --save https://github.com/ziglibs/zgl/archive/refs/heads/master.tar.gz
foo@bar:~$
```

This will produce the following in your `build.zig.zon`

```zig
.dependencies = .{
    .zgl = .{
        .url = "https://github.com/ziglibs/zgl/archive/refs/heads/master.tar.gz",
        .hash = "1220724f36394bc0d2327b11ceb5124a6c8be23cc3fd73b230c1ebd46a910b8911da",
    },
},
```
