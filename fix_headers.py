import os
import re

dir_path = 'src/pages'
for file_name in os.listdir(dir_path):
    if not file_name.endswith('.tsx'): continue
    
    file_path = os.path.join(dir_path, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Title h2
    if 'tracking-tight mb-2' not in content:
        content = content.replace(
            'className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight"',
            'className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight mb-2"'
        )
    
    # 2. Subtitle p
    if 'style={{ marginTop: \'10px\', marginBottom: \'16px\' }}' not in content:
        content = content.replace(
            'className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5"',
            'className="text-sm text-[var(--color-text-muted)]" style={{ marginTop: \'10px\', marginBottom: \'16px\' }}'
        )
    
    # 3. Tabs container (adding mb-32 if not exists)
    if 'marginBottom: \'32px\'' not in content:
        content = re.sub(
            r'(<div\s+className="border-b border-\[var\(--color-border\)\][^"]*")\s*>',
            r'\1\n        style={{ marginBottom: \'32px\' }}\n      >',
            content
        )
        # Also handle `gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto` in Financial.tsx
        content = re.sub(
            r'(<div\s+className="border-b border-\[var\(--color-border\)\] flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto")\s*>',
            r'\1\n        style={{ marginBottom: \'32px\' }}\n      >',
            content
        )
    
    # 4. Header wrapper (adding mb-8 if not exists)
    if 'gap-4 mb-8' not in content:
        content = re.sub(
            r'({\s*/\*\s*HEADER\s*\*/\s*}\s*<div\s+className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4)',
            r'\1 mb-8',
            content
        )
        content = re.sub(
            r'({\s*/\*\s*CABEÇALHO SUPERIOR\s*\*/\s*}\s*<div\s+className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4)',
            r'\1 mb-8',
            content
        )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
