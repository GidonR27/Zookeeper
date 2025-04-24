// Script to log directory structure after build
const fs = require('fs');
const path = require('path');

function listDirectoryContents(dir, level = 0) {
  const indent = '  '.repeat(level);
  console.log(`${indent}Directory: ${dir}`);
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        listDirectoryContents(itemPath, level + 1);
      } else {
        console.log(`${indent}  File: ${item} (${stats.size} bytes)`);
      }
    });
  } catch (err) {
    console.error(`${indent}Error reading directory: ${err.message}`);
  }
}

// Log the structure of the dist directory
console.log('==== Build Output Directory Structure ====');
listDirectoryContents('./dist');
console.log('========================================='); 