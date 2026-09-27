import test from 'node:test';
import assert from 'node:assert/strict';

import {
	buildCommitGrid,
	buildCommitSnapshot,
	buildHeatScale,
	clipScale,
	commitCell,
	commitStatsBySha,
	commitStatsUrl,
	commitsApiUrl,
	dayKey,
	dayKeysEndingAt,
	fetchCommitStats,
	fetchCommitWindow,
	filterCommits,
	formatAge,
	formatDayLabel,
	formatHourRange,
	formatLineCount,
	formatSignedLines,
	heatLevel,
	isWeekend,
	mergeCommitStats,
	normalizeCommitStats,
	normalizeCommits,
	parseCommitSnapshot,
	parseIsoParts,
	parseLastPage,
	roundUpToTick,
	snapshotIsEquivalent,
	summarizeGrid,
	windowStartIso,
} from '../src/lib/commit-graph.js';

test('commit graph reads GitHub timestamps in commit and viewer time zones', () => {
	assert.deepEqual(parseIsoParts('2026-08-13T21:27:05Z'), { year: 2026, month: 8, day: 13, hour: 21, minute: 27, second: 5, offsetMinutes: 0 });
	assert.equal(parseIsoParts('2026-08-13T21:27:05+02:00').offsetMinutes, 120);
	assert.equal(parseIsoParts('2026-08-13T21:27:05-0530').offsetMinutes, -330);
	assert.equal(parseIsoParts('not a date'), null);
	assert.deepEqual(commitCell('2026-08-13T21:27:05+02:00'), { dayKey: '2026-08-13', hour: 21 });
	assert.equal(commitCell('nope', 'commit'), null);
	assert.equal(commitCell('nope', 'viewer'), null);

	const viewerReference = new Date('2026-08-13T21:27:05+02:00');
	assert.deepEqual(commitCell('2026-08-13T21:27:05+02:00', 'viewer'), {
		dayKey: dayKey(viewerReference.getFullYear(), viewerReference.getMonth() + 1, viewerReference.getDate()),
		hour: viewerReference.getHours(),
	});
});

test('commit graph normalizes API payloads and skips merge commits on request', () => {
	const payload = [
		{ sha: 'abcdef1234567', commit: { author: { date: '2026-08-13T10:00:00Z' } }, parents: [{}] },
		{ sha: 'fedcba7654321', commit: { committer: { date: '2026-08-13T11:00:00Z' } }, parents: [{}, {}] },
		{ sha: 'nodatehere000', commit: {}, parents: [] },
	];
	const commits = normalizeCommits(payload);

	assert.deepEqual(commits, [
		{ sha: 'abcdef1', iso: '2026-08-13T10:00:00Z', isMerge: false },
		{ sha: 'fedcba7', iso: '2026-08-13T11:00:00Z', isMerge: true },
	]);
	assert.deepEqual(normalizeCommits(null), []);
	assert.equal(filterCommits(commits, { includeMerges: false }).length, 1);
	assert.equal(filterCommits(commits).length, 2);
});

test('commit graph builds a day-by-hour grid limited to the tracked window', () => {
	const commits = [
		{ iso: '2026-08-13T10:15:00Z' },
		{ iso: '2026-08-13T10:45:00Z' },
		{ iso: '2026-08-13T23:00:00Z' },
		{ iso: '2026-08-12T10:05:00Z' },
		{ iso: '2026-08-01T10:05:00Z' },
		{ iso: 'broken' },
	];
	const grid = buildCommitGrid(commits, { days: 3, endDayKey: '2026-08-13' });

	assert.deepEqual(grid.days.map((day) => day.dayKey), ['2026-08-11', '2026-08-12', '2026-08-13']);
	assert.deepEqual(grid.days.map((day) => day.total), [0, 1, 3]);
	assert.equal(grid.days[2].hours[10], 2);
	assert.equal(grid.days[2].hours[23], 1);
	assert.equal(grid.hours[10], 3);
	assert.equal(grid.total, 4);
	assert.equal(grid.skipped, 2);
	assert.equal(grid.maxHour, 3);
	assert.equal(grid.maxCell, 2);
	assert.deepEqual(dayKeysEndingAt('2026-03-01', 3), ['2026-02-27', '2026-02-28', '2026-03-01']);
	assert.deepEqual(dayKeysEndingAt('nope', 3), []);

	assert.deepEqual(summarizeGrid(grid), {
		total: 4,
		activeDays: 2,
		trackedDays: 3,
		busiestHour: 10,
		busiestHourTotal: 3,
		busiestDayKey: '2026-08-13',
		busiestDayTotal: 3,
		dailyAverage: 4 / 3,
		added: 0,
		removed: 0,
		net: 0,
		statCommits: 0,
		statMissing: 4,
		dailyAddedAverage: 0,
		dailyRemovedAverage: 0,
		peakDayKey: '2026-08-13',
		peakHour: 10,
		peakTotal: 2,
		peakLinesDayKey: '',
		peakLinesHour: 0,
		peakLinesTotal: 0,
	});
});

