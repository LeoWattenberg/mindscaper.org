#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMIT_GRAPH_REPO, parseCommitSnapshot } from '../src/lib/commit-graph.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = 'public/data/soundscaper-commits.json';
const output = path.join(root, snapshotPath);
const seedPath = path.join(root, 'scripts/soundscaper-commits-seed.json');
const branch = process.env.GENERATED_BRANCH || 'generated';
const remote = process.env.GENERATED_REMOTE || 'origin';

function git(args, { env, allowFailure = false } = {}) {
	const result = spawnSync('git', args, {
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 16 * 1024 * 1024,
		env: { ...process.env, ...env },
	});
	if (result.error) throw result.error;
	if (result.status !== 0 && !allowFailure) {
		throw new Error(`git ${args.join(' ')} failed: ${(result.stderr || result.stdout).trim()}`);
	}
	return result;
}

function validate(contents) {
	const snapshot = parseCommitSnapshot(JSON.parse(contents));
	if (!snapshot || snapshot.repo !== COMMIT_GRAPH_REPO) {
		throw new Error(`Invalid Soundscaper commit snapshot in ${snapshotPath}`);
	}
}

function seed() {
	if (existsSync(output)) {
		validate(readFileSync(output, 'utf8'));
		return;
	}
	const contents = readFileSync(seedPath, 'utf8');
	validate(contents);
	mkdirSync(path.dirname(output), { recursive: true });
	copyFileSync(seedPath, output);
	console.log('Copied the initial Soundscaper commit snapshot.');
}

function restore() {
	const found = git(['ls-remote', '--exit-code', '--heads', remote, branch], { allowFailure: true });
	if (found.status === 2) {
		seed();
		console.log(`No ${remote}/${branch} branch yet; using the initial snapshot.`);
		return;
	}
	if (found.status !== 0) {
		throw new Error(`Could not check ${remote}/${branch}: ${(found.stderr || found.stdout).trim()}`);
	}
	git(['fetch', '--no-tags', remote, branch]);
	const contents = git(['show', `FETCH_HEAD:${snapshotPath}`]).stdout;
	validate(contents);
	mkdirSync(path.dirname(output), { recursive: true });
	writeFileSync(output, contents);
	console.log(`Restored ${snapshotPath} from ${remote}/${branch}.`);
}

function publish() {
	if (!existsSync(output)) throw new Error(`Missing ${snapshotPath}`);
	validate(readFileSync(output, 'utf8'));
	const indexFile = path.join(os.tmpdir(), `mindscaper-commit-graph-${process.pid}.index`);
	rmSync(indexFile, { force: true });
	try {
		const env = { GIT_INDEX_FILE: indexFile };
		git(['add', '--force', '--', snapshotPath], { env });
		const tree = git(['write-tree'], { env }).stdout.trim();
		const commit = git(['commit-tree', tree, '-m', 'Update Soundscaper commit graph']).stdout.trim();
		git(['push', '--force', remote, `${commit}:refs/heads/${branch}`]);
		console.log(`Published ${snapshotPath} to ${remote}/${branch} as ${commit.slice(0, 7)}.`);
	} finally {
		rmSync(indexFile, { force: true });
	}
}

switch (process.argv[2]) {
	case 'seed': seed(); break;
	case 'restore': restore(); break;
	case 'publish': publish(); break;
	default:
		console.error('Usage: node scripts/generated-snapshot.mjs <seed|restore|publish>');
		process.exitCode = 1;
}
