// Terima bentuk link YouTube apa pun yang biasa ditempel panitia
// (watch?v=, youtu.be/, /embed/, /shorts/, /live/) → ID 11 karakter.
// Balikin null kalau bukan link YouTube, biar UI bisa nampilin placeholder.
export function youtubeId(url) {
  if (typeof url !== "string") return null;
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})(?![\w-])/);
  return m ? m[1] : null;
}

export function youtubeEmbedUrl(url) {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
