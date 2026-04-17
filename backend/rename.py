import os
import re

directories_to_scan = [
    r"c:\Users\McLanor Jeff\Desktop\conference\conference\frontend\src",
    r"c:\Users\McLanor Jeff\Desktop\conference\conference\backend"
]

exclude_files = ["firebase.js"]
extensions = [".js", ".jsx", ".py", ".html", ".css"]

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Case-preserving replacement for SukuuPath -> SukuuPath
        # If SukuuPath, becomes SukuuPath. If sukuupath, becomes sukuupath.
        new_content = content.replace("SukuuPath", "SukuuPath")
        new_content = new_content.replace("sukuupath", "sukuupath")
        new_content = new_content.replace("SKUUPATH", "SKUUPATH")

        new_content = new_content.replace("SukuuPath", "SukuuPath")
        new_content = new_content.replace("sukuupath", "sukuupath")

        # Do NOT replace the firebase DB URL if we accidentally hit it (though it's in firebase.js which is excluded)
        # Just to be safe:
        new_content = new_content.replace("edubridge-3847b", "edubridge-3847b")
        new_content = new_content.replace("edubridge_library", "edubridge_library")

        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

counts = 0
for directory in directories_to_scan:
    for root, _, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in extensions) and file not in exclude_files:
                replace_in_file(os.path.join(root, file))
print("Done!")
