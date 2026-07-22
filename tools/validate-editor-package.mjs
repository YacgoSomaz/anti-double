import { readFile } from 'node:fs/promises';
import { parseEditorDraft, validateEditorDraft } from '../public/editor-draft.js';
import { parseTestPackage } from '../public/editor-replay.js';
import { validateDraftDiff } from '../public/editor-package.js';

const filename = process.argv[2];
if (!filename) {
  console.error('用法：node tools/validate-editor-package.mjs <gswitch-test-package.json>');
  process.exitCode = 2;
} else {
  try {
    const packageValue = parseTestPackage(await readFile(filename, 'utf8'));
    const draft = parseEditorDraft(JSON.stringify(packageValue.draft));
    const draftValidation = validateEditorDraft(draft);
    const diffValidation = validateDraftDiff(packageValue.diff ?? { version: 1, addedColliders: [], removedColliders: [] });
    if (!draftValidation.valid || !diffValidation.valid) throw new Error([...draftValidation.errors, ...diffValidation.errors].join('；'));
    console.log(JSON.stringify({ valid: true, colliders: draft.colliders.length, replayEvents: packageValue.replay.events.length, diff: packageValue.diff ?? null }, null, 2));
  } catch (error) {
    console.error(`测试包校验失败：${error.message}`);
    process.exitCode = 1;
  }
}
