---
title: "minimal gentoo installation"
description: "installing gentoo on my machine. intel + nvidia"
pubDate: "04/07/2025"
updatedDate: "04/10/2025"
---

in this short guide I'll try to explain my process of installing **gentoo** in a minimal way. Then I'll install **wayland** and **sway** as wm.

this is just a hobby blogpost, I strongly recommend to read and follow carefully [the official gentoo guides](https://wiki.gentoo.org/wiki/Handbook:AMD64).

### disks

#### partitions

```sh
fdisk /dev/sda
```

configuring the disks here. for my one and only SSD I'm setting up the following:

| partition | type            | size                     | format |
| :-------- | :-------------- | :----------------------- | :----- |
| /dev/sda1 | EFI             | 1G                       | fat32  |
| /dev/sda2 | Swap            | 2G                       | swap   |
| /dev/sda3 | Linux partition | Remaining space (900+GB) | ext4   |

#### filesystems

```sh
# boot partition
mkfs.vfat -F 32 /dev/sda1

# swap partition
mkswap /dev/sda2
swapon /dev/sda2

# root partition
mkfs.ext4 /dev/sda3
```

#### mount

```sh
mkdir --parents /mnt/gentoo
mount /dev/sda3 /mnt/gentoo
mkdir --parents /mnt/gentoo/efi ### boot partition will be mounted later
```

### base system

I'll go for **openrc**.

```sh
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/ # > Downloads > Stage 3 openrc
tar xpvf stage3-_.tar.xz --xattrs-include='_.\*' --numeric-owner -C /mnt/gentoo
```

#### cflags, rustflags, ...

add the common optimization flags

```sh
vi /mnt/gentoo/etc/portage/make.conf

>> -march=native
>> MAKEOPTS="-j8"
>> RUSTFLAGS="${RUSTFLAGS} -C target-cpu=native"
```

### use flags

this are my use flags of choice. it's likely some change but these are the main ones.

```sh
USE="X wayland icu opengl vulkan dist-kernel dbus nvidia pulseaudio -elogind -wayland -systemd -elogind -qt4 -qt5 -dvd -bluetooth -a52 -gnome -cups -gtk -emacs -kde -discord"
```

### installing

```sh
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/
arch-chroot /mnt/gentoo

# we are now on system

mount /dev/sda1 /efi
emerge-webrsync
```

#### profile

plain profile. i'll add use flags and needed configs on the go

```sh
eselect profile set 21
```

#### finish up `make.conf`

```sh
emerge --ask --oneshot app-portage/cpuid2cpuflags

echo "*/* $(cpuid2cpuflags)" > /etc/portage/package.use/00cpu-flags
echo "*/* VIDEO_CARDS: nvidia" > /etc/portage/package.use/00video_cards

>> ACCEPT_LICENSE="\*"
>> ACCEPT_KEYWORDS="~amd64"

emerge --ask --verbose --update --deep --changed-use @world # update shouldn't take long given our chosen profile
emerge --ask --depclean
```

#### timezone

```sh
ln -sf ../usr/share/zoneinfo/Europe/Madrid /etc/localtime
```

#### locale

```sh
nano /etc/locale.gen

en_US ISO-8859-1 # uncomment
en_US.UTF-8 UTF-8 # uncomment

locale-gen
eselect locale list
eselect locale set 2

env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### kernel

i will be using the `installkernel` tool as I find it simpler than any other methods. Also I will be installing a kernel from source. Using `grub` and `dracut`.

```sh
nano /etc/portage/package.use/installkernel
sys-kernel/installkernel grub dracut

emerge --ask sys-kernel/installkernel
emerge -a sys-firmware/intel-microcode sys-kernel/linux-firmware
```

#### configure

i won't be customizing the kernel config for the moment, just installing straight away.

```sh
emerge -av gentoo-kernel
```

#### fstab

for an easier approach I'm using the 'genfstab' utility.

```sh
emerge genfstab
genfstab / >> /etc/fstab
```

#### hostname

```sh
echo gentoo > /etc/hostname
```

#### network

my approach is simple as I'm only using ethernet.

```sh
emerge dhcpcd
rc-update add dhcpcd default
```

#### root passwd

```sh
passwd
```

#### keymap

remember to set your default keymap, altough we will need to change it for sway later on.

```sh
nano /etc/conf.d/keymaps
```

#### system logger

```sh
emerge --ask app-admin/sysklogd
rc-update add sysklogd default
```

#### time sync

```sh
emerge --ask net-misc/chrony
rc-update add chronyd default
```

### bootloader

```sh
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
emerge --ask --verbose sys-boot/grub
grub-install --efi-directory=/efi
grub-mkconfig -o /boot/grub/grub.cfg
```

we are done! exit and reboot the system.

### wayland and sway

to install wayland, again the gentoo wiki is very well self explanatory.

```sh
emerge wayland qtwayland xwayland
echo "QT_QPA_PLATFORM=wayland" > /etc/environment
```

i won't be using `systemd` nor `elogind` so or next approach will be using `seat`. To setup a backend server is very easy:
need seatd package.use with flags server, builtin

```sh
rc-update add seatd default
gpasswd -a larry seat
```

in .bash_profile or equivalent

```sh
#!/bin/sh
if test -z "${XDG_RUNTIME_DIR}"; then
    export XDG_RUNTIME_DIR=/tmp/"${UID}"-runtime-dir
  if ! test -d "${XDG_RUNTIME_DIR}"; then
          mkdir "${XDG_RUNTIME_DIR}"
  chmod 0700 "${XDG_RUNTIME_DIR}"
  fi
fi
```

```sh
dbus-run-session sway
```

### pipewire

very easy to install as well. here are some steps:

```sh
usermod -aG pipewire mrk

~/.config/sway/config
>> exec gentoo-pipewire-launcher restart &
```
