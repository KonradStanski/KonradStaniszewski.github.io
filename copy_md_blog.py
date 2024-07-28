#!/usr/bin/env python3
import os
import shutil
import re

# Define source and destination directories
markdown_src_dir = os.path.expanduser('~/git/obsidian/personal/blog/completed')
image_src_dir = os.path.expanduser('~/git/obsidian/personal/blog/images')
markdown_dst_dir = os.path.expanduser('~/git/konradstaniszewski.github.io/blog')
image_dst_dir = os.path.expanduser('~/git/konradstaniszewski.github.io/public/images/blog')

# Ensure destination directories exist
os.makedirs(markdown_dst_dir, exist_ok=True)
os.makedirs(image_dst_dir, exist_ok=True)

# Copy markdown files and change extension to .mdx
for filename in os.listdir(markdown_src_dir):
    if filename.endswith('.md'):
        print(f"Copying {filename}...")
        src_file = os.path.join(markdown_src_dir, filename)
        dst_file = os.path.join(markdown_dst_dir, filename[:-3] + '.mdx')

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

