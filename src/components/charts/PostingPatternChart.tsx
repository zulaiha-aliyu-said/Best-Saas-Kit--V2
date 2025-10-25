'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PostingDay } from '@/utils/competitorData';

interface PostingPatternChartProps {
  data: PostingDay[];
}

export function PostingPatternChart({ data }: PostingPatternChartProps) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  const chartData = data.map(item => ({
    ...item,
    isHighest: item.count === maxCount && maxCount > 0
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">📅 When They Post</h3>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Posts', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip 
              formatter={(value: any, name: string, props: any) => [
                `${value} posts (${props.payload.avgEngagement} avg engagement)`,
                'Posts'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#9333ea"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  fill={entry.isHighest ? 'url(#colorGradient)' : '#9333ea'}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {maxCount > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-900">
            💡 <span className="font-medium">Best day:</span>{' '}
            <span className="font-semibold">
              {data.find(d => d.count === maxCount)?.day}
            </span>{' '}
            with {maxCount} posts
          </p>
        </div>
      )}
    </div>
  );
}



















