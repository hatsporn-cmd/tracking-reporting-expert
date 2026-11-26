import path from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceDir = 'C:/Users/asus/tracking-reporting-expert';
const skillDir = 'C:/Users/asus/.codex/plugins/cache/openai-primary-runtime/presentations/26.1123.11515/skills/presentations';
const stagingDir = `${workspaceDir}/.codex-budget-slide-build`;
const finalPath = `${workspaceDir}/deliverables/TREX_Business_Case_Budget_Updated_2026-11.pptx`;
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);
const result = await finalizePresentation({
  explicitTotalSlideCount: 1,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath: `${stagingDir}/candidate.pptx`,
  finalPath,
  pythonExecutable: 'C:/Users/asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath: `${skillDir}/container_tools/inspect_presentation_package_integrity.py`,
  layoutValidatorPath: `${skillDir}/container_tools/inspect_presentation_layout_geometry.py`,
  layoutArgs: ['--expected-slide-size-emu', '10477500,5905500', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: { basis: 'design', families: ['Tahoma'], scriptFonts: { cs: 'Tahoma' } },
  verifyArtifactToolImport: true,
  receiptPath: `${stagingDir}/validation.json`,
});
console.log(JSON.stringify(result, null, 2));
