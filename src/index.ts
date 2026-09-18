#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { fetchSteamApp } from './steam-client.js';
import { runStoreAudit } from './audit.js';
import { runSalesConePrediction } from './prediction.js';
import { getGenreBenchmark } from './benchmarks.js';

const server = new Server(
  {
    name: 'wishlistdoc-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'audit_steam_store',
        description:
          'Audit a Steam game store page health score (0-100), letter grade (S/A/B/C/D/F), 6 algorithmic dimensions (tags, localization, pricing resistance, demo loop, visual assets, short description), and prioritized actionable prescriptions. Powered by WishlistDoc (https://wishlistdoc.com).',
        inputSchema: {
          type: 'object',
          properties: {
            appid: {
              type: 'number',
              description: 'The Steam App ID (e.g. 105600 for Terraria, 1245620 for Elden Ring).',
            },
          },
          required: ['appid'],
        },
      },
      {
        name: 'predict_sales_cone',
        description:
          'Forecast Steam first-week unit sales and first-year gross revenue across P10 (pessimistic floor), P50 (median benchmark), and P90 (breakout ceiling) confidence tiers. Powered by WishlistDoc empirical game discovery models.',
        inputSchema: {
          type: 'object',
          properties: {
            appid: {
              type: 'number',
              description: 'The Steam App ID.',
            },
            wishlists: {
              type: 'number',
              description:
                'Optional target or current pre-launch wishlist count. If omitted, an empirical estimate based on community size or median indie benchmark will be used.',
            },
            customPriceUSD: {
              type: 'number',
              description:
                'Optional simulation price in USD (e.g. 19.99). Overrides the store price or default placeholder.',
            },
          },
          required: ['appid'],
        },
      },
      {
        name: 'get_genre_benchmarks',
        description:
          'Retrieve Steam industry launch conversion benchmarks, Year-1 revenue multipliers, and 270-day wishlist decay curves for specific game genres (RPG, Action, Simulation, Horror, Casual, or all).',
        inputSchema: {
          type: 'object',
          properties: {
            genre: {
              type: 'string',
              description:
                'Genre name to query (e.g. "rpg", "action", "simulation", "horror", "casual", or "all").',
            },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'audit_steam_store') {
      const appid = Number(args?.appid);
      if (!appid || isNaN(appid)) {
        throw new McpError(ErrorCode.InvalidParams, 'A valid numeric "appid" is required.');
      }

      const app = await fetchSteamApp(appid);
      const audit = runStoreAudit(app);

      const markdown = [
        `# 🏥 WishlistDoc Steam Store Health Audit: ${audit.name} (AppID: ${audit.appid})`,
        ``,
        `**Overall Store Score:** **${audit.overallScore} / 100** — Grade: **${audit.grade}** (${audit.gradeLabel})`,
        `**Detected Primary Genre:** ${audit.detectedGenre}`,
        `**Algorithm Multiplier:** ${audit.algoMultiplier}x (${audit.isAlgofriendly ? '✅ Algorithm-Friendly' : '⚠️ Algorithm Friction'})`,
        ``,
        `[🔗 View Full Interactive Web Report & Badge on WishlistDoc](${audit.reportUrl})`,
        ``,
        `---`,
        `### 📊 6-Dimension Algorithmic Breakdown:`,
        `- **🏷️ ${audit.dimensions.tagAccuracy.label}:** ${audit.dimensions.tagAccuracy.score}/100 [${audit.dimensions.tagAccuracy.status.toUpperCase()}]`,
        `  > ${audit.dimensions.tagAccuracy.summary}`,
        `- **🌐 ${audit.dimensions.localization.label}:** ${audit.dimensions.localization.score}/100 [${audit.dimensions.localization.status.toUpperCase()}]`,
        `  > ${audit.dimensions.localization.summary}`,
        `- **💰 ${audit.dimensions.pricing.label}:** ${audit.dimensions.pricing.score}/100 [${audit.dimensions.pricing.status.toUpperCase()}]`,
        `  > ${audit.dimensions.pricing.summary}`,
        `- **🎮 ${audit.dimensions.demoStatus.label}:** ${audit.dimensions.demoStatus.score}/100 [${audit.dimensions.demoStatus.status.toUpperCase()}]`,
        `  > ${audit.dimensions.demoStatus.summary}`,
        `- **🖼️ ${audit.dimensions.visualAssets.label}:** ${audit.dimensions.visualAssets.score}/100 [${audit.dimensions.visualAssets.status.toUpperCase()}]`,
        `  > ${audit.dimensions.visualAssets.summary}`,
        `- **📝 ${audit.dimensions.shortDescription.label}:** ${audit.dimensions.shortDescription.score}/100 [${audit.dimensions.shortDescription.status.toUpperCase()}]`,
        `  > ${audit.dimensions.shortDescription.summary}`,
        ``,
        `---`,
        `### 🎯 Prioritized Action Prescriptions:`,
        ...audit.prescriptions.map(
          (p, i) =>
            `${i + 1}. **[${p.priority.toUpperCase()}] ${p.title}**\n   - **Impact:** ${p.impactLabel} (${p.expectedScoreBoost})\n   - **Rationale:** ${p.reason}\n   - **Next Steps:**\n${p.executionSteps.map((s) => `     * ${s}`).join('\n')}`
        ),
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: markdown,
          },
        ],
      };
    }

    if (name === 'predict_sales_cone') {
      const appid = Number(args?.appid);
      if (!appid || isNaN(appid)) {
        throw new McpError(ErrorCode.InvalidParams, 'A valid numeric "appid" is required.');
      }

      const wishlists = args?.wishlists ? Number(args.wishlists) : undefined;
      const customPriceUSD = args?.customPriceUSD ? Number(args.customPriceUSD) : undefined;

      const app = await fetchSteamApp(appid);
      const prediction = runSalesConePrediction(app, wishlists, customPriceUSD);

      const markdown = [
        `# 📈 WishlistDoc Sales Cone Prediction: ${prediction.name} (AppID: ${prediction.appid})`,
        ``,
        `**Effective Pre-Launch Wishlist Base:** ${prediction.baseEffectiveWishlists.toLocaleString()} wishlists`,
        `**Simulated Unit Price:** $${prediction.estimatedPriceUSD.toFixed(2)} USD`,
        `**Genre Anchor:** ${prediction.detectedGenre} (Baseline conversion: ${(prediction.baseConversionRate * 100).toFixed(1)}%)`,
        `**Algorithmic Store Multiplier:** ${prediction.totalMultiplier}x`,
        ``,
        `[🔗 View Live Projection Chart on WishlistDoc](${prediction.reportUrl})`,
        ``,
        `---`,
        `### 🎯 Launch Cone Confidence Intervals:`,
        ``,
        `| Scenario | W1 Conversion | First-Week Sales (Units) | Year-1 Gross Revenue | Scenario Description |`,
        `| :--- | :--- | :--- | :--- | :--- |`,
        `| **P10 (Pessimistic Floor)** | ${prediction.p10_pessimistic.conversionRatePercent}% | **${prediction.p10_pessimistic.firstWeekSales.toLocaleString()} units** | **$${prediction.p10_pessimistic.year1GrossRevenue.toLocaleString()}** | ${prediction.p10_pessimistic.confidenceDescription} |`,
        `| **P50 (Median Benchmark)** | ${prediction.p50_median.conversionRatePercent}% | **${prediction.p50_median.firstWeekSales.toLocaleString()} units** | **$${prediction.p50_median.year1GrossRevenue.toLocaleString()}** | ${prediction.p50_median.confidenceDescription} |`,
        `| **P90 (Breakout Ceiling)** | ${prediction.p90_optimistic.conversionRatePercent}% | **${prediction.p90_optimistic.firstWeekSales.toLocaleString()} units** | **$${prediction.p90_optimistic.year1GrossRevenue.toLocaleString()}** | ${prediction.p90_optimistic.confidenceDescription} |`,
        ``,
        `---`,
        `### 🔬 Empirical Multiplier Breakdown:`,
        `- **Localization:** ${prediction.multipliers.localization}x`,
        `- **Demo Loop:** ${prediction.multipliers.demo}x`,
        `- **Pricing Friction:** ${prediction.multipliers.price}x`,
        `- **Visual Impact:** ${prediction.multipliers.visuals}x`,
        `- **Year-1 Lifetime Multiplier:** ${prediction.year1Multiplier}x (First-week sales × ${prediction.year1Multiplier} = Year-1 sales)`,
        ``,
        `*Methodology: ${prediction.empiricalMethodology}*`,
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: markdown,
          },
        ],
      };
    }

    if (name === 'get_genre_benchmarks') {
      const genre = args?.genre as string | undefined;
      const benchmarkData = getGenreBenchmark(genre);

      const markdown = [
        `# 📊 WishlistDoc Steam Industry Genre Benchmarks`,
        ``,
        `Data derived from GameDiscoverCo, Steamworks empirical datasets, and WishlistDoc pre-launch cohorts.`,
        `[🔗 Explore Full Interactive Benchmark Calculator](https://wishlistdoc.com/benchmarks)`,
        ``,
        `\`\`\`json`,
        JSON.stringify(benchmarkData, null, 2),
        `\`\`\``,
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: markdown,
          },
        ],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `❌ WishlistDoc MCP Error: ${error.message || String(error)}`,
        },
      ],
    };
  }
});

// Start server on stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WishlistDoc MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error starting WishlistDoc MCP server:', err);
  process.exit(1);
});
