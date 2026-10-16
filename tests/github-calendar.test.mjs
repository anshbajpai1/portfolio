import test from 'node:test';
import assert from 'node:assert/strict';
import { parseContributionDays } from '../shared/github-calendar.mjs';

test('sorts GitHub row-first cells and preserves counts separately from levels', () => {
  const html = [
    ['2026-10-04', 'sunday-1', 'No contributions', 0],
    ['2026-10-11', 'sunday-2', '12 contributions', 3],
    ['2026-10-05', 'monday-1', '1 contribution', 1],
    ['2026-10-12', 'monday-2', '1,234 contributions', 4],
  ].map(([date, id, text, level]) => `<td data-date="${date}" id="${id}" data-level="${level}"></td><tool-tip for="${id}">${text}</tool-tip>`).join('');
  const days = parseContributionDays(html);
  assert.deepEqual(days.map(day => day.date), ['2026-10-04', '2026-10-05', '2026-10-11', '2026-10-12']);
  assert.deepEqual(days.map(day => day.count), [0, 1, 12, 1234]);
  assert.deepEqual(days.map(day => day.level), [0, 1, 3, 4]);
});

test('missing count data fails instead of displaying false zeros', () => {
  assert.throws(() => parseContributionDays('<td data-date="2026-10-12" id="x" data-level="4"></td>'));
  assert.throws(() => parseContributionDays('<html>Temporarily unavailable</html>'));
});