test('commit graph buckets added and removed lines per hour and reports partial coverage', () => {
	const commits = [
		{ sha: 'aaa', iso: '2026-08-13T10:15:00Z', additions: 40, deletions: 5 },
		{ sha: 'bbb', iso: '2026-08-13T10:45:00Z', additions: 2, deletions: 60 },
		{ sha: 'ccc', iso: '2026-08-13T23:00:00Z', additions: 7, deletions: 1 },
		{ sha: 'ddd', iso: '2026-08-12T10:05:00Z' },
	];
	const grid = buildCommitGrid(commits, { days: 2, endDayKey: '2026-08-13' });
	const [older, newest] = grid.days;

	assert.equal(newest.additions[10], 42);
	assert.equal(newest.deletions[10], 65);
	assert.equal(newest.additions[23], 7);
	assert.equal(grid.added, 49);
	assert.equal(grid.removed, 66);
	assert.deepEqual(grid.lineScale, { ceiling: 65, max: 65, clipped: 0, cells: 4 });
	assert.equal(grid.statCommits, 3);
	assert.deepEqual([older.added, older.removed], [0, 0]);
	assert.deepEqual([newest.added, newest.removed], [49, 66]);

	const summary = summarizeGrid(grid);
	assert.equal(summary.added, 49);
	assert.equal(summary.removed, 66);
	assert.equal(summary.net, -17);
	assert.equal(summary.statCommits, 3);
	assert.equal(summary.statMissing, 1);
	assert.equal(summary.dailyAddedAverage, 24.5);
	assert.equal(summary.dailyRemovedAverage, 33);
	assert.deepEqual([summary.peakLinesDayKey, summary.peakLinesHour, summary.peakLinesTotal], ['2026-08-13', 10, 107]);
	assert.deepEqual([summary.peakDayKey, summary.peakHour, summary.peakTotal], ['2026-08-13', 10, 2]);
});

test('commit graph clips the line axis only when one hour dwarfs the rest', () => {
	const ordinary = Array.from({ length: 100 }, (_, index) => index + 1);
	assert.deepEqual(clipScale(ordinary), { ceiling: 100, max: 100, clipped: 0, cells: 100 });

	/* p95 of 1…100 is 96, and the 40,000 outlier is far past three times that, so the axis cuts. */
	const spiked = clipScale([...ordinary, 40_000]);
	assert.equal(spiked.ceiling, 100);
	assert.equal(spiked.max, 40_000);
	assert.equal(spiked.clipped, 1);

	assert.deepEqual(clipScale([]), { ceiling: 0, max: 0, clipped: 0, cells: 0 });
	assert.deepEqual(clipScale(null), { ceiling: 0, max: 0, clipped: 0, cells: 0 });
	assert.deepEqual(clipScale([0, 0]), { ceiling: 0, max: 0, clipped: 0, cells: 0 });
	assert.equal(clipScale([5, 5, 5, 900]).clipped, 1);

	assert.equal(roundUpToTick(5881), 6000);
	assert.equal(roundUpToTick(17150), 20000);
	assert.equal(roundUpToTick(45), 45);
	assert.equal(roundUpToTick(41), 45);
	assert.equal(roundUpToTick(0), 0);
	assert.equal(roundUpToTick(-3), 0);
});

