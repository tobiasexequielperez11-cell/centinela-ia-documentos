const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('src/app/configuracion');
files.forEach(f => {
  if (f.replace(/\\/g, '/').endsWith('configuracion/page.tsx')) return;
  
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // fix border-slate-200 in the bg-white/10 case
  content = content.replace(/border-slate-200 bg-white\/10/g, 'border-white/10 bg-white/10');
  
  // Replace ALL <section to <MotionCard and </section> to </MotionCard>!
  if (content.includes('<section ')) {
    if (!content.includes('MotionCard')) {
      content = content.replace(/import { AppShell } from '([^']+)'/, "import { AppShell } from '$1';\nimport { MotionCard } from '@/components/ui/MotionCard';");
    }
    let index = 0;
    content = content.replace(/<section className=\"/g, () => '<MotionCard index={' + (index++) + '} className=\"');
    content = content.replace(/<\/section>/g, '</MotionCard>');
  }

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Animated ' + f);
  }
});
