import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, Clock, Target, ArrowLeft } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  clean: '#34D399',
  review: '#FBBF24',
  needs_review: '#FBBF24',
  flagged: '#F87171',
  pending: '#6B7280',
};

const FALLBACK_COLORS = ['#34D399', '#FBBF24', '#F87171', '#6B7280', '#2DD4BF'];

const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin/login');
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) return <div className="text-ts-textMuted text-sm py-8">Loading analytics...</div>;
  if (!data) return <div className="text-red-400 text-sm py-8">Failed to load data.</div>;

  const { totalPosts, volumeTrend, categoryBreakdown, aiAccuracy, avgReviewTimeHours } = data;

  const pieData = categoryBreakdown.map((item: any) => ({
    name: item._id,
    value: item.count
  }));

  const lineData = volumeTrend.map((item: any) => ({
    date: item._id,
    posts: item.count
  }));

  // Custom tooltips matching ts.surface & ts.border
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ts-surface border border-ts-border p-3 rounded-lg">
          <p className="text-ts-textMain font-semibold text-xs mb-1">
            {label ? String(label).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''}
          </p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs font-medium" style={{ color: p.color || '#2DD4BF' }}>
              {p.name}: <span className="text-ts-textMain font-semibold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Legend with colored dots and formatted readable labels
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4 text-xs">
        {payload.map((entry: any, index: number) => {
          const rawLabel = entry.value || '';
          const formattedLabel = rawLabel
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          return (
            <li key={`legend-${index}`} className="flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-ts-textMuted font-medium">{formattedLabel}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-full">
      <header className="mb-8 border-b border-ts-border pb-6">
        <button 
          onClick={() => navigate('/admin/queue')} 
          className="flex items-center text-ts-accent hover:text-white mb-4 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Queue
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-ts-textMain mb-1">Platform Analytics</h1>
        <p className="text-sm text-ts-textMuted">Real-time insights into content moderation performance and category metrics.</p>
      </header>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="ts-card p-5 flex flex-col justify-between items-start animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[11px] font-medium text-ts-textMuted uppercase tracking-wider">AI Accuracy Rate</span>
            <Target className="w-5 h-5 text-status-clean" />
          </div>
          <div className="text-3xl font-bold text-ts-textMain tracking-tight">
            {aiAccuracy ? aiAccuracy.toFixed(1) : 0}%
          </div>
          <p className="text-xs text-ts-textPlaceholder mt-2">Agreement between Human & AI decisions</p>
        </div>

        <div className="ts-card p-5 flex flex-col justify-between items-start animate-fade-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[11px] font-medium text-ts-textMuted uppercase tracking-wider">Total Processed</span>
            <Activity className="w-5 h-5 text-ts-accent" />
          </div>
          <div className="text-3xl font-bold text-ts-accent tracking-tight">
            {totalPosts}
          </div>
          <p className="text-xs text-ts-textPlaceholder mt-2">All-time posts scanned by system</p>
        </div>

        <div className="ts-card p-5 flex flex-col justify-between items-start animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[11px] font-medium text-ts-textMuted uppercase tracking-wider">Avg Review Time</span>
            <Clock className="w-5 h-5 text-status-review" />
          </div>
          <div className="text-3xl font-bold text-ts-textMain tracking-tight">
            {avgReviewTimeHours ? avgReviewTimeHours.toFixed(1) : 0}h
          </div>
          <p className="text-xs text-ts-textPlaceholder mt-2">Time from creation to queue resolution</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="ts-card p-5 col-span-2 animate-fade-slide-up" style={{ animationDelay: '150ms' }}>
          <h3 className="text-base font-semibold text-ts-textMain mb-6">Moderation Volume (Last 30 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232B42" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA6B8' }} axisLine={{ stroke: '#232B42' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA6B8' }} axisLine={{ stroke: '#232B42' }} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '16px' }} content={renderCustomLegend} />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#2DD4BF" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6, fill: '#2DD4BF', stroke: '#131826', strokeWidth: 2 }} 
                  name="Posts Processed" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ts-card p-5 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-base font-semibold text-ts-textMain mb-6">Violation Categories</h3>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry: any, index: number) => {
                      const key = entry.name?.toLowerCase() || '';
                      const fillColor = STATUS_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '16px' }} content={renderCustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-ts-textMuted text-xs border border-dashed border-ts-border rounded-lg">
                No category data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
