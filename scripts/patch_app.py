with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import itemsData
code = code.replace(
    "import confetti from 'canvas-confetti';",
    "import confetti from 'canvas-confetti';\nimport itemsData from './data/items_db.json';"
)

# Replace initial state and remove useEffect fetch
old_fetch = """  // Load Database
  useEffect(() => {
    fetch('/items_db.json')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load items_db.json', err);
        setLoading(false);
      });
  }, []);"""

new_init = """  // Preloaded Database
  const [items, setItems] = useState(itemsData);
  const [loading, setLoading] = useState(false);"""

code = code.replace("  const [items, setItems] = useState([]);\n  const [loading, setLoading] = useState(true);", "")
code = code.replace(old_fetch, new_init)

# Replace audio path
code = code.replace("'/sfx/the_d6_roll.wav'", "'sfx/the_d6_roll.wav'")

# Replace image paths from absolute to relative
code = code.replace("'/items/", "'items/")
code = code.replace("`/items/", "`items/")
code = code.replace('"/items/', '"items/')

code = code.replace("'/ui/", "'ui/")
code = code.replace('"/ui/', '"ui/')
code = code.replace("`/ui/", "`ui/")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated src/App.jsx for offline/file:// compatibility!")
