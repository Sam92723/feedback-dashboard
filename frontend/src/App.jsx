import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Send, Sparkles, Download, Bell, Search, Filter, Calendar, CheckCircle, Clock, X } from 'lucide-react';

// Mock feedback data with enhanced attributes
const allFeedbackData = [
  { id: 1, team: 'engineering', message: 'Workers AI responses taking 3-5 seconds in production', theme: 'performance', sentiment: 'negative', source: 'GitHub', timestamp: '2026-01-19T10:30:00', urgency: 8, impact: 9, frequency: 3, region: 'EU', status: 'open', daysOpen: 1 },
  { id: 2, team: 'engineering', message: 'Workers AI slow on image generation requests', theme: 'performance', sentiment: 'negative', source: 'Discord', timestamp: '2026-01-19T11:15:00', urgency: 7, impact: 7, frequency: 3, region: 'EU', status: 'open', daysOpen: 1 },
  { id: 3, team: 'engineering', message: 'AI latency causing timeout errors for customers', theme: 'performance', sentiment: 'negative', source: 'Support', timestamp: '2026-01-19T14:00:00', urgency: 9, impact: 10, frequency: 3, region: 'EU', status: 'open', daysOpen: 1 },
  { id: 4, team: 'sales', message: 'Lost enterprise deal - competitor has better rate limits', theme: 'pricing', sentiment: 'negative', source: 'Email', timestamp: '2026-01-19T09:15:00', urgency: 8, impact: 9, frequency: 1, region: 'US', status: 'open', daysOpen: 1 },
  { id: 5, team: 'engineering', message: 'D1 query builder docs missing transaction examples', theme: 'docs', sentiment: 'neutral', source: 'GitHub', timestamp: '2026-01-19T12:00:00', urgency: 4, impact: 5, frequency: 1, region: 'Global', status: 'open', daysOpen: 1 },
  { id: 6, team: 'sales', message: 'Customer asking about SOC2 compliance timeline', theme: 'compliance', sentiment: 'neutral', source: 'Support', timestamp: '2026-01-19T13:30:00', urgency: 6, impact: 7, frequency: 1, region: 'US', status: 'open', daysOpen: 1 },
  { id: 7, team: 'pm', message: 'New dashboard analytics are exactly what we needed!', theme: 'ui', sentiment: 'positive', source: 'Twitter', timestamp: '2026-01-19T15:00:00', urgency: 2, impact: 3, frequency: 1, region: 'Global', status: 'resolved', daysOpen: 0 },
  { id: 8, team: 'engineering', message: 'Durable Objects migration guide is comprehensive', theme: 'docs', sentiment: 'positive', source: 'Discord', timestamp: '2026-01-19T16:00:00', urgency: 1, impact: 2, frequency: 1, region: 'Global', status: 'resolved', daysOpen: 0 },
  { id: 9, team: 'sales', message: 'Need multi-region failover for Fortune 500 prospect', theme: 'feature', sentiment: 'neutral', source: 'Email', timestamp: '2026-01-19T16:45:00', urgency: 7, impact: 8, frequency: 1, region: 'US', status: 'open', daysOpen: 1 },
  { id: 10, team: 'engineering', message: 'KV throwing intermittent 500 errors in EU region', theme: 'reliability', sentiment: 'negative', source: 'GitHub', timestamp: '2026-01-18T22:00:00', urgency: 8, impact: 9, frequency: 2, region: 'EU', status: 'open', daysOpen: 2 },
  { id: 11, team: 'engineering', message: 'KV errors still happening after patch', theme: 'reliability', sentiment: 'negative', source: 'Discord', timestamp: '2026-01-19T08:00:00', urgency: 9, impact: 9, frequency: 2, region: 'EU', status: 'open', daysOpen: 1 },
  { id: 12, team: 'sales', message: 'Pricing page unclear on Workers AI token costs', theme: 'pricing', sentiment: 'negative', source: 'Support', timestamp: '2026-01-19T11:00:00', urgency: 5, impact: 6, frequency: 1, region: 'Global', status: 'open', daysOpen: 1 },
  { id: 13, team: 'engineering', message: 'CDN cache purge taking longer than expected', theme: 'performance', sentiment: 'neutral', source: 'GitHub', timestamp: '2026-01-12T14:00:00', urgency: 5, impact: 6, frequency: 1, region: 'APAC', status: 'open', daysOpen: 8 },
  { id: 14, team: 'support', message: 'Customer confused by billing dashboard UI', theme: 'ui', sentiment: 'negative', source: 'Support', timestamp: '2026-01-10T09:00:00', urgency: 4, impact: 5, frequency: 1, region: 'US', status: 'open', daysOpen: 10 },
  { id: 15, team: 'marketing', message: 'Blog post about new features got great engagement', theme: 'content', sentiment: 'positive', source: 'Twitter', timestamp: '2026-01-18T10:00:00', urgency: 1, impact: 3, frequency: 1, region: 'Global', status: 'resolved', daysOpen: 0 },
];

