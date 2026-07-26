// Hasil finalis cuma kebuka kalau panitia udah publish DAN tanggal pengumuman
// udah lewat. Tanpa announceAt, publish gak pernah kebuka ke publik.
export function isAnnounced(publishState) {
  if (!publishState?.published || !publishState.announceAt) return false;
  return new Date() >= new Date(publishState.announceAt);
}

// "21 September 2026" — dipakai di landing & halaman peserta.
export function formatTanggalPengumuman(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

// Ranks submissions by the SUM of every judge's weighted total — 3 judges per
// kategori, each contributing 0-100, so the final score tops out at 300.
// Submissions with no scores yet sort last.
export function rankSubmissions(submissions, criteriaList) {
  return submissions
    .map((s) => {
      const judgeTotals = s.scores.map((score) =>
        computeWeightedTotal(score.items, criteriaList),
      );
      const totalScore = judgeTotals.length
        ? judgeTotals.reduce((a, b) => a + b, 0)
        : null;
      return { ...s, judgeTotals, totalScore, juriCount: judgeTotals.length };
    })
    .sort((a, b) => (b.totalScore ?? -1) - (a.totalScore ?? -1));
}
