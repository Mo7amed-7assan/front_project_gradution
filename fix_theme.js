const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const mappings = {
  // Backgrounds
  'bg-white': 'bg-[var(--bg-surface)]',
  'bg-slate-50': 'bg-[var(--bg-hover)]',
  'bg-slate-100': 'bg-[var(--bg-hover)]',
  'bg-slate-200': 'bg-[var(--bg-hover)]',
  'bg-slate-800': 'bg-[var(--bg-surface)]',
  'bg-slate-900': 'bg-[var(--bg-page)]',
  'bg-gray-50': 'bg-[var(--bg-hover)]',
  'bg-gray-100': 'bg-[var(--bg-hover)]',
  'bg-gray-800': 'bg-[var(--bg-surface)]',
  'bg-gray-900': 'bg-[var(--bg-page)]',

  // Texts
  'text-slate-900': 'text-[var(--text-primary)]',
  'text-slate-800': 'text-[var(--text-primary)]',
  'text-slate-700': 'text-[var(--text-primary)]',
  'text-slate-600': 'text-[var(--text-secondary)]',
  'text-slate-500': 'text-[var(--text-secondary)]',
  'text-slate-400': 'text-[var(--text-hint)]',
  'text-slate-300': 'text-[var(--text-hint)]',
  'text-gray-900': 'text-[var(--text-primary)]',
  'text-gray-800': 'text-[var(--text-primary)]',
  'text-gray-700': 'text-[var(--text-primary)]',
  'text-gray-600': 'text-[var(--text-secondary)]',
  'text-gray-500': 'text-[var(--text-secondary)]',
  
  // Borders
  'border-slate-100': 'border-[var(--border-color)]',
  'border-slate-200': 'border-[var(--border-color)]',
  'border-slate-300': 'border-[var(--border-color)]',
  'border-gray-100': 'border-[var(--border-color)]',
  'border-gray-200': 'border-[var(--border-color)]',
  
  // Specific dark: classes (removing them since we rely on CSS vars)
  'dark:bg-slate-900': '',
  'dark:bg-slate-800': '',
  'dark:text-white': '',
  'dark:text-slate-200': '',
  'dark:border-slate-700': '',
  'dark:border-slate-800': '',
};

const regexes = Object.keys(mappings).map(k => {
  return {
    regex: new RegExp('(?<=^|\\s|["\'`])' + k + '(?=\\s|["\'`]|$)', 'g'),
    replacement: mappings[k]
  };
});

let modifiedFiles = 0;

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace hardcoded Tailwind colors
    regexes.forEach(({regex, replacement}) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});
console.log('Total files modified:', modifiedFiles);
