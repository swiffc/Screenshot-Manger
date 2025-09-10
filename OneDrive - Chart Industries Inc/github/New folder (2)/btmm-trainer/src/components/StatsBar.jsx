import React from 'react';
import { TrendingUp, Eye, BarChart3 } from 'lucide-react';

export default function StatsBar({ trades }) {
  const averagePips = React.useMemo(() => {
    if (!trades || trades.length === 0) return 0;
    const values = trades
      .map((t) => (t?.pips ? parseFloat(String(t.pips).replace(/[^-\d.]/g, '')) : NaN))
      .filter((n) => !Number.isNaN(n));
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length || 0);
  }, [trades]);

  const bestPattern = React.useMemo(() => {
    if (!trades || trades.length === 0) return 'N/A';
    const counts = trades.reduce((acc, t) => {
      const key = t?.patternType || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] || 'N/A';
  }, [trades]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-yellow-400">Winning Trades</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{trades?.length || 0}</p>
          </div>
          <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg border border-yellow-500/30 flex-shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-yellow-400">Average Pips</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{averagePips}</p>
          </div>
          <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg border border-yellow-500/30 flex-shrink-0">
            <BarChart3 className="h-6 w-6 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-yellow-400">Best Pattern</p>
            <p className="text-base sm:text-lg font-bold text-white truncate">{bestPattern}</p>
          </div>
          <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg border border-yellow-500/30 flex-shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-yellow-400">Pattern Recognition</p>
            <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
            <p className="text-xs text-yellow-300">Winners Only</p>
          </div>
          <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg border border-yellow-500/30 flex-shrink-0">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
}


