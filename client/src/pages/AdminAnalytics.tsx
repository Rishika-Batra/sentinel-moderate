import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, Clock, Target, ArrowLeft } from 'lucide-react';

const COLORS = ['#5B8DEF', '#34D399', '#FBBF24', '#F87171', '#9CA6B8', '#6B7280'];

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

  if (loading) return <div className="text-ts-text-muted text-sm pt-8">Loading analytics...</div>;
  if (!data) return <div className="text-red-400 text-sm pt-8">Failed to load data.</div>;

  const { totalPosts, volumeTrend, categoryBreakdown, aiAccuracy, avgReviewTimeHours } = data;

  const pieData = categoryBreakdown.map((item: any) => ({
    name: item._id,
    value: item.count
  }));

  const lineData = volumeTrend.map((item: any) => ({
    date: item._id,
    posts: item.count
  }));

  // Custom tooltips to match dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ts-input-bg border border-ts-border p-3 rounded-lg shadow-lg">
          <p className="text-ts-text-main font-medium mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <header className="mb-8 border-b border-ts-border pb-6">
        <button onClick={() => navigate('/admin/queue')} className="flex items-center text-ts-accent hover:text-white mb-4 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Queue
        </button>
        <h1 className="text-2xl font-semibold mb-2">Platform Analytics</h1>
        <p className="text-sm text-ts-text-muted">Real-time insights into content moderation performance.</p>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="ts-card p-6 flex flex-col justify-center items-center text-center animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
          <Target className="w-8 h-8 text-status-clean mb-3" />
          <h2 className="ts-label !mb-1 text-ts-text-muted">AI Accuracy Rate</h2>
          <p className="text-4xl font-semibold text-ts-text-main mt-1">{aiAccuracy ? aiAccuracy.toFixed(1) : 0}%</p>
          <p className="text-xs text-ts-text-placeholder mt-2">Agreement between Human & AI</p>
        </div>

        <div className="ts-card p-6 flex flex-col justify-center items-center text-center animate-fade-slide-up" style={{ animationDelay: '50ms' }}>
          <Activity className="w-8 h-8 text-ts-accent mb-3" />
          <h2 className="ts-label !mb-1 text-ts-text-muted">Total Processed</h2>
          <p className="text-4xl font-semibold text-ts-text-main mt-1">{totalPosts}</p>
          <p className="text-xs text-ts-text-placeholder mt-2">All-time posts scanned</p>
        </div>

        <div className="ts-card p-6 flex flex-col justify-center items-center text-center animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
          <Clock className="w-8 h-8 text-status-review mb-3" />
          <h2 className="ts-label !mb-1 text-ts-text-muted">Avg Review Time</h2>
          <p className="text-4xl font-semibold text-ts-text-main mt-1">{avgReviewTimeHours ? avgReviewTimeHours.toFixed(1) : 0}h</p>
          <p className="text-xs text-ts-text-placeholder mt-2">Time from creation to resolution</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="ts-card p-6 col-span-2 animate-fade-slide-up" style={{ animationDelay: '150ms' }}>
          <h3 className="text-lg font-semibold text-ts-text-main mb-6">Moderation Volume (Last 30 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232B42" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9CA6B8'}} axisLine={{ stroke: '#232B42' }} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#9CA6B8'}} axisLine={{ stroke: '#232B42' }} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="posts" stroke="#5B8DEF" strokeWidth={3} activeDot={{ r: 6, fill: '#5B8DEF', stroke: '#131826', strokeWidth: 2 }} name="Posts Processed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ts-card p-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-ts-text-main mb-6">Violation Categories</h3>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-ts-text-muted border border-dashed border-ts-border rounded-lg">No category data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
