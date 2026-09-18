import {
  SteamAppDetails,
  StoreAuditResult,
  DimensionScore,
  GradeRank,
  ActionItem,
} from './types.js';

export function runStoreAudit(app: SteamAppDetails): StoreAuditResult {
  // 1. Tag Accuracy (20%)
  const genreCount = app.genres ? app.genres.length : 0;
  const categoryCount = app.categories ? app.categories.length : 0;
  let tagScore = 40;
  if (genreCount >= 2) tagScore += 20;
  if (genreCount >= 4) tagScore += 10;
  if (categoryCount >= 3) tagScore += 15;
  if (categoryCount >= 5) tagScore += 15;
  tagScore = Math.min(100, Math.max(0, tagScore));

  const tagDim: DimensionScore = {
    score: tagScore,
    weight: 0.2,
    weightedScore: parseFloat((tagScore * 0.2).toFixed(1)),
    label: 'Tag Accuracy & Genre Anchoring',
    status: tagScore >= 80 ? 'optimal' : tagScore >= 60 ? 'warning' : 'critical',
    summary:
      tagScore >= 80
        ? `Rich genre & feature taxonomy (${genreCount} genres, ${categoryCount} features). Steam discovery queue can accurately anchor target players.`
        : `Sparse tag architecture. Risk of algorithmic misattribution in 'More Like This' and discovery queues. Recommend adding subgenre & gameplay loops.`,
    metrics: {
      genres: app.genres.map((g) => g.description),
      categoriesCount: categoryCount,
    },
  };

  // 2. Localization (20%)
  const langCount = app.languages_count || 1;
  let langScore = 0;
  if (langCount >= 12) {
    langScore = 100;
  } else if (langCount >= 8) {
    langScore = 80;
  } else if (langCount >= 6) {
    langScore = 55;
  } else if (langCount >= 3) {
    langScore = 30;
  } else {
    langScore = 15;
  }

  const supportedLower = (app.supported_languages || '').toLowerCase();
  const hasSimplifiedChinese =
    supportedLower.includes('simplified chinese') || supportedLower.includes('schinese');
  const hasJapanese = supportedLower.includes('japanese');
  const hasGerman = supportedLower.includes('german');

  const langDim: DimensionScore = {
    score: langScore,
    weight: 0.2,
    weightedScore: parseFloat((langScore * 0.2).toFixed(1)),
    label: 'Global Localization Coverage',
    status: langScore >= 80 ? 'optimal' : langScore >= 50 ? 'warning' : 'critical',
    summary:
      langCount >= 12
        ? `Covers ${langCount} languages (including EFIGS + CJK + Russian). Eligible for full global algorithmic push (+10% multiplier).`
        : `Only ${langCount} language(s) supported. Missing high-spending regions (e.g. Simplified Chinese, German, Japanese), incurring an algorithmic reach penalty (-15%).`,
    metrics: {
      languageCount: langCount,
      hasSimplifiedChinese,
      hasJapanese,
      hasGerman,
    },
  };

  // 3. Pricing Strategy (15%)
  let priceScore = 70;
  const price = app.price_usd;
  if (price === 0 && app.is_free) {
    priceScore = 90;
  } else if (price >= 9.99 && price <= 19.99) {
    priceScore = 100; // Sweet spot
  } else if (price > 19.99 && price <= 29.99) {
    priceScore = 85;
  } else if (price > 29.99) {
    priceScore = 55; // High friction for indies
  } else if (price > 0 && price < 9.99) {
    priceScore = 80;
  } else {
    priceScore = 85; // Unreleased placeholder
  }

  const priceDim: DimensionScore = {
    score: priceScore,
    weight: 0.15,
    weightedScore: parseFloat((priceScore * 0.15).toFixed(1)),
    label: 'Pricing Strategy & Friction',
    status: priceScore >= 80 ? 'optimal' : priceScore >= 60 ? 'warning' : 'critical',
    summary:
      price === 0
        ? `Unannounced final USD price. Modeled under standard indie benchmark ($14.99 - $19.99).`
        : price > 29.99
        ? `Price ($${price}) exceeds typical indie purchase threshold ($25.00). High conversion friction; requires strong initial hype & social proof.`
        : `Price ($${price}) sits in the high-converting indie sweet spot ($9.99 - $24.99).`,
    metrics: {
      priceUsd: price,
      isFree: app.is_free,
    },
  };

  // 4. Demo Status (15%)
  const demoScore = app.has_demo ? 100 : 0;
  const demoDim: DimensionScore = {
    score: demoScore,
    weight: 0.15,
    weightedScore: parseFloat((demoScore * 0.15).toFixed(1)),
    label: 'Demo Loop & Next Fest Eligibility',
    status: app.has_demo ? 'optimal' : 'critical',
    summary: app.has_demo
      ? `Playable Demo active! Eligible for Steam Next Fest with direct flywheel into wishlist accumulation.`
      : `No public demo detected. Ineligible for Steam Next Fest (the #1 free organic traffic driver), leading to -10% conversion drag.`,
    metrics: {
      hasDemo: app.has_demo,
    },
  };

  // 5. Visual Impact (15%)
  const scCount = app.screenshots_count || 0;
  const mvCount = app.movies_count || 0;
  let visualScore = 20;
  if (scCount >= 5) visualScore += 40;
  else if (scCount >= 3) visualScore += 20;

  if (mvCount >= 2) visualScore += 40;
  else if (mvCount === 1) visualScore += 30;

  visualScore = Math.min(100, visualScore);

  const visualDim: DimensionScore = {
    score: visualScore,
    weight: 0.15,
    weightedScore: parseFloat((visualScore * 0.15).toFixed(1)),
    label: 'Visual Assets & Trailer Impact',
    status: visualScore >= 80 ? 'optimal' : visualScore >= 60 ? 'warning' : 'critical',
    summary:
      scCount >= 5 && mvCount >= 1
        ? `Solid visual pacing (${scCount} screenshots, ${mvCount} trailer(s)). Prevents early bounce on page visits.`
        : `Under-equipped visual assets (${scCount} screenshots, ${mvCount} trailer(s)). First 2 screenshots must showcase active UI/gameplay loops.`,
    metrics: {
      screenshotsCount: scCount,
      moviesCount: mvCount,
    },
  };

  // 6. Short Description (15%)
  const descLen = (app.short_description || '').trim().length;
  let descScore = 30;
  if (descLen >= 120 && descLen <= 320) {
    descScore = 100;
  } else if (descLen > 320 && descLen <= 450) {
    descScore = 75;
  } else if (descLen >= 60 && descLen < 120) {
    descScore = 65;
  } else {
    descScore = 40;
  }

  const descDim: DimensionScore = {
    score: descScore,
    weight: 0.15,
    weightedScore: parseFloat((descScore * 0.15).toFixed(1)),
    label: 'Short Description Hook',
    status: descScore >= 80 ? 'optimal' : descScore >= 60 ? 'warning' : 'critical',
    summary:
      descScore >= 80
        ? `Concise length (${descLen} chars), effectively communicating core gameplay loop on hover cards and mobile feeds.`
        : `Short description (${descLen} chars) deviates from optimal 150-300 character sweet spot. Needs sharp hook + core loop upfront.`,
    metrics: {
      characterCount: descLen,
    },
  };

  // Total Score & Grade
  const totalScore = Math.round(
    tagDim.weightedScore +
      langDim.weightedScore +
      priceDim.weightedScore +
      demoDim.weightedScore +
      visualDim.weightedScore +
      descDim.weightedScore
  );

  let grade: GradeRank = 'C';
  let gradeLabel = 'Needs Optimization';
  if (totalScore >= 90) {
    grade = 'S';
    gradeLabel = 'Launch Ready';
  } else if (totalScore >= 80) {
    grade = 'A';
    gradeLabel = 'Strong';
  } else if (totalScore >= 70) {
    grade = 'B';
    gradeLabel = 'Moderate';
  } else if (totalScore >= 55) {
    grade = 'C';
    gradeLabel = 'Sub-optimal';
  } else if (totalScore >= 40) {
    grade = 'D';
    gradeLabel = 'Critical Issues';
  } else {
    grade = 'F';
    gradeLabel = 'Severe Deficiencies';
  }

  // Genre detection
  let detectedGenre = 'Indie Game';
  const allGenreNames = (app.genres || []).map((g) => g.description.toLowerCase());
  if (allGenreNames.some((g) => g.includes('rpg') || g.includes('role-playing'))) {
    detectedGenre = 'RPG / Adventure';
  } else if (allGenreNames.some((g) => g.includes('strategy') || g.includes('slg'))) {
    detectedGenre = 'Strategy / SLG';
  } else if (allGenreNames.some((g) => g.includes('simulation'))) {
    detectedGenre = 'Simulation';
  } else if (allGenreNames.some((g) => g.includes('action') || g.includes('shooter'))) {
    detectedGenre = 'Action / Shooter';
  } else if (allGenreNames.some((g) => g.includes('casual') || g.includes('puzzle'))) {
    detectedGenre = 'Casual / Puzzle';
  }

  // Algorithmic Multiplier
  let algoMultiplier = 1.0;
  if (langCount >= 12) algoMultiplier *= 1.1;
  if (langCount <= 5) algoMultiplier *= 0.85;
  if (!app.has_demo) algoMultiplier *= 0.9;
  if (price > 25) algoMultiplier *= 0.75;
  if (price > 0 && price < 10) algoMultiplier *= 1.2;
  if (mvCount >= 1) algoMultiplier *= 1.05;

  // Generate actionable prescriptions
  const prescriptions: ActionItem[] = [];

  if (langDim.score < 80) {
    prescriptions.push({
      id: 'act-localization',
      title: 'Expand Localization to Top 4 Buying Languages (Schinese, Japanese, German, Russian)',
      category: 'Localization',
      priority: 'critical',
      expectedScoreBoost: '+15 Health Score / +10% Day-1 Organic Conversion',
      impactLabel: 'Global Purchasing Power',
      reason: `Only ${langCount} language(s) configured. Simplified Chinese (~30% of global Steam audience) and German/Japanese represent over 40% of non-English indie game revenues. Missing these triggers regional recommendation downgrades.`,
      executionSteps: [
        'Localize store page first (short/long description, key bullet points, UI text screenshots) even before in-game text.',
        'Use Crowdin or community localization for high-priority UI strings.',
        'Ensure language support flags are accurately checked in Steamworks.',
      ],
    });
  }

  if (demoDim.score === 0) {
    prescriptions.push({
      id: 'act-demo',
      title: 'Release a 20-30 Minute Standalone Demo and Register for Steam Next Fest',
      category: 'Demo',
      priority: 'critical',
      expectedScoreBoost: '+15 Health Score / +25% Wishlist Velocity',
      impactLabel: 'Traffic Flywheel',
      reason:
        'A public demo qualifies your title for Steam Next Fest, the largest free organic conversion window on the platform. Titles with demos experience 3.4x higher daily wishlist retention.',
      executionSteps: [
        'Slice the most engaging 20-30 minute vertical gameplay segment.',
        'Embed an explicit high-contrast "Add to Wishlist" call-to-action screen upon demo completion.',
        'Deploy the demo at least 3 months prior to launch to meet festival registration deadlines.',
      ],
    });
  }

  if (visualDim.score < 80) {
    prescriptions.push({
      id: 'act-visuals',
      title: 'Restructure First 2 Store Screenshots to Show High-Tension Gameplay with UI',
      category: 'Visuals',
      priority: 'high',
      expectedScoreBoost: '+10 Health Score / -18% Bounce Rate',
      impactLabel: 'Above-the-Fold Retention',
      reason:
        '70% of Steam shoppers evaluate only the first two screenshots during mouseover hover cards or store entry. Avoid concept art or splash screens in slots #1 and #2.',
      executionSteps: [
        'Replace screenshot #1 with high-clarity live action showing health bars/damage numbers/UI to prove game feel.',
        'Screenshot #2 should highlight meta-progression (tech trees, inventory, card drafting).',
        'Ensure the first 5 seconds of trailer #1 jump immediately into live gameplay without studio title cards.',
      ],
    });
  }

  if (descDim.score < 80) {
    prescriptions.push({
      id: 'act-short-desc',
      title: 'Rewrite Short Description: Deploy 2-Sentence "Core Micro-Loop + Unique Hook" Formula',
      category: 'Tags & SEO',
      priority: 'high',
      expectedScoreBoost: '+15 Health Score / Higher Hover-Card CTR',
      impactLabel: 'Immediate Value Proposition',
      reason:
        'The short description is the only copy rendered on hover cards, search auto-completes, and mobile Steam feeds. Narrative lore should be secondary to genre micro-loops.',
      executionSteps: [
        'Sentence 1: Clear genre positioning (e.g. "[Game Name] is a roguelike deckbuilder where you...").',
        'Sentence 2: The unique mechanical hook (e.g. "...where every card played physically alters the terrain").',
        'Keep length between 180 and 280 characters.',
      ],
    });
  }

  if (priceDim.score < 80) {
    prescriptions.push({
      id: 'act-pricing',
      title: 'Calibrate Launch Pricing & 10%-15% Launch Discount Matrix',
      category: 'Pricing',
      priority: 'medium',
      expectedScoreBoost: '+10 Health Score / Reduced Conversion Friction',
      impactLabel: 'Price-to-Value Alignment',
      reason: `Indie pricing over $24.99 faces significant friction unless backed by an established franchise or 30+ hours of content.`,
      executionSteps: [
        'Benchmark against top-reviewed titles in your subgenre released in the past 12 months.',
        'Schedule a 10%-15% launch week discount to trigger immediate wishlist email conversions.',
        'Ensure Steamworks recommended regional currency pricing is activated.',
      ],
    });
  }

  const reportUrl = `https://wishlistdoc.com/report?id=${app.appid}`;

  return {
    appid: app.appid,
    name: app.name,
    overallScore: totalScore,
    grade,
    gradeLabel,
    summary: `Store Health Score: ${totalScore}/100 (Grade ${grade} - ${gradeLabel}). Evaluated across 6 Steam algorithm parameters for ${detectedGenre}.`,
    reportUrl,
    dimensions: {
      tagAccuracy: tagDim,
      localization: langDim,
      pricing: priceDim,
      demoStatus: demoDim,
      visualAssets: visualDim,
      shortDescription: descDim,
    },
    detectedGenre,
    algoMultiplier: parseFloat(algoMultiplier.toFixed(2)),
    isAlgofriendly: totalScore >= 75,
    prescriptions,
  };
}
