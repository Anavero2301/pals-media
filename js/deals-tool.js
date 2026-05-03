(function () {
  const resultsBody = document.getElementById('resultsBody');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let latestRows = [];

  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

  function scoreDeal(row, cfg) {
    let score = 0;
    const price = toNum(row.price);
    const m2 = toNum(row.m2);
    const year = toNum(row.year);
    const sea = toNum(row.distanceToSeaKm);
    const ppmsq = price && m2 ? price / m2 : null;

    if (price >= cfg.minPrice && price <= cfg.maxPrice) score += 30;
    else return { valid: false, score: 0, ppmsq };

    if (['newly built', 'new build', 'recent', 'in development', 'off-plan'].includes(String(row.buildStatus || '').toLowerCase())) score += 20;

    if (year && year >= cfg.minYear) score += 15;
    if (year && year <= cfg.targetYear + 1) score += 10;

    if (ppmsq) {
      if (ppmsq < 3000) score += 20;
      else if (ppmsq < 3800) score += 12;
      else score += 5;
    }

    if (sea !== null) {
      if (sea <= 2) score += 10;
      else if (sea <= 5) score += 5;
    }

    if (['valencia', 'alicante', 'almería', 'almeria'].includes(String(row.region || '').toLowerCase())) score += 15;

    return { valid: true, score, ppmsq };
  }

  function render(rows) {
    resultsBody.innerHTML = '';
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="score">${r.score}</td>
        <td>${r.title || ''}</td>
        <td>${r.region || ''}</td>
        <td>€${Number(r.price || 0).toLocaleString()}</td>
        <td>${r.ppmsq ? '€' + Math.round(r.ppmsq).toLocaleString() : '-'}</td>
        <td>${r.buildStatus || ''}</td>
        <td>${r.year || ''}</td>
        <td>${r.distanceToSeaKm ?? ''}</td>
        <td><a href="${r.link || '#'}" target="_blank" rel="noopener">view</a></td>
      `;
      resultsBody.appendChild(tr);
    });
  }

  function toCsv(rows) {
    const header = ['score', 'title', 'region', 'price', 'eur_per_m2', 'buildStatus', 'year', 'distanceToSeaKm', 'link'];
    const lines = [header.join(',')];
    rows.forEach((r) => {
      const vals = [r.score, r.title, r.region, r.price, r.ppmsq ? Math.round(r.ppmsq) : '', r.buildStatus, r.year, r.distanceToSeaKm, r.link]
        .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`);
      lines.push(vals.join(','));
    });
    return lines.join('\n');
  }

  analyzeBtn.addEventListener('click', () => {
    try {
      const cfg = {
        minPrice: Number(document.getElementById('minPrice').value),
        maxPrice: Number(document.getElementById('maxPrice').value),
        minYear: Number(document.getElementById('minYear').value),
        targetYear: Number(document.getElementById('targetYear').value)
      };

      const data = JSON.parse(document.getElementById('inputJson').value);
      const ranked = data
        .map((row) => {
          const s = scoreDeal(row, cfg);
          return { ...row, ...s };
        })
        .filter((r) => r.valid)
        .sort((a, b) => b.score - a.score);

      latestRows = ranked;
      render(ranked);
    } catch (err) {
      alert('Invalid JSON input: ' + err.message);
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!latestRows.length) return alert('Run analysis first.');
    const blob = new Blob([toCsv(latestRows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spain_deals_ranked.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
})();
