import re

with open('dist/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check if script is inside head
script_match = re.search(r'<script\b[^>]*>[\s\S]*?<\/script>', html)
if script_match:
    script_tag = script_match.group(0)
    print("Found script tag of length:", len(script_tag))
    
    # Remove script from current position
    html_without_script = html.replace(script_tag, '')
    
    # Make sure script tag does not require module if not needed, or keep it safe
    # Replacing type="module" crossorigin with defer
    safe_script_tag = re.sub(r'<script\b[^>]*>', '<script defer>', script_tag)
    
    # Put it right before </body>
    if '</body>' in html_without_script:
        new_html = html_without_script.replace('</body>', f'{safe_script_tag}\n</body>')
        print("Moved script tag right before </body>!")
    else:
        new_html = html_without_script + f'\n{safe_script_tag}'
        
    with open('dist/index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("dist/index.html updated successfully!")