test('commit graph reads line counts from single-commit payloads and grafts them on by sha', () => {
	assert.deepEqual(normalizeCommitStats({ stats: { additions: 12, deletions: 3 } }), { additions: 12, deletions: 3 });
	assert.deepEqual(normalizeCommitStats({ stats: { additions: -4, deletions: 2 } }), { additions: 0, deletions: 2 });
	assert.equal(normalizeCommitStats({ stats: { additions: 12 } }), null);
	assert.equal(normalizeCommitStats(null), null);

	const known = commitStatsBySha([
		{ sha: 'aaa', iso: '2026-08-13T10:00:00Z', additions: 12, deletions: 3 },
		{ sha: 'bbb', iso: '2026-08-13T11:00:00Z' },
	]);
	assert.deepEqual([...known.keys()], ['aaa']);

	const merged = mergeCommitStats([
		{ sha: 'aaa', iso: '2026-08-13T10:00:00Z', isMerge: false },
		{ sha: 'bbb', iso: '2026-08-13T11:00:00Z', isMerge: false },
		{ sha: 'ccc', iso: '2026-08-13T12:00:00Z', isMerge: false, additions: 1, deletions: 1 },
	], known);
	assert.deepEqual(merged, [
		{ sha: 'aaa', iso: '2026-08-13T10:00:00Z', isMerge: false, additions: 12, deletions: 3 },
		{ sha: 'bbb', iso: '2026-08-13T11:00:00Z', isMerge: false },
		{ sha: 'ccc', iso: '2026-08-13T12:00:00Z', isMerge: false, additions: 1, deletions: 1 },
	]);
	assert.deepEqual(mergeCommitStats(null, known), []);
});

test('commit graph formats axis labels, heat levels, and weekends', () => {
	assert.equal(formatHourRange(23), '23:00–00:00');
	assert.equal(formatHourRange('bad'), '00:00–01:00');
	assert.equal(formatDayLabel('2026-08-13', 'en'), 'Thu 13 Aug');
	assert.equal(formatDayLabel('2026-08-13', 'de'), 'Do 13. Aug');
	assert.equal(formatDayLabel('nope', 'en'), '');
	assert.equal(formatLineCount(12345, 'en'), '12,345');
	assert.equal(formatLineCount(12345, 'de'), '12.345');
	assert.equal(formatLineCount('nope', 'en'), '0');
	assert.equal(formatSignedLines(1200, 'en'), '+1,200');
	assert.equal(formatSignedLines(-1200, 'de'), '−1.200');
	assert.equal(formatSignedLines(0, 'en'), '±0');
	assert.equal(isWeekend('2026-08-15'), true);
	assert.equal(isWeekend('2026-08-13'), false);
});

test('commit graph heat levels follow quantiles so one busy day cannot flatten the ramp', () => {
	const evenValues = Array.from({ length: 100 }, (_, index) => index + 1);
	const evenScale = buildHeatScale(evenValues);

	assert.deepEqual(evenScale, [21, 41, 61, 81]);
	assert.equal(heatLevel(0, evenScale), 0);
	assert.equal(heatLevel(1, evenScale), 1);
	assert.equal(heatLevel(21, evenScale), 1);
	assert.equal(heatLevel(22, evenScale), 2);
	assert.equal(heatLevel(81, evenScale), 4);
	assert.equal(heatLevel(100, evenScale), 5);

	// A single 300-commit day used to push every ordinary hour into the palest step.
	const skewedScale = buildHeatScale([...Array.from({ length: 40 }, () => 1), ...Array.from({ length: 10 }, () => 4), 300, 0, 0]);
	assert.deepEqual(skewedScale, [1, 1, 1, 4]);
	assert.equal(heatLevel(1, skewedScale), 1);
	assert.equal(heatLevel(4, skewedScale), 4);
	assert.equal(heatLevel(300, skewedScale), 5);

	assert.deepEqual(buildHeatScale([]), []);
	assert.deepEqual(buildHeatScale([0, 0]), []);
	assert.equal(heatLevel(3, []), 1);
	assert.equal(heatLevel(3, null), 1);
});

