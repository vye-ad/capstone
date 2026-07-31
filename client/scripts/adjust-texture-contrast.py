# One-time data-prep script (§14): the "earth-dark.jpg" texture from
# three-globe's example gallery (see README Attribution) has real grayscale
# values only in the 0-40 range out of 0-255 (mean brightness ~11) — verified
# by histogram, not by eye. At the sizes this app actually renders the globe
# at, land and ocean were nearly indistinguishable, so the globe read as a
# plain black circle rather than a recognizable Earth.
#
# This stretches that 0-40 input range up to roughly 0-160, which is enough
# contrast for continents to read clearly while staying within the dark,
# low-contrast palette §14 asks for — nothing here approaches a bright,
# photographic look. Source texture: three-globe/example/img/earth-dark.jpg.
#
# Usage: python3 scripts/adjust-texture-contrast.py \
#   <input.jpg> public/textures/earth-dark.jpg
import sys
from PIL import Image

INPUT_MAX = 40
OUTPUT_MAX = 160


def stretch(v):
    return min(255, int(v * (OUTPUT_MAX / INPUT_MAX)))


def main():
    src, dst = sys.argv[1], sys.argv[2]
    im = Image.open(src)
    lut = [stretch(i) for i in range(256)] * 3
    im.point(lut).save(dst, quality=92)
    print(f"Wrote {dst}")


if __name__ == "__main__":
    main()
