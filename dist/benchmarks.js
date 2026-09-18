export const GENRE_BENCHMARKS = {
    rpg: {
        genre: 'RPG / Strategy (High Depth)',
        description: 'Deep system-driven games including turn-based RPGs, grand strategy, deckbuilders, and tactical simulations. Highly sticky audiences with strong pre-order/launch willingness.',
        medianFirstWeekConversion: 0.16,
        pessimisticConversion: 0.064,
        optimisticConversion: 0.40,
        firstWeekToYear1Multiplier: 3.8,
        typicalWishlistDecayHalfLifeDays: 360,
        recommendedMinimumWishlists: 15000,
        keyDrivers: [
            'Complex progression systems and replayability',
            'Extensive modding and Steam Workshop support',
            'High Twitch/YouTube streamer completion value',
            'Strong international demand across Asia (China/Japan) and Europe (Germany)',
        ],
        benchmarksUrl: 'https://wishlistdoc.com/benchmarks',
    },
    action: {
        genre: 'Action / Roguelike / Shooter',
        description: 'Fast-paced mechanical action games, twin-stick shooters, side-scrolling platformers, and action roguelites. Driven by visual responsiveness and dynamic combat loops.',
        medianFirstWeekConversion: 0.13,
        pessimisticConversion: 0.052,
        optimisticConversion: 0.325,
        firstWeekToYear1Multiplier: 3.2,
        typicalWishlistDecayHalfLifeDays: 270,
        recommendedMinimumWishlists: 10000,
        keyDrivers: [
            'Immediate game feel (juiciness) conveyed in the first 5 seconds of trailer',
            'Steam Deck verification and gamepad controller support',
            'High difficulty / speedrun community appeal',
            'Playable combat demo during Steam Next Fest',
        ],
        benchmarksUrl: 'https://wishlistdoc.com/benchmarks',
    },
    simulation: {
        genre: 'Simulation / Management / Sandbox',
        description: 'Colony sims, factory automation, farming simulators, and tycoon games. Exceptional long-tail sales curve with steady post-launch update momentum.',
        medianFirstWeekConversion: 0.12,
        pessimisticConversion: 0.048,
        optimisticConversion: 0.30,
        firstWeekToYear1Multiplier: 3.5,
        typicalWishlistDecayHalfLifeDays: 300,
        recommendedMinimumWishlists: 12000,
        keyDrivers: [
            'Infinite emergent player-driven gameplay loops',
            'Extensive Early Access roadmap transparency',
            'Steam Community Hub guides and player screenshot showcases',
            'Regular content updates sustaining algorithmic discovery peaks',
        ],
        benchmarksUrl: 'https://wishlistdoc.com/benchmarks',
    },
    horror: {
        genre: 'Horror / Atmospheric Survival',
        description: 'Psychological horror, jump-scare survival, and found-footage exploration. Highly viral among content creators with intense launch-window spikes.',
        medianFirstWeekConversion: 0.14,
        pessimisticConversion: 0.056,
        optimisticConversion: 0.35,
        firstWeekToYear1Multiplier: 2.8,
        typicalWishlistDecayHalfLifeDays: 210,
        recommendedMinimumWishlists: 8000,
        keyDrivers: [
            'Streamer-friendly jump scares and reactive gameplay clips',
            'High sound design fidelity and dark claustrophobic lighting',
            'Seasonal launch timing (Halloween / Autumn Steam Sale)',
            'Tight 2-4 hour polished narrative pacing',
        ],
        benchmarksUrl: 'https://wishlistdoc.com/benchmarks',
    },
    casual: {
        genre: 'Casual / Puzzle / Narrative',
        description: 'Cozy games, logic puzzle solvers, visual novels, and short narrative experiences. Broader audience but higher price sensitivity.',
        medianFirstWeekConversion: 0.085,
        pessimisticConversion: 0.034,
        optimisticConversion: 0.21,
        firstWeekToYear1Multiplier: 2.6,
        typicalWishlistDecayHalfLifeDays: 180,
        recommendedMinimumWishlists: 7000,
        keyDrivers: [
            'Wholesome aesthetic / distinctive artistic illustration style',
            'Comfortable bite-sized gameplay sessions',
            'Accessible pricing ($4.99 - $14.99 range)',
            'TikTok / Instagram Reel visual aesthetic discovery',
        ],
        benchmarksUrl: 'https://wishlistdoc.com/benchmarks',
    },
};
export function getGenreBenchmark(query) {
    if (!query || query.toLowerCase() === 'all') {
        return GENRE_BENCHMARKS;
    }
    const q = query.toLowerCase().trim();
    for (const [key, value] of Object.entries(GENRE_BENCHMARKS)) {
        if (key.includes(q) || value.genre.toLowerCase().includes(q)) {
            return value;
        }
    }
    // Default fallback to action / standard indie
    return GENRE_BENCHMARKS.action;
}
