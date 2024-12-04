#!/usr/bin/env python3
import os
import shutil
import re

# outline of what this script does:
# copy all files in `md_src_dir` which have `status: completed` into `md_dst_dir`


# Define source and destination directories
md_src_dir = os.path.expanduser('~/git/obsidian/personal/blog')
image_src_dir = os.path.expanduser('~/git/obsidian/personal/blog/images')
md_dst_dir = os.path.expanduser('~/git/konradstaniszewski.github.io/blog')
image_dst_dir = os.path.expanduser('~/git/konradstaniszewski.github.io/public/images/blog')

# Ensure destination directories exist
os.makedirs(md_dst_dir, exist_ok=True)
os.makedirs(image_dst_dir, exist_ok=True)

# Copy markdown files and change extension to .mdx
for filename in os.listdir(md_src_dir):
    if filename.endswith('.md'):
        # check with re for presence of `status: completed` in file
        is_status_completed = False
        with open(os.path.join(md_src_dir, filename), 'r') as file:
            for line in file:
                if 'status: completed' in line:
                    is_status_completed = True
                    break
        if is_status_completed:
            print(f"Copying {filename}...")
            src_file = os.path.join(md_src_dir, filename)
            dst_file = os.path.join(md_dst_dir, filename[:-3] + '.mdx')

            # Read the markdown file
            with open(src_file, 'r') as file:
                content = file.read()

            # delete line which starts with "date created"
            content = re.sub(r'^date created:.*\n', '', content, flags=re.MULTILINE)
            content = re.sub(r'^date modified:.*\n', '', content, flags=re.MULTILINE)
            # Replace image links from obsidian format to mdx format
            content = re.sub(r'!\[\[([^\]]+)\]\]', r'<img src={`/images/blog/\1`} />', content)

            # Write the content to the new file
            with open(dst_file, 'w') as file:
                file.write(content)

# Copy image files
for filename in os.listdir(image_src_dir):
    src_file = os.path.join(image_src_dir, filename)
    dst_file = os.path.join(image_dst_dir, filename)
    shutil.copy2(src_file, dst_file)

print("Files copied and modified successfully!")

