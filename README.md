# 🎮 WishlistDoc MCP Server

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-orange.svg)](https://nodejs.org/)
[![Website](https://img.shields.io/badge/Website-wishlistdoc.com-purple.svg)](https://wishlistdoc.com)

The official **[Model Context Protocol (MCP)](https://modelcontextprotocol.io)** server for **[WishlistDoc](https://wishlistdoc.com)** — giving AI agents (Claude, Cursor, Windsurf, Claude Code, Cline) direct access to Steam store algorithmic health audits, empirical P10/P50/P90 sales cone forecasts, and indie game market benchmarks.

---

## 🌟 Why WishlistDoc MCP?

Steam's recommendation algorithm is responsible for over 70% of an indie game's organic reach. **WishlistDoc MCP** enables your AI development assistant to evaluate any Steam store page instantly and forecast commercial outcomes based on empirical industry datasets from GameDiscoverCo and Steamworks.

- **🏥 Instant Store Page Health Audit:** Evaluates 6 algorithmic dimensions (Tag precision, Localization depth, Price resistance, Demo loop, Visual pacing, Short description hook) and returns an S/A/B/C letter grade and prioritized prescriptions.
- **📈 P10 / P50 / P90 Sales Cone Forecasting:** Predicts first-week unit sales and first-year gross revenue under pessimistic, median, and viral breakout scenarios with subgenre conversion rates.
- **📊 Subgenre Benchmarks:** Queries baseline conversion rates, wishlist decay half-life curves (e.g. 270 days), and minimum launch thresholds across RPG, Action, Simulation, Horror, and Casual genres.
- **🔗 Direct Web Report Integration:** Every diagnostic returns deep links to interactive web reports on [wishlistdoc.com](https://wishlistdoc.com).

---

## 🚀 Quick Start

### 1. Claude Desktop

Add `wishlistdoc-mcp` to your `claude_desktop_config.json`:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wishlistdoc": {
      "command": "npx",
      "args": ["-y", "wishlistdoc-mcp"]
    }
  }
}
```

### 2. Cursor (.cursor/mcp.json)

In your project root or user settings, configure `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wishlistdoc": {
      "command": "npx",
      "args": ["-y", "wishlistdoc-mcp"]
    }
  }
}
```

### 3. Claude Code CLI

Add the server via CLI command:

```bash
claude mcp add wishlistdoc-mcp -- npx -y wishlistdoc-mcp
```

### 4. Smithery (1-Click Install)

Install automatically via [Smithery](https://smithery.ai):

```bash
npx -y @smithery/cli install wishlistdoc-mcp --client claude
```

---

## 🛠️ Available MCP Tools

### `audit_steam_store`
Audits the algorithmic readiness of any Steam store page by AppID.

**Inputs:**
- `appid` *(number, required)*: The Steam application ID (e.g., `105600` for Terraria, `1245620` for Elden Ring).

**Returns:**
- Overall Store Health Score (`0 - 100`) and Grade (`S`, `A`, `B`, `C`, `D`, `F`)
- 6-dimension score breakdown with status (`OPTIMAL`, `WARNING`, `CRITICAL`)
- Primary subgenre detection & algorithmic traffic multiplier
- Ranked action prescriptions with expected score boost and execution steps
- Direct link to web audit report on [wishlistdoc.com/report](https://wishlistdoc.com)

---

### `predict_sales_cone`
Forecasts launch performance and Year-1 gross revenue using empirical conversion models.

**Inputs:**
- `appid` *(number, required)*: The Steam application ID.
- `wishlists` *(number, optional)*: Pre-launch wishlist count. If omitted, empirical estimates based on reviews or median indie cohorts are used.
- `customPriceUSD` *(number, optional)*: Target launch price in USD (e.g. `19.99`).

**Returns:**
- Confidence tiers:
  - **P10 (Pessimistic Floor):** 90% probability above this floor (0.40x median).
  - **P50 (Median Benchmark):** Expected baseline for peer titles (1.0x).
  - **P90 (Breakout Ceiling):** Viral breakout tier (2.50x).
- First-week unit sales & Year-1 estimated gross revenue.
- Algorithmic multipliers (Localization, Demo, Pricing friction, Visual assets).

---

### `get_genre_benchmarks`
Retrieves industry launch benchmarks and wishlist decay parameters.

**Inputs:**
- `genre` *(string, optional)*: Query specific genre (`"rpg"`, `"action"`, `"simulation"`, `"horror"`, `"casual"`, or `"all"`).

**Returns:**
- Median first-week conversion percentage.
- Year-1 lifetime revenue multiplier.
- Wishlist decay half-life duration (in days).
- Recommended minimum pre-launch wishlist target.
- Key commercial drivers for the genre.
- Link to [wishlistdoc.com/benchmarks](https://wishlistdoc.com/benchmarks).

---

## 💬 Example AI Prompts

Once configured in Claude or Cursor, you can ask questions naturally:

- *"Audit my game on Steam (AppID: 2145320). What are the top 3 issues keeping it from getting algorithm recommendations?"*
- *"We are launching our deckbuilder RPG with 18,000 wishlists at $19.99 USD. Predict our P10, P50, and P90 first-week sales and Year 1 revenue."*
- *"What is the standard wishlist decay curve and launch conversion rate for an indie simulation game on Steam?"*

---

## 🔬 Empirical Methodology

All models implemented in **WishlistDoc MCP** are grounded in:
1. **Simon Carless / GameDiscoverCo** empirical Steam game discovery research.
2. **Steamworks Documentation** recommendations for store metadata and regional localization.
3. **WishlistDoc 270-Day Half-Life Decay Equation:** Accounts for the decaying purchase intent of older wishlists over time:
   $$\text{Effective Wishlists} = \sum W_i \cdot e^{-\lambda (t - t_i)}$$

---

## 🔗 Related Resources

- **Official Web Platform:** [wishlistdoc.com](https://wishlistdoc.com)
- **Interactive Store Audit:** [wishlistdoc.com/report](https://wishlistdoc.com/report)
- **Steam Benchmarks Calculator:** [wishlistdoc.com/benchmarks](https://wishlistdoc.com/benchmarks)
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

## 📄 License

MIT © [WishlistDoc](https://wishlistdoc.com)
