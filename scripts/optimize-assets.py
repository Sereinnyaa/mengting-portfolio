from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets"

ASSETS = {
    "focus-assistant.png": ("focus-assistant.webp", 1800, 88, False),
    "qa-office.png": ("qa-office.webp", 1800, 84, False),
    "tripsage-home.png": ("tripsage-home.webp", 1800, 88, False),
    "autodeck-output.png": ("autodeck-output.webp", 1800, 88, False),
    "fulfillment-life.png": ("fulfillment-life.webp", 1800, 84, False),
    "qa-evaluation.png": ("qa-evaluation.webp", 1800, 88, False),
    "fulfillment-brain.png": ("fulfillment-brain.webp", 1800, 88, False),
    "tripsage-results.png": ("tripsage-results.webp", 1800, 88, False),
    "focus-life-v2.jpg": ("focus-life-v2.webp", 1800, 84, False),
    "autodeck-input.png": ("autodeck-input.webp", 1800, 88, False),
    "tripsage-knowledge.png": ("tripsage-knowledge.webp", 1800, 88, False),
    "hero-avatar-rimless-glasses.png": ("hero-avatar-rimless-glasses.webp", 1400, 92, True),
    "hero-avatar-black-glasses.png": ("hero-avatar-black-glasses.webp", 1400, 92, True),
}


def optimize(source_name: str, target_name: str, max_edge: int, quality: int, lossless: bool) -> None:
    source = PUBLIC / source_name
    target = PUBLIC / target_name
    image = ImageOps.exif_transpose(Image.open(source))

    if max(image.size) > max_edge:
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)

    save_options = {"format": "WEBP", "method": 6}
    if lossless:
        save_options.update({"lossless": True, "quality": quality})
    else:
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        save_options.update({"quality": quality})

    image.save(target, **save_options)
    before = source.stat().st_size / 1024
    after = target.stat().st_size / 1024
    print(f"{source_name}: {before:.0f} KB -> {after:.0f} KB")


if __name__ == "__main__":
    for source_name, (target_name, max_edge, quality, lossless) in ASSETS.items():
        optimize(source_name, target_name, max_edge, quality, lossless)
