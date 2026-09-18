function stripHtml(html) {
    if (!html)
        return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
}
function parseLanguages(langStr) {
    if (!langStr)
        return ['English'];
    const clean = stripHtml(langStr);
    return clean
        .split(/[,、;\n]/)
        .map((s) => s.replace(/\*.*$/, '').trim())
        .filter((s) => s.length > 0 && !s.toLowerCase().includes('audio support'));
}
export async function fetchSteamApp(appid) {
    if (isNaN(appid) || appid <= 0) {
        throw new Error(`Invalid Steam AppID: ${appid}. Must be a positive integer.`);
    }
    // 1. Try WishlistDoc Edge API first
    try {
        const res = await fetch(`https://wishlistdoc.com/api/steam/${appid}`, {
            headers: {
                'User-Agent': 'wishlistdoc-mcp/1.0.0 (+https://wishlistdoc.com)',
                'Accept': 'application/json'
            }
        });
        if (res.ok) {
            const body = await res.json();
            if (body?.data?.appid) {
                return body.data;
            }
        }
    }
    catch (err) {
        // Fall back to direct Steam API below
    }
    // 2. Direct Steam Store API fallback
    const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`;
    const steamRes = await fetch(steamUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    });
    if (!steamRes.ok) {
        throw new Error(`Steam API returned HTTP status ${steamRes.status} for AppID ${appid}`);
    }
    const json = await steamRes.json();
    const appResponse = json[appid.toString()];
    if (!appResponse || !appResponse.success || !appResponse.data) {
        throw new Error(`Steam AppID ${appid} not found or not publicly released.`);
    }
    const d = appResponse.data;
    const languagesList = parseLanguages(d.supported_languages || '');
    const priceUsd = d.price_overview
        ? (d.price_overview.initial || d.price_overview.final) / 100
        : 0;
    return {
        appid,
        name: d.name || `App ${appid}`,
        type: d.type || 'game',
        is_free: Boolean(d.is_free),
        short_description: stripHtml(d.short_description || ''),
        header_image: d.header_image || '',
        capsule_image: d.capsule_image,
        background: d.background_raw || d.background || '',
        supported_languages: stripHtml(d.supported_languages || ''),
        languages_count: Math.max(languagesList.length, 1),
        languages_list: languagesList,
        developers: d.developers || [],
        publishers: d.publishers || [],
        price_usd: priceUsd,
        genres: d.genres || [],
        categories: d.categories || [],
        screenshots_count: (d.screenshots || []).length,
        screenshots: (d.screenshots || []).map((s) => ({
            id: s.id,
            path_thumbnail: s.path_thumbnail,
            path_full: s.path_full,
        })),
        movies_count: (d.movies || []).length,
        movies: (d.movies || []).map((m) => ({
            id: m.id,
            name: m.name || 'Trailer',
            thumbnail: m.thumbnail || '',
        })),
        has_demo: Boolean(d.demos && d.demos.length > 0),
        release_date: {
            coming_soon: Boolean(d.release_date?.coming_soon),
            date: d.release_date?.date || 'TBD',
        },
        recommendations_count: d.recommendations?.total || 0,
    };
}
