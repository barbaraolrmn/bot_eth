const state = { mode: 'quick' };

const modeButtons = [...document.querySelectorAll('.mode-btn')];
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;
  });
});

document.getElementById('analyzeBtn').addEventListener('click', () => {
  const rawInput = document.getElementById('input').value.trim();
  const result = runScan(rawInput, state.mode);
  renderResult(result);
});

function runScan(rawInput, mode) {
  const asset = resolveEntity(rawInput);
  const signals = collectSignals(rawInput);

  const structural = scoreStructural(signals);
  const distribution = scoreDistribution(signals);
  const market = scoreMarket(signals);
  const narrative = scoreNarrative(signals);
  const community = scoreCommunity(signals);
  const entry = scoreEntry(signals, mode);

  const combined = combineScores({ structural, distribution, market, narrative, community, entry, signals });
  const explanation = buildExplanation(combined, signals, mode);

  return {
    asset,
    verdict: combined.verdict,
    scores: {
      structural_risk: structural.score,
      distribution_risk: distribution.score,
      market_quality: market.score,
      narrative_strength: narrative.score,
      community_quality: community.score,
      entry_quality: entry.score,
    },
    summary: {
      thesis: explanation.thesis,
      anti_fomo_note: explanation.antiFomo,
      main_risk_of_error: explanation.mainRisk,
    },
    key_points: {
      red_flags: explanation.redFlags,
      green_flags: explanation.greenFlags,
      watchlist_reasons: explanation.watchReasons,
    },
    signals,
    missing_data: combined.missingData,
  };
}

function resolveEntity(input) {
  const isUrl = /^https?:\/\//i.test(input);
  const isContract = /^0x[a-fA-F0-9]{40}$/.test(input);
  const inputType = isContract ? 'contract' : isUrl ? 'url' : 'ticker';
  const ticker = isContract ? 'UNKNOWN' : (input.match(/[A-Za-z]{2,10}/)?.[0] || 'UNKNOWN').toUpperCase();
  const chain = /(sol|pump|bonk)/i.test(input) ? 'solana' : 'ethereum';

  return {
    name: ticker === 'UNKNOWN' ? 'Unknown token' : `${ticker} Token`,
    ticker,
    contract: isContract ? input : '',
    chain,
    source_url: isUrl ? input : '',
    input_type: inputType,
    launch_stage: 'meme_launch',
    meme_type: 'generic',
  };
}

