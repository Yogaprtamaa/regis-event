// Weighted total for one judge's scoring of one submission.
// Normalizes by the sum of bobot actually present, so it stays 0-100 even if
// an admin's criteria weights for a kategori don't add up to exactly 100.
export function computeWeightedTotal(items, criteriaList) {
  const criteriaById = Object.fromEntries(criteriaList.map((c) => [c.id, c]));
  let sumWeighted = 0;
  let sumBobot = 0;
  for (const item of items) {
    const c = criteriaById[item.criteriaId];
    if (!c) continue;
    sumWeighted += item.nilai * c.bobot;
    sumBobot += c.bobot;
  }
  return sumBobot === 0 ? 0 : sumWeighted / sumBobot;
}

// Ranks submissions by the average of all judges' weighted totals.
// Submissions with no scores yet sort last.
export function rankSubmissions(submissions, criteriaList) {
  return submissions
    .map((s) => {
      const judgeTotals = s.scores.map((score) =>
        computeWeightedTotal(score.items, criteriaList),
      );
      const avgScore = judgeTotals.length
        ? judgeTotals.reduce((a, b) => a + b, 0) / judgeTotals.length
        : null;
      return { ...s, judgeTotals, avgScore, juriCount: judgeTotals.length };
    })
    .sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1));
}