const lastWeekBaseline = {
  performance: 1, reliability: 1, pricing: 2, docs: 3, feature: 1, ui: 2, compliance: 0, content: 1
};

const Dashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter data by time range
  const getFilteredByTimeRange = () => {
    const now = new Date('2026-01-19T17:00:00');
    const cutoffDays = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const cutoff = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
    
    return allFeedbackData.filter(item => new Date(item.timestamp) >= cutoff);
  };

  // Apply all filters
  const currentData = useMemo(() => {
    let filtered = getFilteredByTimeRange();
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.theme.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterSource !== 'all') {
      filtered = filtered.filter(item => item.source === filterSource);
    }
    
    if (filterTheme !== 'all') {
      filtered = filtered.filter(item => item.theme === filterTheme);
    }
    
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment === filterSentiment);
    }
    
    return filtered;
  }, [timeRange, searchQuery, filterSource, filterTheme, filterSentiment]);

  // Calculate priority score
  const calculatePriorityScore = (item) => {
    return Math.round((item.urgency * 0.4 + item.impact * 0.4 + item.frequency * 0.2));
  };

  // Theme data with WoW comparison
  const themeData = Object.entries(
    currentData.reduce((acc, item) => {
      acc[item.theme] = (acc[item.theme] || 0) + 1;
      return acc;
    }, {})
  ).map(([theme, count]) => {
    const lastWeekCount = lastWeekBaseline[theme] || 0;
    const delta = count - lastWeekCount;
    return { theme, count, delta, lastWeek: lastWeekCount };
  }).sort((a, b) => b.count - a.count);

  // Team distribution
  const teamData = Object.entries(
    currentData.reduce((acc, item) => {
      acc[item.team] = (acc[item.team] || 0) + 1;
      return acc;
    }, {})
  ).map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);

  // Source breakdown
  const sourceData = Object.entries(
    currentData.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {})
  ).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

  // Sentiment data
  const sentimentData = Object.entries(
    currentData.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {})
  ).map(([sentiment, count]) => ({ sentiment, count }));

  // Trend data
  const trendData = Object.entries(
    currentData.reduce((acc, item) => {
      const date = item.timestamp.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {})
  ).map(([date, count]) => ({ date: date.slice(5), count })).sort((a, b) => a.date.localeCompare(b.date));

  // Correlation insights
  const correlationInsights = useMemo(() => {
    const insights = [];
    
    // EU region + performance correlation
    const euPerformance = currentData.filter(i => i.region === 'EU' && (i.theme === 'performance' || i.theme === 'reliability')).length;
    if (euPerformance >= 3) {
      insights.push({
        title: 'EU Region Correlation',
        description: `${euPerformance} performance/reliability issues traced to EU region`,
        severity: 'high',
        colorClass: 'border-orange-500'
      });
    }
    
    // Unresolved items
    const unresolved7Days = currentData.filter(i => i.status === 'open' && i.daysOpen >= 7).length;
    if (unresolved7Days > 0) {
      insights.push({
        title: 'Stale Issues',
        description: `${unresolved7Days} issues unresolved for >7 days`,
        severity: 'medium',
        colorClass: 'border-blue-500'
      });
    }
    
    return insights;
  }, [currentData]);

  // Notifications with timestamps
  const notifications = useMemo(() => {
    const highPriority = currentData.filter(i => calculatePriorityScore(i) >= 8 && i.daysOpen <= 1);
    const now = new Date();
    return [
      { 
        id: 1, 
        message: `${highPriority.length} new high-priority items since your last visit`, 
        type: 'alert',
        time: new Date(now - 5 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      },
      { 
        id: 2, 
        message: 'Performance theme spiked 200% this week', 
        type: 'trend',
        time: new Date(now - 15 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      },
      { 
        id: 3, 
        message: '3 issues correlate with EU region infrastructure', 
        type: 'insight',
        time: new Date(now - 30 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }
    ];
  }, [currentData]);

  // Calculate priority scores with performance optimization
  const highPriorityItems = useMemo(() => {
    return currentData
      .map(item => ({
        ...item,
        priorityScore: calculatePriorityScore(item) || 0
      }))
      .filter(item => item.priorityScore >= 7)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 6);
  }, [currentData]);

  // Actionable metrics
  const unresolvedCount = useMemo(() => 
    currentData.filter(i => i.status === 'open' && i.daysOpen >= 7).length,
    [currentData]
  );
  
  const avgResolutionTime = useMemo(() => {
    const resolved = currentData.filter(i => i.status === 'resolved');
    return resolved.length > 0 
      ? Math.round(resolved.reduce((acc, i) => acc + i.daysOpen, 0) / resolved.length * 10) / 10
      : 0;
  }, [currentData]);

  // Export functionality
  const handleExport = (format) => {
    const exportData = currentData.map(item => ({
      Date: item.timestamp.split('T')[0],
      Team: item.team,
      Theme: item.theme,
      Sentiment: item.sentiment,
      Source: item.source,
      Message: item.message,
      'Priority Score': calculatePriorityScore(item),
      Status: item.status,
      'Days Open': item.daysOpen
    }));

    if (format === 'csv') {
      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-report-${timeRange}.csv`;
      a.click();
    } else {
      alert('PDF export would be implemented with a library like jsPDF');
    }
  };

  // AI response generator
  const generateAIResponse = (team, question) => {
    const responses = {
      engineering: `**Engineering Team Analysis:**

Based on current feedback patterns, performance issues are your top priority. I'm detecting a cluster of 3 latency reports (Workers AI + KV) all originating from the EU region within a 16-hour window.

**Priority Score Breakdown:**
• Workers AI latency (Priority: 9.0/10)
• KV 500 errors (Priority: 8.8/10)
• D1 docs gap (Priority: 4.4/10)

**Correlation Found:**
Timeline analysis shows KV errors (Jan 18, 22:00 UTC) preceded Workers AI issues (Jan 19, 10:30 UTC) by 16 hours. Both subsystems share EU edge infrastructure.

**Suggested Investigation:**
Check EU PoP health metrics, resource contention, and recent deployments in that region.`,

      sales: `**Sales Team Intelligence:**

I've identified 4 revenue-impacting signals with varying priority levels:

**High Priority (>7.0):**
• Lost enterprise deal - rate limits (Priority: 8.4/10)
• Multi-region failover request (Priority: 7.4/10)

**Medium Priority:**
• Pricing page clarity (Priority: 5.4/10)
• SOC2 compliance inquiry (Priority: 6.4/10)

**Pattern:** Pricing concerns mentioned across multiple channels (Email + Support) within 2 hours suggests systematic communication gap.`,

      pm: `**Product Intelligence Summary:**

**Top Priorities by Score:**
1. Workers AI latency (9.0) - Engineering + EU region correlation
2. KV reliability (8.8) - Recurring issue, customer impact
3. Enterprise deal blocker (8.4) - Sales + competitive pressure

**Cross-Team Dependencies:**
Sales is blocked by 2 engineering issues (rate limits, multi-region failover). Consider expediting engineering roadmap items with direct revenue impact.

**Trend Alert:** Performance theme increased 200% WoW. Recommend blocking next sprint for infrastructure deep-dive.`,

      support: `**Customer Support Insights:**

**High-Impact Issues:**
• Performance complaints (3 reports) causing customer timeout errors
• UI confusion on billing dashboard (10 days unresolved)

**Volume Patterns:**
Majority of negative feedback (58%) requires engineering intervention. Support is blocked on technical fixes.

**Quick Wins:**
Documentation improvements receiving positive feedback - consider expanding this effort.`,

      marketing: `**Marketing & Perception Analysis:**

**Positive Signals:**
• Dashboard redesign getting positive mentions on Twitter
• Documentation content well-received

**Concerns:**
• Pricing page clarity affecting customer conversations
• Performance issues may impact product perception if unresolved

**Recommendation:**
Hold major feature announcements until performance issues resolved to maintain credibility.`,

      design: `**UI/UX Feedback Summary:**

**Current Issues:**
• Billing dashboard UI causing customer confusion (Priority: 4.6/10)
• Workers AI model selection interface mentioned as confusing

**Positive Feedback:**
• New dashboard analytics design praised by users

**Opportunities:**
Focus on consistency across product - billing UI needs alignment with new dashboard patterns.`,

      all: `**Cross-Functional Intelligence Summary:**

**Critical Patterns:**
1. Performance cluster (3 reports) - Engineering priority, EU region focus
2. Revenue blockers (2 items) - Sales + Engineering dependency
3. Documentation gaps - Quick wins available

**Team Load:**
• Engineering: 7 high-priority items
• Sales: 4 revenue-impacting issues
• Support: Blocked on 2 technical fixes

**Strategic Recommendation:**
Address EU performance issues to unblock both engineering reliability and sales confidence. Documentation improvements show high ROI.`
    };

    return responses[team] || responses.all;
  };

  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const response = generateAIResponse(selectedTeam, aiQuestion);
      setAiResponse(response);
      setAiQuestion(''); // Clear after submission
      setIsLoading(false);
    }, 1200);
  };

  const COLORS = {
    positive: '#60a5fa',  // blue-400
    neutral: '#fb923c',   // orange-400
    negative: '#f97316'   // orange-600
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback Intelligence</h1>
            <p className="text-gray-600 mt-1">Cloudflare Product Management Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            notif.type === 'alert' ? 'bg-orange-600' :
                            notif.type === 'trend' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button 
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  Export as CSV
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                >
                  Export as PDF
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">{currentData.length}</div>
              <div className="text-sm text-gray-500">feedback signals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">This Quarter</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Sources</option>
              <option value="GitHub">GitHub</option>
              <option value="Discord">Discord</option>
              <option value="Support">Support</option>
              <option value="Email">Email</option>
              <option value="Twitter">Twitter</option>
            </select>

            <select 
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Themes</option>
              <option value="performance">Performance</option>
              <option value="reliability">Reliability</option>
              <option value="pricing">Pricing</option>
              <option value="docs">Documentation</option>
              <option value="feature">Features</option>
              <option value="ui">UI/UX</option>
            </select>

            <select 
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {(searchQuery || filterSource !== 'all' || filterTheme !== 'all' || filterSentiment !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSource('all');
                setFilterTheme('all');
                setFilterSentiment('all');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Actionable Metrics Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Signals</div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{currentData.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              vs {getFilteredByTimeRange().length - currentData.length} filtered out
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Unresolved (&gt;7d)</div>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{unresolvedCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              Require attention
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Avg Resolution</div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{avgResolutionTime}d</div>
            <div className="text-xs text-gray-500 mt-1">
              Time to close
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">High Priority</div>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {currentData.filter(i => calculatePriorityScore(i) >= 8).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Score ≥8/10
            </div>
          </div>
        </div>

        {/* Correlation Insights */}
        {correlationInsights.length > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Correlation Insights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {correlationInsights.map((insight, idx) => (
                      <div key={idx} className={`bg-white border-l-4 ${insight.colorClass} p-3 rounded`}>
                        <div className="font-medium text-sm text-gray-900">{insight.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{insight.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Summary Row */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* Sentiment Chart */}
          <div className="col-span-1 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sentiment</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-3">
              {sentimentData.map(s => (
                <div key={s.sentiment} className="text-center">
                  <div className="text-xs text-gray-500 capitalize">{s.sentiment}</div>
                  <div className="text-lg font-bold text-gray-900">{s.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Breakdown with Sparklines */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Themes</h3>
            <div className="space-y-3">
              {themeData.slice(0, 5).map(item => (
                <div key={item.theme} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize text-gray-900">{item.theme}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{item.count}</span>
                        {item.delta !== 0 && (
                          <span className={`text-xs font-semibold flex items-center gap-1 ${
                            item.delta > 0 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(item.delta)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-600"
                        style={{ width: `${(item.count / Math.max(...themeData.map(t => t.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="col-span-1 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sources</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="count"
                  label={({ source, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f97316', '#fb923c', '#fdba74', '#93c5fd', '#60a5fa'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.source]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {sourceData.slice(0, 5).map((item, idx) => (
                <div key={item.source} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: ['#f97316', '#fb923c', '#fdba74', '#93c5fd', '#60a5fa'][idx % 5] }}
                  ></div>
                  <span className="text-xs text-gray-600">{item.source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Distribution */}
          <div className="col-span-1 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Teams</h3>
            <div className="space-y-3">
              {teamData.map((item, idx) => (
                <div key={item.team}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize text-gray-600">{item.team}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${['bg-orange-600', 'bg-orange-400', 'bg-orange-300', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300'][idx % 6]}`}
                      style={{ width: `${(item.count / Math.max(...teamData.map(t => t.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Insights + High Priority */}
          <div className="col-span-2 space-y-6">
            {/* Key Insights */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="space-y-4">
                <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Performance Cluster Detected</h4>
                    <span className="text-xs font-semibold text-orange-600 bg-white px-2 py-1 rounded">+200% WoW</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Workers AI latency reports spiked from 1 to 3 incidents. Timeline correlation with KV reliability issues in EU region suggests shared infrastructure concern.
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• 3 latency reports (GitHub, Discord, Support)</div>
                    <div>• KV 500 errors preceded AI issues by 16 hours</div>
                    <div>• Customer timeout errors escalated to support</div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 mb-2">Recurring Patterns</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Pricing clarity mentioned by both sales (lost deal) and support (customer inquiry) within 2 hours.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 mb-2">Positive Signals</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Documentation improvements receiving positive feedback. Durable Objects migration guide particularly well-received.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">High Priority Items (Score ≥7)</h3>
              <div className="space-y-3">
                {highPriorityItems.map(item => (
                  <div key={item.id} className="border-l-4 border-orange-600 bg-orange-50 p-4 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded">
                          Priority {item.priorityScore}/10
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600 capitalize">{item.team}</span>
                        {item.daysOpen >= 7 && (
                          <>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-orange-600 font-medium">{item.daysOpen}d open</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{item.source}</span>
                    </div>
                    <p className="text-sm text-gray-900">{item.message}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 capitalize">{item.theme}</span>
                      {item.region && (
                        <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">{item.region}</span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded text-white capitalize ${
                        item.sentiment === 'positive' ? 'bg-blue-500' :
                        item.sentiment === 'negative' ? 'bg-orange-600' :
                        'bg-orange-400'
                      }`}>{item.sentiment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Chat */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Context</label>
                <select 
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Teams</option>
                  <option value="engineering">Engineering</option>
                  <option value="sales">Sales</option>
                  <option value="pm">Product</option>
                  <option value="support">Customer Support</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                </select>
              </div>

              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs font-medium text-blue-900 mb-2">💡 Suggested Questions</div>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setAiQuestion("What are the top priorities for the engineering team?")}
                    className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1.5 rounded transition-colors"
                  >
                    What are the top priorities for the engineering team?
                  </button>
                  <button 
                    onClick={() => setAiQuestion("Why are we seeing a spike in performance complaints?")}
                    className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1.5 rounded transition-colors"
                  >
                    Why are we seeing a spike in performance complaints?
                  </button>
                  <button 
                    onClick={() => setAiQuestion("What blockers are preventing sales deals?")}
                    className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1.5 rounded transition-colors"
                  >
                    What blockers are preventing sales deals?
                  </button>
                  <button 
                    onClick={() => setAiQuestion("Which issues have been open longest?")}
                    className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1.5 rounded transition-colors"
                  >
                    Which issues have been open longest?
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ask a Question</label>
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAskAI())}
                  placeholder="What should the engineering team focus on?"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <button 
                onClick={handleAskAI}
                disabled={isLoading || !aiQuestion.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Ask AI
                  </>
                )}
              </button>

              {aiResponse && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <div className="text-sm text-gray-800 whitespace-pre-line">{aiResponse}</div>
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Powered by Workers AI
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;