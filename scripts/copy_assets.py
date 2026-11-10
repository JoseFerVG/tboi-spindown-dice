import os, shutil

# Create web app structure
os.makedirs('public/items', exist_ok=True)
os.makedirs('public/sfx', exist_ok=True)
os.makedirs('public/ui', exist_ok=True)

# Copy sprites
src_sprites = 'temp_pack/extracted_resources/resources/gfx/items/collectibles'
dst_sprites = 'public/items'

copied = 0
for f in os.listdir(src_sprites):
    if f.endswith('.png'):
        shutil.copy2(os.path.join(src_sprites, f), os.path.join(dst_sprites, f))
        copied += 1

print(f"Copied {copied} collectible PNGs to public/items")

# Copy pedestal altar
src_altar = 'temp_pack/extracted_resources/resources/gfx/items/levelitem_001_itemaltar.png'
if os.path.exists(src_altar):
    shutil.copy2(src_altar, 'public/ui/pedestal.png')
    print("Copied pedestal altar to public/ui/pedestal.png")

# Copy d6 sound
src_sfx = 'temp_pack/extracted_resources/resources/sfx/the_d6_roll.wav'
if os.path.exists(src_sfx):
    shutil.copy2(src_sfx, 'public/sfx/the_d6_roll.wav')
    print("Copied d6 sound to public/sfx/the_d6_roll.wav")

# Copy achievement banner
src_ach = 'temp_pack/extracted_resources/resources/gfx/ui/achievement/achievement_spindowndice.png'
if os.path.exists(src_ach):
    shutil.copy2(src_ach, 'public/ui/achievement_spindowndice.png')
    print("Copied achievement image to public/ui/achievement_spindowndice.png")
