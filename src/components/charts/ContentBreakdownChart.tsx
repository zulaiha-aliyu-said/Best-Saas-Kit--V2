'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ContentTopic } from '@/utils/competitorData';

interface ContentBreakdownChartProps {
  data: ContentTopic[];
}

const COLORS = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#6b7280'];

export function ContentBreakdownChart({ data }: ContentBreakdownChartProps) {
  const chartData = data.map(item => ({
    name: item.topic,
    value: item.percentage,
    count: item.postCount,
    engagement: item.avgEngagement
  }));

  const renderCustomLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">📈 What They Post About</h3>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: string, props: any) => [
                `${value}% (${props.payload.count} posts, ${props.payload.engagement} avg engagement)`,
                props.payload.name
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.topic} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-gray-700">{item.topic}</span>
            </div>
            <span className="text-gray-500">{item.postCount} posts</span>
          </div>
        ))}
      </div>

      {data.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-900">
            💡 <span className="font-medium">Insight:</span> Focus on{' '}
            <span className="font-semibold">{data[0].topic}</span> for highest engagement
          </p>
        </div>
      )}
    </div>
  );
}



