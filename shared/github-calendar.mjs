// GitHub emits cells row-first: all Sundays, then Mondays, etc.
export function parseContributionDays(markup) {
  const counts = new Map();
  for (const match of markup.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
    const text = match[2].replace(/<[^>]+>/g, ' ').trim();
    const count = /(\d[\d,]*)\s+contributions?\b/i.exec(text)?.[1];
    if (count) counts.set(match[1], Number(count.replace(/,/g, '')));
    else if (/no contributions/i.test(text)) counts.set(match[1], 0);
  }
  const days = [];
  for (const tag of markup.match(/<td\b[^>]*>/g) || []) {
    const date = /data-date="([^"]+)"/.exec(tag)?.[1];
    if (!date) continue;
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    const level = Number(/data-level="([0-4])"/.exec(tag)?.[1]);
    if (!id || !counts.has(id) || !Number.isInteger(level)) throw new Error('Incomplete GitHub calendar');
    days.push({ date, count: counts.get(id), level });
  }
  if (!days.length) throw new Error('Empty GitHub calendar');
  return days.sort((a, b) => a.date.localeCompare(b.date));
}