function collectSignals(rawInput) {
  const seed = [...rawInput].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 777;
  const rnd = (min, max, shift = 1) => {
    const x = Math.abs(Math.sin(seed * shift)) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const marketCap = rnd(80000, 35000000, 1.1);
  const volume24 = rnd(10000, 22000000, 1.2);
  const volMc = volume24 / marketCap;

  return {
    lp_locked_pct: Math.round(rnd(0, 100, 1.3)),
    mint_authority_disabled: rnd(0, 1, 1.4) > 0.18,
    freeze_authority_disabled: rnd(0, 1, 1.5) > 0.2,
    honeypot_risk: rnd(0, 1, 1.6),
    top_holder_pct: +(rnd(1, 12, 1.7)).toFixed(2),
    top10_holder_pct: +(rnd(10, 55, 1.8)).toFixed(2),
    fresh_wallet_count: Math.round(rnd(0, 8, 1.9)),
    bundler_ratio: +(rnd(0, 0.5, 2.0)).toFixed(2),
    same_funding_source_count: Math.round(rnd(0, 7, 2.1)),
    creator_sell_detected: rnd(0, 1, 2.2) > 0.72,
    cluster_sell_detected: rnd(0, 1, 2.3) > 0.7,
    market_cap: Math.round(marketCap),
    fdv: Math.round(marketCap * rnd(1.02, 1.8, 2.4)),
    liquidity: Math.round(marketCap * rnd(0.01, 0.35, 2.5)),
    volume_5m: Math.round(volume24 * rnd(0.005, 0.04, 2.6)),
    volume_1h: Math.round(volume24 * rnd(0.04, 0.22, 2.7)),
    volume_24h: Math.round(volume24),
    vol_mc_ratio: +volMc.toFixed(2),
    fees_paid_native: +(rnd(0.05, 55, 2.8)).toFixed(2),
    makers_count: Math.round(rnd(20, 3300, 2.9)),
    holders_count: Math.round(rnd(80, 17000, 3.0)),
    makers_holders_ratio: +(rnd(0.02, 0.6, 3.1)).toFixed(2),
    boost_flag: rnd(0, 1, 3.2) > 0.7,
    trend_structure: rnd(0, 1, 3.3) > 0.55 ? 'uptrend' : 'range',
    break_of_structure: rnd(0, 1, 3.4) > 0.5,
    chart_pattern_risk: rnd(0, 1, 3.5) > 0.75 ? 'up_only_low_volume' : 'normal',
    slippage_est_buy_small: +(rnd(0.2, 9, 3.6)).toFixed(2),
    slippage_est_sell_small: +(rnd(0.2, 12, 3.7)).toFixed(2),
    mention_velocity: +(rnd(0, 100, 3.8)).toFixed(1),
    mention_acceleration: +(rnd(-50, 80, 3.9)).toFixed(1),
    virality_longevity: +(rnd(0, 100, 4.0)).toFixed(1),
    vamp_risk: +(rnd(0, 1, 4.1)).toFixed(2),
    kol_dependency: +(rnd(0, 1, 4.2)).toFixed(2),
    community_persistence: +(rnd(0, 100, 4.3)).toFixed(1),
    cto_flag: rnd(0, 1, 4.4) > 0.72,
  };
}

function baseScore(value = 100) {
  return { score: value, flags: [], reasons: [], missingData: [] };
}

function scoreStructural(s) {
  const r = baseScore();
  if (s.lp_locked_pct < 30) { r.score -= 35; r.flags.push('lp_unlocked'); r.reasons.push('LP почти не заблокирован.'); }
  if (!s.mint_authority_disabled) { r.score -= 30; r.flags.push('mint_enabled'); r.reasons.push('Mint authority включён.'); }
  if (!s.freeze_authority_disabled) { r.score -= 20; r.flags.push('freeze_enabled'); r.reasons.push('Freeze authority включён.'); }
  if (s.honeypot_risk > 0.7) { r.score -= 40; r.flags.push('honeypot_high'); r.reasons.push('Высокий риск honeypot.'); }
  if (r.reasons.length === 0) r.reasons.push('Структурно базовые проверки выглядят приемлемо.');
  r.score = clamp(r.score);
  return r;
}

function scoreDistribution(s) {
  const r = baseScore();
  if (s.top_holder_pct > 8) { r.score -= 45; r.reasons.push('Топ-холдер > 8%: severe negative.'); }
  else if (s.top_holder_pct > 5) { r.score -= 30; r.reasons.push('Топ-холдер > 5%: strong negative.'); }
  else if (s.top_holder_pct > 3.5) { r.score -= 15; r.reasons.push('Топ-холдер > 3.5%: negative.'); }

  if (s.fresh_wallet_count >= 4) { r.score -= 25; r.reasons.push('4+ свежих кошелька среди крупных держателей.'); }
  else if (s.fresh_wallet_count >= 2) { r.score -= 12; r.reasons.push('2-3 свежих кошелька: caution.'); }

  if (s.same_funding_source_count >= 4) { r.score -= 20; r.reasons.push('Похожие источники фондирования у топ-кошельков.'); }
  if (s.creator_sell_detected) { r.score -= 30; r.flags.push('creator_drain_detected'); r.reasons.push('Обнаружены продажи создателя.'); }
  if (s.cluster_sell_detected) { r.score -= 15; r.reasons.push('Кластерные продажи повышают риск разгрузки.'); }

  if (r.reasons.length === 0) r.reasons.push('Распределение выглядит умеренно здоровым.');
  r.score = clamp(r.score);
  return r;
}

function scoreMarket(s) {
  const r = baseScore();
  if (s.vol_mc_ratio < 0.5) { r.score -= 40; r.reasons.push('vol/MC < 0.5: severe negative.'); }
  else if (s.vol_mc_ratio < 0.8) { r.score -= 25; r.reasons.push('vol/MC < 0.8: strong negative.'); }
  else { r.reasons.push('vol/MC подтверждает рыночную активность.'); }

  if (s.liquidity < s.market_cap * 0.03) { r.score -= 18; r.reasons.push('Низкая ликвидность относительно MC.'); }
  if (s.fees_paid_native < 1) { r.score -= 8; r.reasons.push('Комиссии слишком низкие для заявленного масштаба.'); }
  if (s.chart_pattern_risk !== 'normal') { r.score -= 20; r.flags.push('chart_pattern_risk'); r.reasons.push('Подозрительный up-only паттерн на слабом участии.'); }
  if (s.makers_holders_ratio < 0.05) { r.score -= 10; r.reasons.push('Низкий makers/holders ratio.'); }

  r.score = clamp(r.score);
  return r;
}

function scoreNarrative(s) {
  const r = baseScore(55);
  if (s.mention_velocity > 60) { r.score += 16; r.reasons.push('Высокая скорость упоминаний.'); }
  if (s.mention_acceleration > 20) { r.score += 10; r.reasons.push('Ускорение внимания положительное.'); }
  if (s.vamp_risk > 0.6) { r.score -= 14; r.reasons.push('Высокий vamp risk (переток внимания).'); }
  if (s.kol_dependency > 0.7) { r.score -= 10; r.reasons.push('Сильная зависимость от KOL.'); }
  if (s.virality_longevity > 60) { r.score += 10; r.reasons.push('Виральность держится дольше среднего.'); }

  r.score = clamp(r.score);
  return r;
}

function scoreCommunity(s) {
  const r = baseScore(50);
  if (s.community_persistence > 60) { r.score += 20; r.reasons.push('Комьюнити сохраняет активность со временем.'); }
  if (s.cto_flag) { r.score += 8; r.reasons.push('Есть признаки community takeover.'); }
  if (s.community_persistence < 25) { r.score -= 15; r.reasons.push('Активность сообщества нестабильна.'); }
  r.score = clamp(r.score);
  return r;
}

function scoreEntry(s, mode) {
  const r = baseScore(50);
  if (s.trend_structure === 'uptrend' && s.break_of_structure) { r.score += 20; r.reasons.push('Есть подтверждение структуры тренда.'); }
  if (s.slippage_est_buy_small > 5 || s.slippage_est_sell_small > 6) { r.score -= 20; r.reasons.push('Высокое проскальзывание для входа/выхода.'); }
  if (s.chart_pattern_risk === 'up_only_low_volume') { r.score -= 25; r.reasons.push('Вероятен перегретый вход (chasing).'); }
  if (mode === 'execution' && s.vol_mc_ratio < 0.8) { r.score -= 10; r.reasons.push('Execution mode: дождитесь подтверждения структуры.'); }
  r.score = clamp(r.score);
  return r;
}

function combineScores({ structural, distribution, market, narrative, community, entry, signals }) {
  const hardFailReasons = [];

  if (signals.honeypot_risk > 0.7) hardFailReasons.push('Высокий honeypot risk');
  if (signals.lp_locked_pct < 30) hardFailReasons.push('LP unlocked / low lock');
  if (!signals.mint_authority_disabled) hardFailReasons.push('Mint authority включён');
  if (!signals.freeze_authority_disabled) hardFailReasons.push('Freeze authority включён');
  if (distribution.flags.includes('creator_drain_detected')) hardFailReasons.push('Creator drain detected');
  if (signals.top_holder_pct > 8 && signals.fresh_wallet_count >= 4) hardFailReasons.push('Extreme bundle/concentration');
  if (signals.chart_pattern_risk === 'up_only_low_volume' && signals.vol_mc_ratio < 0.8 && signals.holders_count < 500) {
    hardFailReasons.push('Up-only low-volume low-holder trap');
  }

  let total = (
    structural.score * 0.25 +
    distribution.score * 0.20 +
    market.score * 0.15 +
    narrative.score * 0.20 +
    community.score * 0.10 +
    entry.score * 0.10
  );

  const hardFail = hardFailReasons.length > 0;
  if (hardFail) total = Math.min(total, 35);

  const scoreTotal = Math.round(clamp(total));
  const label = mapVerdict(scoreTotal, hardFail);
  const confidence = estimateConfidence({ structural, distribution, market, narrative, community, entry });
  const recommendedAction = mapAction(scoreTotal, hardFail);

  return {
    verdict: {
      label,
      score_total: scoreTotal,
      confidence,
      recommended_action: recommendedAction,
      hard_fail: hardFail,
      hard_fail_reasons: hardFailReasons,
    },
    missingData: [
      ...(signals.market_cap ? [] : ['market_cap']),
      ...(signals.holders_count ? [] : ['holders_count']),
    ],
  };
}

function buildExplanation(result, signals, mode) {
  const redFlags = [];
  const greenFlags = [];
  const watchReasons = [];

  if (result.verdict.hard_fail) {
    redFlags.push(...result.verdict.hard_fail_reasons.slice(0, 3));
  }

  if (signals.vol_mc_ratio < 0.8) redFlags.push('Низкий vol/MC: ликвидность/интерес могут быть слабее, чем кажется.');
  if (signals.top_holder_pct > 5) redFlags.push('Высокая концентрация у топ-холдера.');
  if (signals.kol_dependency > 0.7) redFlags.push('Нарратив может держаться только на KOL-внимании.');

  if (signals.lp_locked_pct > 70 && signals.mint_authority_disabled && signals.freeze_authority_disabled) {
    greenFlags.push('Базовая структурная безопасность выше среднего.');
  }
  if (signals.community_persistence > 60) greenFlags.push('Комьюнити демонстрирует устойчивость во времени.');
  if (signals.mention_acceleration > 20) greenFlags.push('Внимание растёт органично, а не только разово.');

  watchReasons.push(`Режим ${mode}: ${mapAction(result.verdict.score_total, result.verdict.hard_fail)}.`);
  if (!result.verdict.hard_fail && signals.chart_pattern_risk !== 'normal') {
    watchReasons.push('Идея может быть валидной, но вход сейчас выглядит слабым.');
  }

  return {
    thesis: 'Оценка собрана консервативно: структурные риски важнее нарратива.',
    antiFomo: signals.chart_pattern_risk === 'up_only_low_volume'
      ? 'Anti-FOMO: не догоняйте вертикальное движение без подтверждения объёма и структуры.'
      : 'Anti-FOMO: входить только по плану и после подтверждения структуры.',
    mainRisk: result.verdict.hard_fail
      ? 'Главный риск ошибки — недооценка капитального риска по hard-fail сигналам.'
      : 'Главный риск ошибки — внезапное ухудшение структуры/ликвидности после скана.',
    redFlags: uniqueTake(redFlags, 3),
    greenFlags: uniqueTake(greenFlags, 3),
    watchReasons: uniqueTake(watchReasons, 3),
  };
}

function renderResult(output) {
  document.getElementById('resultPanel').hidden = false;
  document.getElementById('summaryPanel').hidden = false;
  document.getElementById('detailsPanel').hidden = false;

  const verdict = output.verdict;
  document.getElementById('verdictLabel').textContent = verdict.label;
  document.getElementById('scoreTotal').textContent = String(verdict.score_total);
  document.getElementById('confidence').textContent = verdict.confidence;
  document.getElementById('action').textContent = verdict.recommended_action;

  const hardFailBanner = document.getElementById('hardFailBanner');
  if (verdict.hard_fail) {
    hardFailBanner.style.display = 'block';
    const reasons = verdict.hard_fail_reasons.slice(0, 3).map((x) => `• ${x}`).join('<br>');
    hardFailBanner.innerHTML = `<strong>HARD FAIL</strong><br>${reasons}`;
  } else {
    hardFailBanner.style.display = 'none';
  }

  writeList('redFlags', output.key_points.red_flags);
  writeList('greenFlags', output.key_points.green_flags);
  writeList('nextSteps', output.key_points.watchlist_reasons);

  const sub = output.scores;
  document.getElementById('subScores').innerHTML = `
    <ul>
      <li>Structural Risk: <strong>${sub.structural_risk}</strong></li>
      <li>Distribution Risk: <strong>${sub.distribution_risk}</strong></li>
      <li>Market Quality: <strong>${sub.market_quality}</strong></li>
      <li>Narrative Strength: <strong>${sub.narrative_strength}</strong></li>
      <li>Community Quality: <strong>${sub.community_quality}</strong></li>
      <li>Entry Quality: <strong>${sub.entry_quality}</strong></li>
    </ul>
  `;

  document.getElementById('missingData').textContent = output.missing_data.length
    ? `Анализ ограничен. Отсутствуют данные: ${output.missing_data.join(', ')}`
    : 'Все критичные разделы для MVP заполнены.';

  document.getElementById('jsonOutput').textContent = JSON.stringify(output, null, 2);
}

function writeList(id, items) {
  const root = document.getElementById(id);
  root.innerHTML = '';
  (items.length ? items : ['Недостаточно подтверждённых пунктов.']).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    root.appendChild(li);
  });
}

function mapVerdict(score, hardFail) {
  if (hardFail) return score < 30 ? 'AVOID' : 'WATCH';
  if (score <= 24) return 'AVOID';
  if (score <= 44) return 'WEAK / TRASH / DO NOT TOUCH';
  if (score <= 59) return 'WATCH';
  if (score <= 74) return 'SPECULATIVELY INTERESTING';
  return 'STRONG SETUP';
}

function mapAction(score, hardFail) {
  if (hardFail) return 'do_not_touch';
  if (score < 25) return 'do_not_touch';
  if (score < 45) return 'add_to_watchlist';
  if (score < 60) return 'wait_for_structure_confirmation';
  if (score < 75) return 'micro_size_only';
  return 'wait_for_pullback';
}

function estimateConfidence(parts) {
  const values = Object.values(parts).map((x) => x.score);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg > 70) return 'high';
  if (avg > 45) return 'medium';
  return 'low';
}

function clamp(x) {
  return Math.max(0, Math.min(100, x));
}

function uniqueTake(arr, n) {
  return [...new Set(arr)].slice(0, n);
}
