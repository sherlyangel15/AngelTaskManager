
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Moon, 
  Sun, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  LayoutGrid, 
  List, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Download,
  Upload,
  Save
} from 'lucide-react';
import { Task, Category, Priority, User, AuthSession } from './types';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import ProgressCircle from './components/ProgressCircle';
import { 
  saveTasksToFile, 
  loadTasksFromFile, 
  exportTasksToFile, 
  importTasksFromFile,
  isFileSystemAccessSupported,
  requestFileAccess
} from './services/fileStorageService';

const App: React.FC = () => {
  // --- Auth & Storage ---
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('angelplanner_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [allUsers, setAllUsers] = useState<Record<string, User>>(() => {
    const saved = localStorage.getItem('angelplanner_users');
    return saved ? JSON.parse(saved) : {};
  });

  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- UI State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'categories' | 'progress'>('calendar');

  // Calendar Helper States
  const [viewMonth, setViewMonth] = useState(new Date());

  // File Storage State
  const [hasFileAccess, setHasFileAccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user-specific tasks
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem('angelplanner_users');
      if (saved) {
        const users = JSON.parse(saved);
        if (users[currentUser.username]) {
          setTasks(users[currentUser.username].tasks || []);
          setAllUsers(users);
          return;
        }
      }
      setTasks([]);
    } else {
      setTasks([]);
    }
  }, [currentUser]);

  // Sync tasks back to storage (localStorage + file)
  useEffect(() => {
    if (currentUser && tasks.length >= 0) {
      // Ensure user exists in allUsers
      const currentUserData = allUsers[currentUser.username] || { 
        username: currentUser.username, 
        password: '', 
        tasks: [] 
      };
      
      const updatedUsers = { 
        ...allUsers, 
        [currentUser.username]: { 
          ...currentUserData, 
          tasks 
        } 
      };
      
      setAllUsers(updatedUsers);
      localStorage.setItem('angelplanner_users', JSON.stringify(updatedUsers));
      
      // Also save to file if file access is enabled
      if (hasFileAccess && tasks.length > 0) {
        saveTasksToFile(currentUser.username, tasks).catch(err => {
          console.error('Failed to save to file:', err);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, currentUser?.username, hasFileAccess]);

  // Dark Mode
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // --- Auth Logic ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    if (loginMode === 'signup') {
      if (allUsers[username]) {
        alert("This username is already taken.");
        return;
      }
      const newUser: User = { username, password, tasks: [] };
      const updatedUsers = { ...allUsers, [username]: newUser };
      setAllUsers(updatedUsers);
      localStorage.setItem('angelplanner_users', JSON.stringify(updatedUsers));
      performLogin(username);
    } else {
      const user = allUsers[username];
      if (user && user.password === password) {
        performLogin(username);
      } else {
        alert("The username or password you entered is incorrect.");
      }
    }
  };

  const performLogin = (uname: string) => {
    const session = { username: uname };
    setCurrentUser(session);
    localStorage.setItem('angelplanner_session', JSON.stringify(session));
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('angelplanner_session');
  };

  // --- Task Logic ---
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (!currentUser) {
      console.error('Cannot add task: No user logged in');
      return;
    }

    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now()
    };
    
    // Update tasks state
    setTasks(prev => {
      const updatedTasks = [newTask, ...prev];
      
      // Immediately save to localStorage
      if (currentUser) {
        const saved = localStorage.getItem('angelplanner_users');
        const users = saved ? JSON.parse(saved) : {};
        const currentUserData = users[currentUser.username] || { 
          username: currentUser.username, 
          password: '', 
          tasks: [] 
        };
        
        const updatedUsers = {
          ...users,
          [currentUser.username]: {
            ...currentUserData,
            tasks: updatedTasks
          }
        };
        
        localStorage.setItem('angelplanner_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
      }
      
      return updatedTasks;
    });
  };

  const toggleTask = (id: string) => {
    if (!currentUser) return;
    
    setTasks(prev => {
      const updatedTasks = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      
      // Immediately save to localStorage
      const saved = localStorage.getItem('angelplanner_users');
      const users = saved ? JSON.parse(saved) : {};
      const currentUserData = users[currentUser.username] || { 
        username: currentUser.username, 
        password: '', 
        tasks: [] 
      };
      
      const updatedUsers = {
        ...users,
        [currentUser.username]: {
          ...currentUserData,
          tasks: updatedTasks
        }
      };
      
      localStorage.setItem('angelplanner_users', JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);
      
      return updatedTasks;
    });
  };

  const deleteTask = (id: string) => {
    if (!currentUser) return;
    
    setTasks(prev => {
      const updatedTasks = prev.filter(t => t.id !== id);
      
      // Immediately save to localStorage
      const saved = localStorage.getItem('angelplanner_users');
      const users = saved ? JSON.parse(saved) : {};
      const currentUserData = users[currentUser.username] || { 
        username: currentUser.username, 
        password: '', 
        tasks: [] 
      };
      
      const updatedUsers = {
        ...users,
        [currentUser.username]: {
          ...currentUserData,
          tasks: updatedTasks
        }
      };
      
      localStorage.setItem('angelplanner_users', JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);
      
      return updatedTasks;
    });
  };

  // --- File Storage Logic ---
  const handleEnableFileAccess = async () => {
    if (!currentUser) return;
    
    const success = await requestFileAccess(currentUser.username);
    if (success) {
      setHasFileAccess(true);
      // Save current tasks to the file
      await saveTasksToFile(currentUser.username, tasks);
      alert('File access enabled! Your tasks will now be automatically saved to the selected file.');
    } else {
      alert('File access was cancelled or not supported. You can still use Export/Import.');
    }
  };

  const handleExportTasks = () => {
    if (!currentUser || tasks.length === 0) {
      alert('No tasks to export.');
      return;
    }
    exportTasksToFile(tasks, currentUser.username);
  };

  const handleImportTasks = async () => {
    if (!currentUser) return;

    // Try File System Access API first
    if (isFileSystemAccessSupported()) {
      const importedTasks = await loadTasksFromFile(currentUser.username);
      if (importedTasks) {
        if (window.confirm(`Import ${importedTasks.length} tasks? This will replace your current tasks.`)) {
          setTasks(importedTasks);
          setHasFileAccess(true);
        }
        return;
      }
    }

    // Fallback to file input
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      const importedTasks = await importTasksFromFile(file);
      if (window.confirm(`Import ${importedTasks.length} tasks? This will replace your current tasks.`)) {
        setTasks(importedTasks);
      }
    } catch (error: any) {
      alert(`Error importing file: ${error.message}`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    const iso = date.toISOString().split('T')[0];
    setCurrentDate(iso);
    setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  // --- Calendar Grid Helpers ---
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateStr,
        hasTasks: tasks.some(t => t.date === dateStr)
      });
    }
    return days;
  }, [viewMonth, tasks]);

  const changeViewMonth = (offset: number) => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + offset, 1));
  };

  // --- Filtering & Stats ---
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.date === currentDate);
    if (filterCategory !== 'All') {
      result = result.filter(t => t.category === filterCategory);
    }
    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const p = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
      return p[a.priority] - p[b.priority] || b.createdAt - a.createdAt;
    });
  }, [tasks, filterCategory, currentDate]);

  const stats = useMemo(() => {
    const dayTasks = tasks.filter(t => t.date === currentDate);
    const completed = dayTasks.filter(t => t.completed).length;
    return {
      total: dayTasks.length,
      completed,
      percentage: dayTasks.length === 0 ? 0 : (completed / dayTasks.length) * 100
    };
  }, [tasks, currentDate]);

  // --- Login Screen ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glass p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/30">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-black dark:text-white">Angel Planner</h1>
            <p className="text-slate-500 mt-2 font-medium">Your schedule, simplified.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-black dark:text-slate-400 ml-1">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-black dark:text-white"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-black dark:text-slate-400 ml-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-black dark:text-white"
                placeholder="Enter your password"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-black dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all transform active:scale-95 mt-4"
            >
              {loginMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setLoginMode(loginMode === 'login' ? 'signup' : 'login')}
              className="text-sm font-black text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              {loginMode === 'login' ? "New here? Create an account" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white uppercase">Angel Planner</h1>
            <div className="flex items-center gap-3 mt-1 text-slate-500 font-black uppercase text-[10px] tracking-widest">
              <span>{currentUser.username}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <button onClick={handleLogout} className="flex items-center gap-1 hover:text-rose-600 transition-colors">
                <LogOut size={10} /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* File Storage Buttons */}
          <div className="flex items-center gap-2">
            {!hasFileAccess && isFileSystemAccessSupported() && (
              <button 
                onClick={handleEnableFileAccess}
                className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm flex items-center gap-2"
                title="Enable automatic file saving"
              >
                <Save size={18} />
                <span className="text-xs font-bold hidden sm:inline">Auto Save</span>
              </button>
            )}
            <button 
              onClick={handleExportTasks}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-slate-300 transition-all shadow-sm hover:bg-slate-50 flex items-center gap-2"
              title="Export tasks to file"
            >
              <Download size={18} />
              <span className="text-xs font-bold hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={handleImportTasks}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-slate-300 transition-all shadow-sm hover:bg-slate-50 flex items-center gap-2"
              title="Import tasks from file"
            >
              <Upload size={18} />
              <span className="text-xs font-bold hidden sm:inline">Import</span>
            </button>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-slate-300 transition-all shadow-sm hover:bg-slate-50"
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-black dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white rounded-[1.25rem] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 transform active:scale-95"
          >
            <Plus size={22} strokeWidth={3} /> New Plan
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR ON THE LEFT (lg:order-1) */}
        <aside className="lg:w-[420px] flex-shrink-0 lg:order-1 space-y-6">
          <nav className="glass p-2 rounded-[2rem] flex items-center justify-between border border-slate-100 shadow-sm">
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-4 px-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'calendar' ? 'bg-black dark:bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:text-black dark:hover:text-white font-bold'}`}
            >
              <CalendarIcon size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Schedule</span>
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-4 px-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'categories' ? 'bg-black dark:bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:text-black dark:hover:text-white font-bold'}`}
            >
              <LayoutGrid size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Groups</span>
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-4 px-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'progress' ? 'bg-black dark:bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:text-black dark:hover:text-white font-bold'}`}
            >
              <TrendingUp size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Status</span>
            </button>
          </nav>

          <div className="min-h-[500px]">
            {activeTab === 'calendar' && (
              <section className="glass p-10 rounded-[2.5rem] animate-in slide-in-from-left duration-400">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-base font-black uppercase tracking-[0.25em] text-black dark:text-slate-100">
                    {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => changeViewMonth(-1)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800"><ChevronLeft size={18} /></button>
                    <button onClick={() => changeViewMonth(1)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800"><ChevronRight size={18} /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                  {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((d, i) => (
                    <button
                      key={i}
                      disabled={!d}
                      onClick={() => d && setCurrentDate(d.dateStr)}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all border ${
                        !d ? 'invisible' : 
                        currentDate === d?.dateStr ? 'bg-black dark:bg-blue-600 text-white border-transparent shadow-xl' : 
                        'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-blue-500 text-black dark:text-white font-black'
                      }`}
                    >
                      <span className="text-xs">{d?.day}</span>
                      {d?.hasTasks && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${currentDate === d.dateStr ? 'bg-white' : 'bg-blue-600'}`}></span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                   <button 
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setCurrentDate(today);
                      setViewMonth(new Date());
                    }}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-300 font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Return to Today
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'categories' && (
              <section className="glass p-10 rounded-[2.5rem] animate-in slide-in-from-left duration-400">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Filter by Group</h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => setFilterCategory('All')}
                    className={`w-full text-left px-6 py-5 rounded-2xl transition-all font-black flex items-center justify-between border-2 ${
                      filterCategory === 'All' 
                        ? 'bg-black dark:bg-blue-600 text-white border-transparent shadow-xl' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-black dark:text-slate-300 hover:border-blue-500'
                    }`}
                  >
                    <span className="tracking-widest">All Categories</span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-lg ${filterCategory === 'All' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {tasks.filter(t => t.date === currentDate).length}
                    </span>
                  </button>
                  {Object.values(Category).map(cat => {
                    const count = tasks.filter(t => t.category === cat && t.date === currentDate).length;
                    return (
                      <button 
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`w-full text-left px-6 py-5 rounded-2xl transition-all font-black flex items-center justify-between border-2 ${
                          filterCategory === cat 
                            ? 'bg-black dark:bg-blue-600 text-white border-transparent shadow-xl' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-black dark:text-slate-300 hover:border-blue-500'
                        }`}
                      >
                        <span className="tracking-widest uppercase">{cat}</span>
                        <span className={`text-[11px] px-2.5 py-1 rounded-lg ${filterCategory === cat ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === 'progress' && (
              <section className="glass p-10 rounded-[2.5rem] flex flex-col items-center animate-in slide-in-from-left duration-400">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Daily Completion Status</h2>
                <ProgressCircle percentage={stats.percentage} />
                <div className="mt-12 grid grid-cols-2 gap-5 w-full">
                  <div className="glass bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] text-center border-2 border-slate-50 dark:border-slate-800">
                    <p className="text-4xl font-black text-black dark:text-white leading-none">{stats.total}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Planned</p>
                  </div>
                  <div className="glass bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] text-center border-2 border-slate-50 dark:border-slate-800">
                    <p className="text-4xl font-black text-emerald-500 leading-none">{stats.completed}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Success</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </aside>

        {/* FEED ON THE RIGHT (lg:order-2) */}
        <main className="flex-grow lg:order-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-black text-black dark:text-white leading-none uppercase tracking-tighter">
                {currentDate === new Date().toISOString().split('T')[0] ? 'Daily Focus' : 'Schedule View'}
              </h2>
              <p className="text-slate-500 font-black text-sm mt-3 uppercase tracking-[0.25em]">
                {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => changeDate(-1)}
                className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-slate-400 transition-all shadow-sm"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => changeDate(1)}
                className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-slate-400 transition-all shadow-sm"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                />
              ))
            ) : (
              <div className="glass p-24 rounded-[3.5rem] text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                  <List size={56} />
                </div>
                <h3 className="text-3xl font-black text-black dark:text-white tracking-tight uppercase">Nothing on the menu</h3>
                <p className="text-slate-500 mt-4 font-bold text-lg max-w-sm mx-auto leading-relaxed">Your day is currently a blank slate. Add something meaningful to your schedule.</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="mt-10 px-10 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                >
                  Start Planning
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action for Mobile */}
      <button 
        onClick={() => setShowForm(true)}
        className="md:hidden fixed bottom-12 right-10 w-20 h-20 bg-black dark:bg-blue-600 rounded-[2.5rem] text-white shadow-2xl flex items-center justify-center z-[90] active:scale-90 transition-transform p-5"
        aria-label="Add Task"
      >
        <Plus size={40} strokeWidth={4} />
      </button>

      {/* Form Modal */}
      {showForm && (
        <TaskForm 
          onAdd={addTask} 
          onClose={() => setShowForm(false)} 
          defaultDate={currentDate}
        />
      )}

      {/* Hidden file input for import fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default App;
