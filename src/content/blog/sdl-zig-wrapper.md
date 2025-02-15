---
title: "wrapping SDL3 for Zig"
description: "breifly explaining the process to wrap a C lib to Zig"
pubDate: "02/14/2025"
updatedDate: "02/15/2025"
---

SDL3 just got released not so long ago, and while it is an amazing library providing many functionalities across multiple platforms, there is something that bothers me a little bit.

Lately I switched to Zig for most of my development time as I enjoyed many of the features it brings to the table, one being the great C interoperability. However, C library APIs can be a little shocking to work with for me and SDL is an example of that.

Using straight up C, writting a simple event loop would result in something like:

```zig
const c = @cImport({
    @cInclude("SDL3/SDL.h");
    @cDefine("SDL_MAIN_HANDLED", {});
    @cInclude("SDL3/SDL_main.h");
});

pub fn main() !void {
    try errify(c.SDL_Init(c.SDL_INIT_VIDEO));
    defer c.SDL_Quit();

    const window = try errify(c.SDL_CreateWindow(
        "redbed",
        1280,
        720,
        c.SDL_WINDOW_RESIZABLE,
    ));
    defer c.SDL_DestroyWindow(window);

    main_loop: while (true) {
        var event: c.SDL_Event = undefined;

        while (c.SDL_PollEvent(&event)) {
            if (event.type == c.SDL_EVENT_QUIT) break :main_loop;
        }
    }
}
```

It is ok for me, but I want better. So I wrote a partial wrapper to take advantage of Zig's coding patterns and called it [zsdl](https://github.com/mdmrk/zsdl).

I decided to respect the namespaces and group objects and functions in separate files. This is a glimpse of my approach, a code snippet from `video.zig` which contains definitions for `Display` and `Window` among a few more.

```zig
pub const Window = struct {
    ptr: *c.SDL_Window,

    /// Create a window with the specified dimensions and flags.
    pub fn create(
        title: [:0]const u8,
        width: comptime_int,
        height: comptime_int,
        flags: WindowFlags,
    ) !Window {
        return .{
            .ptr = try errify(c.SDL_CreateWindow(
                title.ptr,
                width,
                height,
                flags.toInt(),
            )),
        };
    }
}
```

Notice the use of `errify()` for cleaner error handling, this function aimed to resolve types at comptime:

```zig
pub inline fn errify(value: anytype) error{SdlError}!switch (@typeInfo(@TypeOf(value))) {
    .bool => void,
    .pointer, .optional => @TypeOf(value.?),
    .int, .float => @TypeOf(value),
    else => @compileError("unerrifiable type: " ++ @typeName(@TypeOf(value))),
} {
    return switch (@typeInfo(@TypeOf(value))) {
        .bool => if (!value) error.SdlError,
        .pointer, .optional => value orelse error.SdlError,
        .int, .float => if (value == 0) return error.SdlError else value,
        else => comptime unreachable,
    };
}
```

The final look of the first example would end up like this:

```zig
const zsdl = @import("zsdl");

pub fn main() !void {
    try zsdl.init(.{ .video = true });
    defer zsdl.quit();

    const window = try zsdl.video.Window.create(
        "redbed",
        1280,
        720,
        .{ .resizable = true },
    );
    defer window.destroy();

    main_loop: while (true) {
        while (zsdl.events.pollEvent()) |event| {
            if (event == .quit) break :main_loop;
        }
    }
}
```

Despite needing some polish and not covering the full api, this is already enough for me to get started in some SDL coding.
