import React, { useState } from 'react';
import { 
  Thermometer, 
  TrendingUp, 
  Sun, 
  Droplets, 
  Wind, 
  Clock, 
  Utensils 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { time: '00:00', temp: 25.5 },
  { time: '04:00', temp: 25.2 },
  { time: '08:00', temp: 25.8 },
  { time: '12:00', temp: 26.5 },
  { time: '16:00', temp: 26.1 },
  { time: '20:00', temp: 25.9 },
  { time: '24:00', temp: 25.6 },
];

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [pumpActive, setPumpActive] = useState(true);
  const { user } = useAuth();

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-text-secondary text-sm">Real-time monitoring for <span className="text-white font-medium">Main Tank 01</span></p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Operational
        </div>
      </div>

      {/* Top Section: Hero Metric + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Metric Card (Temperature) */}
        <div className="lg:col-span-1 bg-card-dark border border-card-border rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Thermometer className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-5 h-5 text-text-secondary" />
              <h3 className="text-text-secondary font-medium">Water Temperature</h3>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-black text-white tracking-tighter">26.5</span>
              <span className="text-2xl font-medium text-text-secondary">°C</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+0.2% from last hour</span>
            </div>
          </div>
          <div className="relative z-10 mt-8">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Range</span>
              <span className="text-white">24°C - 28°C</span>
            </div>
            <div className="w-full bg-card-border rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-text-secondary mt-2 text-right">Optimal Status</p>
          </div>
        </div>

        {/* Historical Data Chart */}
        <div className="lg:col-span-2 bg-card-dark border border-card-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">Temperature Stability</h3>
              <p className="text-text-secondary text-xs">Last 24 Hours</p>
            </div>
            <select className="bg-background-dark border border-card-border text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option>24 Hours</option>
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
          </div>
          <div className="flex-1 min-h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1152d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232f48" vertical={false} />
                <XAxis dataKey="time" stroke="#92a4c9" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#92a4c9" fontSize={12} tickLine={false} axisLine={false} domain={[20, 30]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101622', borderColor: '#232f48', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#1152d4" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lighting Card */}
        <div className="bg-card-dark border border-card-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-yellow-500/10 p-2.5 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
              <Sun className="w-6 h-6" />
            </div>
            <span className="bg-card-border px-2 py-0.5 rounded text-[10px] text-text-secondary font-medium uppercase">Daylight</span>
          </div>
          <div>
            <h4 className="text-text-secondary text-sm font-medium mb-1">Lighting Intensity</h4>
            <p className="text-2xl font-bold text-white">850 <span className="text-base font-normal text-text-secondary">Lux</span></p>
          </div>
        </div>

        {/* Water Level Card */}
        <div className="bg-card-dark border border-card-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Droplets className="w-6 h-6" />
            </div>
            <span className="bg-card-border px-2 py-0.5 rounded text-[10px] text-text-secondary font-medium uppercase">Normal</span>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="text-text-secondary text-sm font-medium">Water Level</h4>
              <p className="text-xl font-bold text-white">92%</p>
            </div>
            <div className="w-full bg-card-border rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>

        {/* Air Pump Card */}
        <div className="bg-card-dark border border-card-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-cyan-500/10 p-2.5 rounded-lg text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <Wind className="w-6 h-6" />
            </div>
            {/* Toggle Switch (Admin Only) */}
            {user.role === 'admin' && (
              <button 
                role="switch" 
                aria-checked={pumpActive}
                onClick={() => setPumpActive(!pumpActive)}
                className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-card-dark ${pumpActive ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${pumpActive ? 'right-1' : 'left-1'}`}></span>
              </button>
            )}
          </div>
          <div>
            <h4 className="text-text-secondary text-sm font-medium mb-1">Air Pump Status</h4>
            <div className={`text-lg font-bold flex items-center gap-1 ${pumpActive ? 'text-emerald-400' : 'text-slate-500'}`}>
              {pumpActive ? 'Active' : 'Inactive'}
              {pumpActive && <span className="block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            </div>
          </div>
        </div>

        {/* Feeding Schedule Card */}
        <div className="bg-card-dark border border-card-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-purple-500/10 p-2.5 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <span className="bg-card-border px-2 py-0.5 rounded text-[10px] text-text-secondary font-medium uppercase">Auto</span>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <h4 className="text-text-secondary text-sm font-medium mb-0.5">Next Feeding</h4>
              <p className="text-white font-bold">In 2 hours</p>
            </div>
            {user.role === 'admin' && (
              <button className="mt-1 w-full py-1.5 px-3 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1 shadow-lg shadow-blue-900/20">
                <Utensils className="w-3 h-3" />
                Feed Now
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