test('commit graph pages through the GitHub API and caps the request count', async () => {
	const requested = [];
	const page = (start) => Array.from({ length: 2 }, (_, index) => ({
		sha: `${start}${index}`.padEnd(7, '0'),
		commit: { author: { date: `2026-08-1${start}T0${index}:00:00Z` } },
		parents: [{}],
	}));
	const fetchImpl = async (url, options) => {
		requested.push({ url, headers: options.headers });
		const requestedPage = Number(new URL(url).searchParams.get('page'));
		return {
			ok: true,
			status: 200,
			headers: new Headers(requestedPage === 1
				? { link: '<https://api.github.com/repositories/1/commits?page=2>; rel="next", <https://api.github.com/repositories/1/commits?page=4>; rel="last"', 'x-ratelimit-remaining': '57', 'x-ratelimit-limit': '60' }
				: {}),
			json: async () => page(requestedPage),
		};
	};

	const progress = [];
	const result = await fetchCommitWindow({ sinceIso: '2026-07-14T00:00:00.000Z', fetchImpl, token: 'secret', maxPages: 3, onProgress: (entry) => progress.push(entry.loaded) });

	assert.equal(result.commits.length, 6);
	assert.equal(result.pages, 3);
	assert.equal(result.truncated, true);
	assert.deepEqual(result.rateLimit, { limit: 60, remaining: 57, resetMs: null });
	assert.deepEqual(requested.map(({ url }) => Number(new URL(url).searchParams.get('page'))).sort(), [1, 2, 3]);
	assert.equal(requested[0].headers.authorization, 'Bearer secret');
	assert.equal(new URL(requested[0].url).searchParams.get('since'), '2026-07-14T00:00:00.000Z');
	assert.deepEqual(progress.sort(), [1, 2, 3]);
	assert.equal(commitsApiUrl('owner/repo', { sinceIso: '2026-07-14T00:00:00.000Z', page: 2 }), 'https://api.github.com/repos/owner/repo/commits?since=2026-07-14T00%3A00%3A00.000Z&per_page=100&page=2');
	assert.equal(parseLastPage('<https://api.github.com/x?page=9>; rel="last"'), 9);
	assert.equal(parseLastPage(undefined), 1);
	assert.equal(windowStartIso(Date.UTC(2026, 7, 13), 30), '2026-07-13T00:00:00.000Z');
});

