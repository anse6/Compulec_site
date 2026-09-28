const fs = require('fs');
const path = require('path');

const files = [
  'src/Composant/Admin/Dashboard/Dashboard.jsx',
  'src/Composant/Admin/Projects/AdminProjects.jsx',
  'src/Composant/Admin/Projects/ProjectForm.jsx',
  'src/Composant/Admin/Projects/ProjectDetails.jsx',
  'src/Composant/Admin/Gallery/AdminGallery.jsx',
  'src/Composant/Admin/Gallery/AdminGalleryView.jsx',
  'src/Composant/Admin/Messages/AdminMessages.jsx',
  'src/Composant/Admin/Messages/AdminMessageDetails.jsx',
  'src/Composant/Admin/AIChat/AdminAIChat.jsx',
  'src/Composant/Admin/News/AdminNews.jsx',
  'src/Composant/Admin/News/NewsForm.jsx',
  'src/Composant/Admin/News/NewsDetails.jsx',
  'src/Composant/Admin/Users/AdminUsers.jsx',
  'src/Composant/Admin/Settings/AdminSettings.jsx',
  'src/Composant/Admin/PageHeader.jsx',
  'src/Composant/Admin/AdminLayout.jsx'
];

const replacements = [
  { regex: /(?<!dark:)bg-white/g, replace: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)text-slate-800/g, replace: 'text-slate-800 dark:text-slate-100' },
  { regex: /(?<!dark:)text-slate-900/g, replace: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)text-slate-700/g, replace: 'text-slate-700 dark:text-slate-200' },
  { regex: /(?<!dark:)text-slate-600/g, replace: 'text-slate-600 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-500/g, replace: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)text-gray-500/g, replace: 'text-gray-500 dark:text-slate-400' },
  { regex: /(?<!dark:)text-gray-600/g, replace: 'text-gray-600 dark:text-slate-300' },
  { regex: /(?<!dark:)text-gray-800/g, replace: 'text-gray-800 dark:text-slate-100' },
  { regex: /(?<!dark:)bg-slate-50(?!0)/g, replace: 'bg-slate-50 dark:bg-slate-800/50' },
  { regex: /(?<!dark:)bg-slate-100/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-gray-50(?!0)/g, replace: 'bg-gray-50 dark:bg-slate-800/50' },
  { regex: /(?<!dark:)bg-gray-100/g, replace: 'bg-gray-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)border-slate-200/g, replace: 'border-slate-200 dark:border-slate-700' },
  { regex: /(?<!dark:)border-slate-100/g, replace: 'border-slate-100 dark:border-slate-800' },
  { regex: /(?<!dark:)border-gray-200/g, replace: 'border-gray-200 dark:border-slate-700' },
  { regex: /(?<!dark:)divide-slate-200/g, replace: 'divide-slate-200 dark:divide-slate-700' },
  { regex: /(?<!dark:)hover:bg-slate-50(?!0)/g, replace: 'hover:bg-slate-50 dark:hover:bg-slate-800' },
  { regex: /(?<!dark:)hover:bg-gray-50(?!0)/g, replace: 'hover:bg-gray-50 dark:hover:bg-slate-800' },
];

files.forEach(f => {
  const p = path.join('/home/anse/Bureau/compulec/compulec_site/projet_compulec', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    let modified = false;
    replacements.forEach(r => {
      if (r.regex.test(content)) {
        content = content.replace(r.regex, r.replace);
        modified = true;
      }
    });
    if (modified) {
      fs.writeFileSync(p, content);
      console.log(`Updated ${f}`);
    }
  } else {
    console.log(`File not found: ${f}`);
  }
});
