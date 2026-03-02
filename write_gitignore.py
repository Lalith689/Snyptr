content = """# Virtual Environments
venv/
venv310/
env/
.env

# Node.js
node_modules/
dist/
npm-debug.log

# Python
__pycache__/
*.py[cod]
*.so

# IDEs
.idea/
.vscode/

# System
.DS_Store
Thumbs.db
"""

with open('.gitignore', 'w', encoding='ascii') as f:
    f.write(content)
print("Written .gitignore in ASCII")
