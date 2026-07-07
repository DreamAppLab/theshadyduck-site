import fs from 'fs';

const file = process.argv[2];
const mode = process.argv[3] || 'body';
const html = fs.readFileSync(file, 'utf8');

if (mode === 'style') {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  console.log(m ? m[1] : '');
} else if (mode === 'body') {
  const m = html.match(/<body>([\s\S]*?)<\/body>/);
  const body = m ? m[1] : '';
  console.log(body.replace(/data:image[^"']+/g, '[BASE64]'));
} else if (mode === 'title') {
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  console.log(m ? m[1] : '');
}
