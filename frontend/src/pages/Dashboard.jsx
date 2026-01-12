import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  TrendingUp, 
  Sun, 
  Droplets, 
  Wind, 
  Clock, 
  Utensils,
  AlertCircle 
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
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // State
  const [systemStatus, setSystemStatus] = useState({ online: false, last_seen: null });
  const [sensors, setSensors] = useState({
    temperature: 0,
    brightness: 0, // Changed from lux
    water_level: 0,
    pump_status: 'OFF',
    feeding: {
      next_feeding: null,
      interval: '4h',
      quantity: 1,
      last_fed: null
    },
    last_updated: null,
    last_pump_toggle: null
  });
  const [chartData, setChartData] = useState([]);
  const [pumpActive, setPumpActive] = useState(false);
  const [timeRange, setTimeRange] = useState('24h'); // Add state for selector
  
  // Controls State
  const [brightness, setBrightness] = useState(80);
  const [isDragging, setIsDragging] = useState(false); // Track slider interaction
  const lastUpdateRef = React.useRef(0); // Timestamp of last user update

  // Sync brightness from sensors when not dragging AND not recently updated by user
  useEffect(() => {
    const timeSinceUpdate = Date.now() - lastUpdateRef.current;
    // Block server sync if user updated < 3 seconds ago to prevent "bounce"
    if (!isDragging && sensors.brightness !== undefined && timeSinceUpdate > 3000) {
      setBrightness(sensors.brightness);
    }
  }, [sensors.brightness, isDragging]);

  // Debounced API Call for Brightness
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only call API if value changed significantly from what the database previously reported
      if (sensors.brightness !== undefined && brightness !== sensors.brightness) {
        if (user.role === 'admin') {
           // Optimistically update sensors to prevent "jump back" from polling
           setSensors(prev => ({ ...prev, brightness: brightness }));
           
           // Mark update time to block sync
           lastUpdateRef.current = Date.now();

           api.setBrightness(brightness, user.role).catch(err => {
             console.error(err);
             toast.error('Failed to update brightness');
             // Revert on error (next poll will fix it anyway, but good form)
           });
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [brightness]); // Dependencies: brightness (captured sensors/user is fine)

  // Fetch Data
  const fetchData = async () => {
    try {
      // 1. System Status
      const status = await api.getSystemStatus();
      setSystemStatus({ 
        online: status.esp32_online, 
        last_seen: status.last_seen 
      });

      // 2. Latest Sensors
      const latest = await api.getLatestSensors();
      setSensors(latest);
      setPumpActive(latest.pump_status === 'ON');

      // 3. History (pass timeRange)
      const history = await api.getSensorHistory(timeRange);
      // Transform for chart
      const formattedHistory = history.data.map(item => ({
        time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        temp: item.temperature
      }));
      setChartData(formattedHistory);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch when component mounts or range changes
    
    // Polling only needs to refresh sensors/status frequently. 
    // Ideally history doesn't change fast, but we'll include it for simplicity.
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, [timeRange]); // Re-run when timeRange changes
  
  // Handlers
  const handleRangeChange = (e) => {
    setTimeRange(e.target.value);
    // fetchData will be triggered by useEffect dependency
  };
  
  // Handlers
  const handlePumpToggle = async () => {
    // Frontend Check
    if (user.role !== 'admin') return;
    
    try {
      const newState = !pumpActive;
      setPumpActive(newState); // Optimistic update
      // Backend Call (with Role)
      await api.togglePump(newState, user.role);
      toast.success(`Pump turned ${newState ? 'ON' : 'OFF'} successfully`);
    } catch (error) {
      console.error('Failed to toggle pump:', error);
      setPumpActive(!pumpActive); // Revert on error
      if (error.message === 'Unauthorized') {
        toast.error('Access Denied: You must be an admin.');
      } else {
        toast.error('Failed to toggle pump');
      }
    }
  };

  const handleFeed = async () => {
    // Frontend Check
    if (user.role !== 'admin') return;

    try {
      // Backend Call (with Role)
      await api.triggerFeed(user.role);
      toast.success('Feeding command sent successfully! 🐟');
    } catch (error) {
      console.error('Failed to feed:', error);
      if (error.message === 'Unauthorized') {
        toast.error('Access Denied: You must be an admin.');
      } else {
        toast.error('Failed to send feeding command');
      }
    }
  };

  const handleFeedingSettingsChange = async (key, value) => {
    if (user.role !== 'admin') return;

    try {
      // Optimistic Update
      setSensors(prev => ({
        ...prev,
        feeding: {
          ...prev.feeding,
          [key]: value
        }
      }));

      // API Call
      await api.updateFeedingSettings({ [key]: value }, user.role);
      toast.success(`Feeding ${key} updated to ${value}`);
    } catch (error) {
      console.error('Failed to update feeding settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const getTimeUntilFeeding = (nextFeeding) => {
     if (!nextFeeding) return 'Unknown';
     const diff = new Date(nextFeeding) - new Date();
     if (diff < 0) return 'Overdue';
     const minutes = Math.floor(diff / (1000 * 60));
     const seconds = Math.floor((diff % (1000 * 60)) / 1000);
     return `In ${minutes}m ${seconds}s`;
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-text-secondary text-sm">Real-time monitoring for <span className="text-white font-medium">Main Tank 01</span></p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${systemStatus.online ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus.online ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${systemStatus.online ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          {systemStatus.online ? 'System Operational' : 'System Offline'}
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
              <span className="text-6xl font-black text-white tracking-tighter">{sensors.temperature}</span>
              <span className="text-2xl font-medium text-text-secondary">°C</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Stable</span>
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
            <p className="text-xs text-text-secondary mt-2 text-right">Last updated: {sensors.last_updated ? new Date(sensors.last_updated).toLocaleTimeString() : 'Never'}</p>
          </div>
        </div>

        {/* Historical Data Chart */}
        <div className="lg:col-span-2 bg-card-dark border border-card-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">Temperature Stability</h3>
              <p className="text-text-secondary text-xs">Last 24 Hours</p>
            </div>
            <select 
              value={timeRange}
              onChange={handleRangeChange}
              className="bg-background-dark border border-card-border text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
          <div className="flex-1 min-h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
            <h4 className="text-text-secondary text-sm font-medium mb-2">Lighting Intensity</h4>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-white">{brightness}%</span>
              <span className="text-xs text-text-secondary mb-1">Target</span>
            </div>
            {user.role === 'admin' ? (
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={brightness} 
                onChange={(e) => {
                  setBrightness(parseInt(e.target.value));
                  lastUpdateRef.current = Date.now(); // Block sync immediately
                }}
                onMouseDown={() => {
                  setIsDragging(true);
                  lastUpdateRef.current = Date.now();
                }}
                onMouseUp={() => {
                  setIsDragging(false);
                  lastUpdateRef.current = Date.now();
                }}
                onTouchStart={() => {
                  setIsDragging(true);
                  lastUpdateRef.current = Date.now();
                }}
                onTouchEnd={() => {
                  setIsDragging(false);
                  lastUpdateRef.current = Date.now();
                }}
                className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            ) : (
             <div className="w-full bg-card-border rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${brightness}%` }}></div>
              </div>
            )}
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
              <p className="text-xl font-bold text-white">{sensors.water_level}%</p>
            </div>
            <div className="w-full bg-card-border rounded-full h-2">
              <div 
                className={`h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 ${sensors.water_level < 30 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                style={{ width: `${sensors.water_level}%` }}
              ></div>
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
                onClick={handlePumpToggle}
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
            <p className="text-xs text-text-secondary mt-1">
              Last Action: <span className="text-slate-300">
                {sensors.last_pump_toggle 
                  ? new Date(sensors.last_pump_toggle).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                  : 'Never'}
              </span>
            </p>
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
          <div className="flex flex-col gap-3">
            <div>
              <h4 className="text-text-secondary text-sm font-medium mb-0.5">Next Feeding</h4>
              <p className="text-white font-bold">{getTimeUntilFeeding(sensors.feeding?.next_feeding)}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Last fed: <span className="text-slate-400">
                  {sensors.feeding?.last_fed 
                    ? new Date(sensors.feeding.last_fed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                    : 'Unknown'}
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Interval</label>
                {user.role === 'admin' ? (
                  <select 
                    value={sensors.feeding?.interval || '4h'}
                    onChange={(e) => handleFeedingSettingsChange('interval', e.target.value)}
                    className="w-full bg-slate-900 border border-card-border rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
                  >
                    <option value="30s">Every 30s</option>
                    <option value="1m">Every 1m</option>
                    <option value="2m">Every 2m</option>
                    <option value="3m">Every 3m</option>
                    <option value="5m">Every 5m</option>
                    <option value="10m">Every 10m</option>
                    <option value="30m">Every 30m</option>
                  </select>
                ) : (
                  <div className="text-xs text-white bg-slate-800/50 px-2 py-1 rounded border border-card-border">
                    Every {(sensors.feeding?.interval || '4h')
                      .replace('h', ' Hours')
                      .replace('m', ' Minutes')
                      .replace('s', ' Seconds')}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Scoops</label>
                {user.role === 'admin' ? (
                  <select 
                    value={sensors.feeding?.quantity || 1}
                    onChange={(e) => handleFeedingSettingsChange('quantity', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-card-border rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
                  >
                    <option value="1">1 Scoop</option>
                    <option value="2">2 Scoops</option>
                    <option value="3">3 Scoops</option>
                  </select>
                ) : (
                  <div className="text-xs text-white bg-slate-800/50 px-2 py-1 rounded border border-card-border">
                    {sensors.feeding?.quantity} Scoop{sensors.feeding?.quantity > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {user.role === 'admin' && (
              <button 
                onClick={handleFeed}
                className="w-full py-1.5 px-3 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1 shadow-lg shadow-blue-900/20"
              >
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
