'use client';

import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend,
  CartesianGrid, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';

const COLORS = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

interface PerformanceChartsProps {
  data: {
    postingPattern?: any[];
    contentTypes?: any[];
    engagementTrend?: any[];
    bestTimes?: any[];
    stats?: {
      avgEngagement: number;
      trendPercentage: number;
      totalPosts: number;
      peakDay: string;
      peakTime: string;
    };
  };
}

export function PerformanceCharts({ data }: PerformanceChartsProps) {
  // Debug logging
  console.log('[PerformanceCharts] Received data:', {
    hasData: !!data,
    hasPostingPattern: !!data?.postingPattern,
    postingPatternLength: data?.postingPattern?.length,
    hasContentTypes: !!data?.contentTypes,
    contentTypesLength: data?.contentTypes?.length,
    stats: data?.stats
  });

  // Use provided data or fallback to realistic mock data
  const postingPattern = data?.postingPattern || [
    { day: 'Mon', posts: 4, engagement: 245000 },
    { day: 'Tue', posts: 6, engagement: 310000 },
    { day: 'Wed', posts: 5, engagement: 280000 },
    { day: 'Thu', posts: 7, engagement: 325000 },
    { day: 'Fri', posts: 3, engagement: 190000 },
    { day: 'Sat', posts: 2, engagement: 150000 },
    { day: 'Sun', posts: 4, engagement: 220000 },
  ];

  const contentTypes = data?.contentTypes || [
    { name: 'Photos', value: 65, count: 20200, engagement: 285000 },
    { name: 'Videos', value: 25, count: 7750, engagement: 420000 },
    { name: 'Carousels', value: 8, count: 2480, engagement: 310000 },
    { name: 'Reels', value: 2, count: 620, engagement: 580000 },
  ];

  const engagementTrend = data?.engagementTrend || [
    { week: 'Week 1', engagement: 245000, posts: 12 },
    { week: 'Week 2', engagement: 280000, posts: 15 },
    { week: 'Week 3', engagement: 310000, posts: 14 },
    { week: 'Week 4', engagement: 295000, posts: 13 },
  ];

  const bestTimes = data?.bestTimes || [
    { time: '6-9 AM', posts: 8, engagement: 180000 },
    { time: '9-12 PM', posts: 12, engagement: 290000 },
    { time: '12-3 PM', posts: 10, engagement: 310000 },
    { time: '3-6 PM', posts: 15, engagement: 340000 },
    { time: '6-9 PM', posts: 9, engagement: 250000 },
    { time: '9-12 AM', posts: 5, engagement: 150000 },
  ];

  const stats = data?.stats || {
    avgEngagement: 282500,
    trendPercentage: 12,
    totalPosts: 31000,
    peakDay: 'Thursday',
    peakTime: '3-6 PM'
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Avg Engagement</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(stats.avgEngagement)}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+{stats.trendPercentage}% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-pink-400" />
            <span className="text-sm text-gray-400">Total Posts</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(stats.totalPosts)}</div>
          <div className="text-sm text-gray-400 mt-1">All time content</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Peak Day</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.peakDay}</div>
          <div className="text-sm text-gray-400 mt-1">Best posting day</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Peak Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.peakTime}</div>
          <div className="text-sm text-gray-400 mt-1">Highest engagement</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posting Pattern */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Posting Pattern by Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postingPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'posts' ? `${value} posts` : formatNumber(value),
                  name === 'posts' ? 'Posts' : 'Avg Engagement'
                ]}
              />
              <Bar dataKey="posts" fill="#9333ea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Peak posting: {stats.peakDay} ({postingPattern.find(d => d.day === stats.peakDay.slice(0, 3))?.posts || 7} posts)
          </p>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span>
            Content Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={contentTypes}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {contentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string, props: any) => [
                  `${value}% (${props.payload.count.toLocaleString()} posts)`,
                  props.payload.name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {contentTypes.map((type, i) => (
              <div key={type.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span className="text-gray-300">{type.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{type.count.toLocaleString()} posts</span>
                  {type.engagement && (
                    <span className="text-purple-400 text-xs">
                      {formatNumber(type.engagement)} avg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Posting Times */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-400" />
            Best Posting Times
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bestTimes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                type="category" 
                dataKey="time" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [formatNumber(value), 'Avg Engagement']}
              />
              <Bar dataKey="engagement" fill="#ec4899" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            Optimal time: {stats.peakTime} for maximum reach
          </p>
        </div>

        {/* Engagement Trend */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Engagement Trend (Last 4 Weeks)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={engagementTrend}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [formatNumber(value), 'Avg Engagement']}
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEngagement)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-between text-sm">
            <p className="text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Average: {formatNumber(stats.avgEngagement)}
            </p>
            <p className="text-green-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{stats.trendPercentage}% growth
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">✨</span>
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-purple-400 font-medium mb-1">Best Performing Type</div>
            <div className="text-white text-sm">
              {contentTypes.sort((a, b) => (b.engagement || 0) - (a.engagement || 0))[0].name} get{' '}
              {formatNumber(contentTypes.sort((a, b) => (b.engagement || 0) - (a.engagement || 0))[0].engagement || 0)} avg engagement
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-pink-400 font-medium mb-1">Posting Consistency</div>
            <div className="text-white text-sm">
              {postingPattern.reduce((sum, d) => sum + d.posts, 0)} posts per week • Very active
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-blue-400 font-medium mb-1">Growth Trajectory</div>
            <div className="text-white text-sm">
              Trending upward • +{stats.trendPercentage}% engagement increase
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


