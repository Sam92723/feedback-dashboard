// Cloudflare Worker - Feedback Intelligence API
// src/index.js

function calculatePriorityScore(urgency, impact, frequency) {
  return Math.round((urgency * 0.4 + impact * 0.4 + frequency * 0.2) * 10) / 10;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // REMOVE TRAILING SLASHES (Fixes the "Not Found" issue)
    const path = url.pathname.replace(/\/$/, '');

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (path === '/api/feedback' && request.method === 'POST') return handleFeedbackIngest(request, env);
      if (path === '/api/summary' && request.method === 'GET') return handleSummary(request, env);
      if (path === '/api/insights' && request.method === 'GET') return handleInsights(request, env);
      if (path === '/api/ask' && request.method === 'POST') return handleAIQuery(request, env);
      // Allow both POST and GET for seeding
      if (path === '/api/seed') return handleSeedData(env);

      // *** Serve Frontend ***
      // If no API matched, try to serve the file from the 'dist' folder
      return env.ASSETS.fetch(request);

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};

// --- Helper Functions ---

async function handleSeedData(env) {
  const mockData = [
    { source: 'GitHub', team: 'engineering', message: 'Workers AI latency high', theme: 'performance', sentiment: 'negative', region: 'EU', created_at: new Date().toISOString(), urgency: 8, impact: 9, frequency: 3, status: 'open', days_open: 1 },
    { source: 'Support', team: 'sales', message: 'Need better pricing', theme: 'pricing', sentiment: 'neutral', region: 'US', created_at: new Date().toISOString(), urgency: 5, impact: 7, frequency: 1, status: 'open', days_open: 2 },
    { source: 'Twitter', team: 'marketing', message: 'Love the new UI', theme: 'ui', sentiment: 'positive', region: 'Global', created_at: new Date().toISOString(), urgency: 2, impact: 3, frequency: 1, status: 'resolved', days_open: 0 }
  ];

  try {
    for (const item of mockData) {
      await env.DB.prepare(`
        INSERT INTO feedback (source, team, message, theme, sentiment, region, created_at, urgency, impact, frequency, status, days_open)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.source, item.team, item.message, item.theme, item.sentiment,
        item.region, item.created_at, item.urgency, item.impact, item.frequency,
        item.status, item.days_open
      ).run();
    }
    return new Response(JSON.stringify({ success: true, message: "Seeded!" }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Database Error: " + err.message }), { status: 500, headers: corsHeaders });
  }
}

async function handleFeedbackIngest(request, env) {
  const data = await request.json();
  await env.DB.prepare(`INSERT INTO feedback (source, team, message, theme, sentiment, region, created_at, urgency, impact, frequency, status, days_open) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(data.source, data.team, data.message, data.theme, data.sentiment, data.region, data.created_at || new Date().toISOString(), data.urgency, data.impact || 5, data.frequency || 1, data.status || 'open', data.days_open || 0).run();
  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
}

async function handleSummary(request, env) {
  const { results } = await env.DB.prepare("SELECT * FROM feedback").all();
  return new Response(JSON.stringify(results), { headers: corsHeaders });
}

async function handleInsights(request, env) {
  return new Response(JSON.stringify({ insights: [] }), { headers: corsHeaders });
}

async function handleAIQuery(request, env) {
  return new Response(JSON.stringify({ answer: "AI not yet configured" }), { headers: corsHeaders });
}