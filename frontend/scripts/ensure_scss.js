const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    // Exclude ui folder
    if (dirPath.includes(path.join('components', 'ui'))) return;
    
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(componentsDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    const baseName = path.basename(filePath, '.jsx');
    const scssPath = filePath.replace('.jsx', '.module.scss');
    
    // Create SCSS file if not exists
    if (!fs.existsSync(scssPath)) {
      console.log(`Creating ${scssPath}`);
      
      // Calculate relative path to styles folder
      const dirOfFile = path.dirname(filePath);
      const stylesDir = path.join(__dirname, '..', 'src', 'styles');
      let relativePath = path.relative(dirOfFile, stylesDir).replace(/\\/g, '/');
      
      const scssContent = `// =============================================================================\n// ${baseName}.module.scss\n// =============================================================================\n\n@use "${relativePath}/variables" as v;\n@use "${relativePath}/mixins" as m;\n\n.wrapper {\n  /* Add your custom styles here */\n}\n`;
      fs.writeFileSync(scssPath, scssContent);
    }
    
    // Inject import statement if not exists
    let content = fs.readFileSync(filePath, 'utf8');
    const importStmt = `import styles from "./${baseName}.module.scss";`;
    if (!content.includes(importStmt)) {
      const lines = content.split('\n');
      let lastImportIdx = -1;
      let firstImportIdx = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIdx = i;
          if (firstImportIdx === -1) firstImportIdx = i;
        }
      }
      
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, importStmt);
      } else {
        if (lines[0] && lines[0].includes('use client')) {
           lines.splice(1, 0, '', importStmt);
        } else {
           lines.unshift(importStmt);
        }
      }
      console.log(`Updating ${filePath}`);
      fs.writeFileSync(filePath, lines.join('\n'));
    }
  }
});
