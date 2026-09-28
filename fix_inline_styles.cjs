const fs = require('fs');
const path = require('path');

const files = [
  'src/Composant/Admin/Dashboard/Dashboard.jsx',
  'src/Composant/Admin/Dashboard/StatCard.jsx',
  'src/Composant/Admin/Dashboard/RecentActivity.jsx',
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
  'src/Composant/Admin/Settings/AdminSettings.jsx'
];

const replacements = [
  { regex: /(?<!\/\/\s*)background:\s*"#fff(?:fff)?"/gi, replace: 'backgroundColor: "var(--ant-color-bg-container)"' },
  { regex: /(?<!\/\/\s*)backgroundColor:\s*"#fff(?:fff)?"/gi, replace: 'backgroundColor: "var(--ant-color-bg-container)"' },
  
  { regex: /(?<!\/\/\s*)background:\s*"#F8FAFC"/gi, replace: 'backgroundColor: "var(--ant-color-bg-layout)"' },
  { regex: /(?<!\/\/\s*)backgroundColor:\s*"#F8FAFC"/gi, replace: 'backgroundColor: "var(--ant-color-bg-layout)"' },
  
  { regex: /(?<!\/\/\s*)color:\s*"#0F172A"/gi, replace: 'color: "var(--ant-color-text)"' },
  { regex: /(?<!\/\/\s*)color:\s*"#1E293B"/gi, replace: 'color: "var(--ant-color-text)"' },
  
  { regex: /(?<!\/\/\s*)color:\s*"#475569"/gi, replace: 'color: "var(--ant-color-text-secondary)"' },
  { regex: /(?<!\/\/\s*)color:\s*"#64748[bB]"/gi, replace: 'color: "var(--ant-color-text-description)"' },
  { regex: /(?<!\/\/\s*)color:\s*"#94A3B8"/gi, replace: 'color: "var(--ant-color-text-description)"' },
  
  { regex: /(?<!\/\/\s*)border:\s*"1px solid #EEF2F7"/gi, replace: 'border: "1px solid var(--ant-color-border-secondary)"' },
  { regex: /(?<!\/\/\s*)border:\s*"1px solid #E2E8F0"/gi, replace: 'border: "1px solid var(--ant-color-border)"' },
  { regex: /(?<!\/\/\s*)borderBottom:\s*"1px solid #EEF2F7"/gi, replace: 'borderBottom: "1px solid var(--ant-color-border-secondary)"' },
  { regex: /(?<!\/\/\s*)borderTop:\s*"1px solid #EEF2F7"/gi, replace: 'borderTop: "1px solid var(--ant-color-border-secondary)"' },
  { regex: /(?<!\/\/\s*)borderColor:\s*"#EEF2F7"/gi, replace: 'borderColor: "var(--ant-color-border-secondary)"' },
  { regex: /(?<!\/\/\s*)borderColor:\s*"#E2E8F0"/gi, replace: 'borderColor: "var(--ant-color-border)"' },

  { regex: /(?<!\/\/\s*)background:\s*"#F1EEFC"/gi, replace: 'backgroundColor: "var(--ant-color-primary-bg)"' },
  { regex: /(?<!\/\/\s*)background:\s*"#FEF2F2"/gi, replace: 'backgroundColor: "var(--ant-color-error-bg)"' },
  { regex: /(?<!\/\/\s*)background:\s*"#F0FDF4"/gi, replace: 'backgroundColor: "var(--ant-color-success-bg)"' },
  { regex: /(?<!\/\/\s*)background:\s*"#FFFBEB"/gi, replace: 'backgroundColor: "var(--ant-color-warning-bg)"' },

  { regex: /(?<!\/\/\s*)color:\s*"#22c55e"/gi, replace: 'color: "var(--ant-color-success)"' },
  { regex: /(?<!\/\/\s*)color:\s*"#ef4444"/gi, replace: 'color: "var(--ant-color-error)"' },
  { regex: /(?<!\/\/\s*)color:\s*"#f59e0b"/gi, replace: 'color: "var(--ant-color-warning)"' },
  { regex: /(?<!\/\/\s*)color:\s*"#3b82f6"/gi, replace: 'color: "var(--ant-color-info)"' },
  
  { regex: /(?<!\/\/\s*)background:\s*"#023B6A"/gi, replace: 'backgroundColor: "var(--ant-color-primary)"' }
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
