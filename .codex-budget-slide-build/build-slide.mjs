import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from 'file:///C:/Users/asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const sourceImage = 'C:/Users/asus/AppData/Local/Temp/codex-clipboard-9e68e586-44f8-4fbd-a999-f0bb6c2b2e67.png';
const outputDir = 'C:/Users/asus/tracking-reporting-expert/.codex-budget-slide-build';
const presentation = Presentation.create({ slideSize: { width: 1100, height: 620 } });
const slide = presentation.slides.add();
const imageBytes = await fs.readFile(sourceImage);
slide.images.add({
  blob: imageBytes.buffer.slice(imageBytes.byteOffset, imageBytes.byteOffset + imageBytes.byteLength),
  contentType: 'image/png',
  alt: 'Business Case & Budget source slide',
  fit: 'cover',
  position: { left: 0, top: 0, width: 1100, height: 620 },
});

function cover(name, x, y, width, height, fill) {
  return slide.shapes.add({
    geometry: 'rect', name,
    position: { left: x, top: y, width, height }, fill,
    line: { style: 'solid', fill: 'none', width: 0 },
  });
}
function text(name, x, y, width, height, value, style = {}) {
  const shape = slide.shapes.add({
    geometry: 'textbox', name,
    position: { left: x, top: y, width, height }, fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    typeface: 'Tahoma', fontSize: '11pt', color: '#202020', alignment: 'center',
    ...style,
  };
  return shape;
}

// Refresh the estimate cells while retaining the supplied slide as the visual template.
cover('Production budget cell', 438, 188, 170, 93, '#F0F4FB');
text('Production development estimate', 442, 210, 162, 46, '1.50–3.25M บาท', { fontSize: '10pt', bold: true });
cover('Cloud budget cell', 438, 300, 170, 76, '#FFFFFF');
text('Cloud infrastructure estimate', 442, 315, 162, 46, '96K–480K บาท/ปี', { fontSize: '9pt', bold: true });
cover('Operations budget cell', 438, 389, 170, 103, '#F0F4FB');
text('Operations and maintenance estimate', 442, 410, 162, 60, '0.90–2.28M บาท/ปี', { fontSize: '9pt', bold: true });
cover('First year row label', 43, 502, 168, 47, '#2453A3');
text('First year scope label', 49, 507, 157, 38, 'งบปีแรกสำหรับ 1 Project', { fontSize: '9pt', bold: true, color: '#FFFFFF' });
cover('First year total cell', 438, 502, 170, 47, '#FFFFFF');
text('First year total estimate', 442, 507, 162, 38, '2.50–6.01M บาท', { fontSize: '9pt', bold: true });

// Monthly operating costs now show cloud, external support, and one project control center.
cover('Monthly operation details', 626, 358, 430, 85, '#FFDDCE');
text('Monthly operation estimate', 638, 364, 406, 30, 'THB 83K–230K / month', { fontSize: '16pt', color: '#333333' });
text('Monthly operation breakdown', 635, 397, 410, 40,
  'Cloud 8–40K + Support 45–135K\n+ Control Center 30–55K / project',
  { fontSize: '10pt', color: '#333333' });
cover('One time preparation estimate', 722, 183, 235, 36, '#FFF0F0');
text('One time preparation value', 727, 184, 225, 30, 'THB 1.50–3.25M', { fontSize: '15pt', color: '#333333' });
cover('First year total estimate', 735, 503, 225, 30, '#FFEDB0');
text('First year total value', 741, 503, 212, 28, 'THB 2.50–6.01M', { fontSize: '15pt', bold: true, color: '#111111' });

slide.speakerNotes.text = [
  'Updated planning estimate for one project. One-time preparation: THB 1.50–3.25M.',
  'Monthly operation: THB 83K–230K, including Cloud 8–40K, outsourced support 45–135K, and one project Control Center 30–55K.',
  'First-year total: THB 2.50–6.01M. Excludes VAT and varies with final scope and service usage.',
  'Reference: Thailand BOI, Cost of Doing Business 2026 (IT salary ranges); Vercel pricing; AWS RDS and S3 pricing; THNIC domain registration rates. Accessed November 2026.',
  'https://www.boi.go.th/upload/content/Cost_of_Doing_Business_2026.pdf',
  'https://vercel.com/pricing',
  'https://aws.amazon.com/rds/postgresql/pricing/',
  'https://aws.amazon.com/s3/pricing/',
  'https://thdomain.thnic.co.th/register',
].join('\n');

const preview = await presentation.export({ slide, format: 'png', scale: 1 });
await fs.writeFile(`${outputDir}/slide-preview.png`, new Uint8Array(await preview.arrayBuffer()));
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(`${outputDir}/candidate.pptx`);
console.log(`Rendered and exported ${presentation.slides.items.length} slide(s).`);
