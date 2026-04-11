const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('src/components', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /import styles from "[^"]+\.module\.scss";\r?\n?/g;
    
    let matches = [];
    let match;
    // We only want to touch files that have our auto-injected style imports
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[0]);
    }

    if (matches.length > 0) {
      // Distinct matches (in case of duplicates)
      let uniqueImport = matches[0].trim();
      
      // Remove all occurrences of import styles
      content = content.replace(regex, '');
      
      // Prepend cleanly at the top
      if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
        const firstNewLine = content.indexOf('\n');
        if (firstNewLine !== -1) {
          content = content.slice(0, firstNewLine + 1) + uniqueImport + '\n' + content.slice(firstNewLine + 1);
        } else {
          content = content + '\n' + uniqueImport + '\n';
        }
      } else {
        content = uniqueImport + '\n' + content;
      }
      
      fs.writeFileSync(filePath, content);
      console.log('Cleaned', filePath);
    }
  }
});
