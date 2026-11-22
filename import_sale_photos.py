"""Attach photos to sale listings from extracted photo folders.
Usage: python import_sale_photos.py /path/to/extracted/folder [more folders]
A photo is matched to a listing when its path contains the listing's registration or serial number
as a whole token (for example .../N550GA/01.jpg). Serials of four digits or fewer are ignored, since they look like years. Unmatched files are reported, not guessed.
Only import photos you have the right to publish."""
import os, re, sys, shutil, sqlite3, secrets
HERE = os.path.dirname(os.path.abspath(__file__)); DB = os.environ.get("EXJET_DB", os.path.join(HERE, "exjet.db")); OUT = os.environ.get("EXJET_SALE_PHOTOS", os.path.join(HERE, "sale_photos"))
def main(folders, per_listing=12):
    con = sqlite3.connect(DB); os.makedirs(OUT, exist_ok=True)
    regs, sers = {}, {}   # registration wins. A serial only counts when it cannot be mistaken for a year or a counter
    for lid, reg, ser in con.execute("select id, registration, serial from sale_listings"):
        if reg and len(reg) >= 4: regs.setdefault(reg.upper(), lid)
        if ser and (len(ser) >= 5 or "-" in ser): sers.setdefault(ser.upper(), lid)
    have = dict(con.execute("select listing_id, count(*) from sale_photos group by 1")); done = miss = 0
    for folder in folders:
        for root, _, files in os.walk(folder):
            for fn in sorted(files):
                if not fn.lower().endswith((".jpg", ".jpeg", ".png")): continue
                toks = set(re.split(r"[^A-Z0-9-]+", os.path.join(root, fn).upper()))
                lid = next((regs[t] for t in toks if t in regs), None) or next((sers[t] for t in toks if t in sers), None)
                if not lid: miss += 1; continue
                if have.get(lid, 0) >= per_listing: continue
                name = secrets.token_hex(16) + os.path.splitext(fn)[1].lower()
                shutil.copy(os.path.join(root, fn), os.path.join(OUT, name))
                con.execute("insert into sale_photos(listing_id,file,credit) values(?,?,?)", (lid, name, "")); have[lid] = have.get(lid, 0) + 1; done += 1
    con.commit(); print(f"attached {done} photos to {len([1 for v in have.values() if v])} listings; {miss} files matched no listing")
if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    main(sys.argv[1:])
