---
title: "Fixing Monospace Font Rendering Issues on Ubuntu (Emoji Font Substitution)"
pubDate: 2026-09-03
description: "Diagnosing and fixing font rendering issues where Noto Color Emoji replaces monospace fonts in Chrome and VSCode"
author: "AI-generated"
tags: ["linux", "ubuntu", "fonts", "fontconfig", "chrome", "vscode", "monospace"]
category: "linux"
heroImage: "/images/wiki/ubuntu-font-rendering-hero.svg"
---

Font rendering in Chrome and VSCode showing numbers in different grayscale colors with excessive character spacing?

<!--more-->

## Symptoms

- Numbers and text appear in different grayscale colors (instead of uniform color)
- Excessive spacing between characters in monospace contexts
- Affects Chrome browser and VSCode simultaneously
- Regular (proportional) fonts may appear unaffected

## Root Cause

The system's `fontconfig` is matching the generic `monospace` family to **Noto Color Emoji** instead of a proper monospace font like Ubuntu Mono, Liberation Mono, or DejaVu Sans Mono.

This happens because:
1. Noto Color Emoji is installed and has a higher priority in font matching
2. No explicit monospace font preferences are configured in fontconfig
3. Applications requesting "monospace" get the emoji font, causing rendering anomalies

## Diagnosis Steps

### 1. Check Current Monospace Font Match

```bash
fc-match monospace
```

**Expected (broken):** `NotoColorEmoji.ttf: "Noto Color Emoji" "Regular"`

**Expected (working):** `UbuntuMono[wght].ttf: "Ubuntu Mono" "Regular"` or similar monospace font

### 2. Check Font Settings

```bash
gsettings get org.gnome.desktop.interface monospace-font-name
gsettings get org.gnome.desktop.interface font-antialiasing
gsettings get org.gnome.desktop.interface font-hinting
```

### 3. Verify Available Monospace Fonts

```bash
fc-list :spacing=mono family | sort -u
fc-match "Courier New"
```

## The Fix

### Step 1: Create Fontconfig Override

Create `~/.config/fontconfig/fonts.conf`:

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <alias>
    <family>monospace</family>
    <prefer>
      <family>Ubuntu Mono</family>
      <family>Liberation Mono</family>
      <family>DejaVu Sans Mono</family>
    </prefer>
  </alias>
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Ubuntu</family>
      <family>Liberation Sans</family>
      <family>DejaVu Sans</family>
    </prefer>
  </alias>
  <alias>
    <family>serif</family>
    <prefer>
      <family>Ubuntu</family>
      <family>Liberation Serif</family>
      <family>DejaVu Serif</family>
    </prefer>
  </alias>
</fontconfig>
```

### Step 2: Rebuild Font Cache

```bash
fc-cache -fv
```

### Step 3: Verify the Fix

```bash
fc-match monospace
```

**Output should now be:** `UbuntuMono[wght].ttf: "Ubuntu Mono" "Regular"`

### Step 4: Restart Applications

Restart Chrome and VSCode for changes to take effect.

## Prevention

To prevent this issue from recurring:
- Keep the fontconfig override in place at `~/.config/fontconfig/fonts.conf`
- Ensure monospace fonts are installed: `sudo apt install fonts-ubuntu fonts-liberation fonts-dejavu`

## Related Commands

| Command | Purpose |
|---------|---------|
| `fc-match monospace` | Check what font resolves to monospace |
| `fc-cache -fv` | Rebuild font cache |
| `fc-list :spacing=mono family` | List available monospace fonts |
| `gsettings get org.gnome.desktop.interface monospace-font-name` | Check GNOME monospace font setting |

## Environment

- **OS:** Ubuntu (various versions)
- **Affected Applications:** Chrome, VSCode, Electron-based apps
- **Fontconfig Version:** Any
- **Date Found:** 2026-09-03
