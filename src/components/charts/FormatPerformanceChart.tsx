'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FormatPerformance } from '@/utils/competitorData';

interface FormatPerformanceChartProps {
  data: FormatPerformance[];
}

const COLORS = ['#9333ea', '#ec4899', '#3b82f6', '#10b981'];

export function FormatPerformanceChart({ data }: FormatPerformanceChartProps) {
  const maxEngagement = Math.max(...data.map(d => d.avgEngagement));
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  const chartData = sortedData.map(item => ({
    ...item,
    isBest: item.percentage === Math.max(...data.map(d => d.percentage)),
    isHighestEngagement: item.avgEngagement === maxEngagement
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">🎨 Content Types Performance</h3>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Usage %', position: 'insideBottom', fill: '#6b7280' }}
            />
            <YAxis 
              type="category" 
              dataKey="format" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              width={120}
            />
            <Tooltip 
              formatter={(value: any, name: string, props: any) => [
                `${value}% (${props.payload.count} posts, ${props.payload.avgEngagement} avg engagement)`,
                'Usage'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Bar 
              dataKey="percentage" 
              radius={[0, 8, 8, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={item.format} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-gray-700">{item.format}</span>
              {item.isBest && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">⭐ Most Used</span>}
              {item.isHighestEngagement && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">🔥 Highest Engagement</span>}
            </div>
            <span className="text-gray-500">{item.avgEngagement} avg engagement</span>
          </div>
        ))}
      </div>

      {maxEngagement > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-900">
            💡 <span className="font-medium">Insight:</span>{' '}
            {chartData.find(d => d.avgEngagement === maxEngagement)?.format} posts get highest engagement - try this format!
          </p>
        </div>
      )}
    </div>
  );
}