test('commit graph reports GitHub rate limiting as a recoverable error', async () => {
	const resetSeconds = Math.floor(Date.now() / 1000) + 600;
	const fetchImpl = async () => ({
		ok: false,
		status: 403,
		headers: new Headers({ 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(resetSeconds) }),
		json: async () => ({}),
	});

	await assert.rejects(fetchCommitWindow({ fetchImpl }), (error) => {
		assert.equal(error.rateLimited, true);
		assert.equal(error.status, 403);
		assert.equal(error.rateLimit.resetMs, resetSeconds * 1000);
		return true;
	});

	await assert.rejects(
		fetchCommitWindow({ fetchImpl: async () => ({ ok: false, status: 404, headers: new Headers(), json: async () => ({}) }) }),
		(error) => error.rateLimited === false && /status 404/.test(error.message),
	);
	const originalFetch = globalThis.fetch;
	try {
		delete globalThis.fetch;
		await assert.rejects(fetchCommitWindow({}), /Fetch is not available/);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('commit graph snapshots round-trip newest-first with merge indexes', () => {
	const commits = [
		{ sha: 'aaa', iso: '2026-08-11T08:00:00Z', isMerge: false },
		{ sha: 'bbb', iso: '2026-08-13T10:00:00Z', isMerge: true },
		{ sha: 'ccc', iso: '2026-08-12T09:00:00Z', isMerge: false },
	];
	const snapshot = buildCommitSnapshot(commits, { repo: 'owner/repo', days: 30, truncated: false, generatedAt: '2026-08-13T12:00:00Z' });

	assert.deepEqual(snapshot, {
		repo: 'owner/repo',
		windowDays: 30,
		truncated: false,
		generatedAt: '2026-08-13T12:00:00Z',
		timestamps: ['2026-08-13T10:00:00Z', '2026-08-12T09:00:00Z', '2026-08-11T08:00:00Z'],
		shas: ['bbb', 'ccc', 'aaa'],
		merges: [0],
	});

	const parsed = parseCommitSnapshot(snapshot);
	assert.equal(parsed.repo, 'owner/repo');
	assert.equal(parsed.windowDays, 30);
	assert.equal(parsed.generatedAt, '2026-08-13T12:00:00Z');
	assert.deepEqual(parsed.commits, [
		{ sha: 'bbb', iso: '2026-08-13T10:00:00Z', isMerge: true },
		{ sha: 'ccc', iso: '2026-08-12T09:00:00Z', isMerge: false },
		{ sha: 'aaa', iso: '2026-08-11T08:00:00Z', isMerge: false },
	]);
	assert.equal(parseCommitSnapshot(null), null);
	assert.equal(parseCommitSnapshot({ timestamps: 'nope' }), null);
	assert.deepEqual(buildCommitSnapshot(null).timestamps, []);
});

test('commit graph snapshots carry line counts once any commit has them', () => {
	const commits = [
		{ sha: 'aaa', iso: '2026-08-11T08:00:00Z', isMerge: false, additions: 10, deletions: 4 },
		{ sha: 'bbb', iso: '2026-08-13T10:00:00Z', isMerge: false },
	];
	const snapshot = buildCommitSnapshot(commits, { repo: 'owner/repo', generatedAt: '2026-08-13T12:00:00Z' });

	assert.deepEqual(snapshot.additions, [null, 10]);
	assert.deepEqual(snapshot.deletions, [null, 4]);
	assert.deepEqual(parseCommitSnapshot(snapshot).commits, [
		{ sha: 'bbb', iso: '2026-08-13T10:00:00Z', isMerge: false },
		{ sha: 'aaa', iso: '2026-08-11T08:00:00Z', isMerge: false, additions: 10, deletions: 4 },
	]);

	const pending = buildCommitSnapshot([{ sha: 'bbb', iso: '2026-08-13T10:00:00Z', isMerge: false }], { generatedAt: '2026-08-13T12:00:00Z' });
	assert.equal('additions' in pending, false);
	assert.equal(snapshotIsEquivalent(snapshot, pending), false);
});

test('commit graph reads commit line counts one request at a time and survives a rate limit', async () => {
	const seen = [];
	const fetchImpl = async (url) => {
		seen.push(url);
		const sha = url.split('/').pop();
		if (sha === 'ccc') return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) };
		return { ok: true, status: 200, headers: new Headers(), json: async () => ({ stats: { additions: sha.length, deletions: 1 } }) };
	};

	assert.equal(commitStatsUrl('owner/repo', 'aaa'), 'https://api.github.com/repos/owner/repo/commits/aaa');
	const result = await fetchCommitStats({ repo: 'owner/repo', shas: ['aaa', 'bbbb', 'ccc'], token: 'secret', concurrency: 1, fetchImpl });
	assert.deepEqual(result.stats, { aaa: { additions: 3, deletions: 1 }, bbbb: { additions: 4, deletions: 1 } });
	assert.equal(result.requests, 3);
	assert.equal(result.rateLimited, false);
	assert.equal(seen.length, 3);

	const limited = await fetchCommitStats({
		shas: ['aaa', 'bbb'],
		concurrency: 1,
		fetchImpl: async () => ({ ok: false, status: 403, headers: new Headers({ 'x-ratelimit-remaining': '0' }), json: async () => ({}) }),
	});
	assert.equal(limited.rateLimited, true);
	assert.equal(limited.requests, 1);
	assert.deepEqual(limited.stats, {});
	assert.deepEqual(await fetchCommitStats({ shas: [], fetchImpl }), { stats: {}, requests: 0, rateLimited: false, rateLimit: null });
});

test('commit graph snapshot comparison ignores the generation timestamp', () => {
	const first = buildCommitSnapshot([{ iso: '2026-08-13T10:00:00Z', isMerge: false }], { generatedAt: '2026-08-13T12:00:00Z' });
	const second = buildCommitSnapshot([{ iso: '2026-08-13T10:00:00Z', isMerge: false }], { generatedAt: '2026-08-13T18:00:00Z' });
	const third = buildCommitSnapshot([{ iso: '2026-08-13T11:00:00Z', isMerge: false }], { generatedAt: '2026-08-13T18:00:00Z' });

	assert.equal(snapshotIsEquivalent(first, second), true);
	assert.equal(snapshotIsEquivalent(first, third), false);
	assert.equal(snapshotIsEquivalent(null, second), false);
});

test('commit graph describes snapshot age in both locales', () => {
	assert.equal(formatAge(30 * 1000, 'en'), 'under 1 minute');
	assert.equal(formatAge(30 * 1000, 'de'), 'unter 1 Minute');
	assert.equal(formatAge(60 * 1000, 'en'), '1 minute');
	assert.equal(formatAge(45 * 60 * 1000, 'de'), '45 Minuten');
	assert.equal(formatAge(60 * 60 * 1000, 'en'), '1 hour');
	assert.equal(formatAge(5 * 60 * 60 * 1000, 'de'), '5 Stunden');
	assert.equal(formatAge(26 * 60 * 60 * 1000, 'en'), '1 day');
	assert.equal(formatAge(72 * 60 * 60 * 1000, 'de'), '3 Tage');
	assert.equal(formatAge(Number.NaN, 'en'), 'under 1 minute');
});
