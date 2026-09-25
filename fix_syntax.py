import os

dir_path = 'src/pages'
for file_name in os.listdir(dir_path):
    if not file_name.endswith('.tsx'): continue
    
    file_path = os.path.join(dir_path, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The previous python script inserted: style={{ marginBottom: \'32px\' }}
    # We want to replace it with: style={{ marginBottom: '32px' }}
    content = content.replace("style={{ marginBottom: \\'32px\\' }}", "style={{ marginBottom: '32px' }}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
