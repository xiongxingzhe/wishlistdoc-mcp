export interface SteamAppDetails {
  appid: number;
  name: string;
  type: string;
  is_free: boolean;
  short_description: string;
  header_image: string;
  capsule_image?: string;
  background?: string;
  supported_languages: string;
  languages_count: number;
  languages_list: string[];
  developers: string[];
  publishers: string[];
  price_usd: number;
  genres: Array<{ id: string; description: string }>;
  categories: Array<{ id: number; description: string }>;
  screenshots_count: number;
  screenshots: Array<{ id: number; path_thumbnail: string; path_full: string }>;
  movies_count: number;
  movies: Array<{ id: number; name: string; thumbnail: string }>;
  has_demo: boolean;
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  recommendations_count: number;
}

export type GradeRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface DimensionScore {
  score: number; // 0 - 100
  weight: number; // e.g. 0.20
  weightedScore: number;
  label: string;
  status: 'optimal' | 'warning' | 'critical';
  summary: string;
  metrics: Record<string, any>;
}

export interface ActionItem {
  id: string;
  title: string;
  category: 'Localization' | 'Tags & SEO' | 'Pricing' | 'Demo' | 'Visuals';
  priority: 'critical' | 'high' | 'medium';
  expectedScoreBoost: string;
  impactLabel: string;
  reason: string;
  executionSteps: string[];
}

export interface StoreAuditResult {
  appid: number;
  name: string;
  overallScore: number; // 0 - 100
  grade: GradeRank;
  gradeLabel: string;
  summary: string;
  reportUrl: string;
  dimensions: {
    tagAccuracy: DimensionScore;
    localization: DimensionScore;
    pricing: DimensionScore;
    demoStatus: DimensionScore;
    visualAssets: DimensionScore;
    shortDescription: DimensionScore;
  };
  detectedGenre: string;
  algoMultiplier: number;
  isAlgofriendly: boolean;
  prescriptions: ActionItem[];
}

export interface LaunchConeTier {
  firstWeekSales: number;
  year1GrossRevenue: number;
  confidenceDescription: string;
  conversionRatePercent: number;
}

export interface LaunchConePrediction {
  appid: number;
  name: string;
  reportUrl: string;
  baseEffectiveWishlists: number;
  detectedGenre: string;
  baseConversionRate: number;
  totalMultiplier: number;
  multipliers: {
    localization: number;
    demo: number;
    price: number;
    visuals: number;
  };
  p10_pessimistic: LaunchConeTier;
  p50_median: LaunchConeTier;
  p90_optimistic: LaunchConeTier;
  estimatedPriceUSD: number;
  year1Multiplier: number;
  empiricalMethodology: string;
}

export interface GenreBenchmarkInfo {
  genre: string;
  description: string;
  medianFirstWeekConversion: number; // e.g. 0.16 = 16%
  pessimisticConversion: number;
  optimisticConversion: number;
  firstWeekToYear1Multiplier: number;
  typicalWishlistDecayHalfLifeDays: number;
  recommendedMinimumWishlists: number;
  keyDrivers: string[];
  benchmarksUrl: string;
}
