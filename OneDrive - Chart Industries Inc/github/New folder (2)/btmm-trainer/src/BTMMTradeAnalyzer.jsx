import React, { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Camera, Calendar, Clock, TrendingUp, TrendingDown, Copy, Filter, Search, ChevronDown, ChevronRight } from 'lucide-react';
import TradeCard from './components/TradeCard.jsx';
import Filters from './components/Filters.jsx';
import TradeModal from './components/TradeModal.jsx';
import SupabaseSettingsModal from './components/SupabaseSettingsModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import StatsBar from './components/StatsBar.jsx';
import HeaderBar from './components/HeaderBar.jsx';
import CaseStudyModal from './components/CaseStudyModal.jsx';
import CaseStudyCard from './components/CaseStudyCard.jsx';
import { supabaseEnvClient } from './lib/supabaseClient.js';

// IndexedDB lightweight helpers for persistence
const DB_NAME = 'btmm-db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result?.value);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Client-side image compression for performance and storage efficiency
function compressImage(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Supabase runtime loader and helpers (client-side, anon key only)
function loadSupabaseLibrary() {
  return new Promise((resolve, reject) => {
    if (window.supabase?.createClient) return resolve(window.supabase);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.async = true;
    script.onload = () => resolve(window.supabase);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function dataUrlToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(meta);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

const BTMMTradeAnalyzer = () => {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [showSupabaseForm, setShowSupabaseForm] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const supabaseRef = useRef(null);
  const searchInputRef = useRef(null);
  const [toast, setToast] = useState(null);
  const listParentRef = useRef(null);
  const lessonFileRef = useRef(null);

  // Form state for new/editing trades
  const [formData, setFormData] = useState({
    date: '',
    session: 'London',
    patternType: 'Type 1',
    pair: 'EURUSD',
    image: null,
    imageUrl: '',
    // Bias-first fields
    biasLevel: '1',
    emaCrosses: {},
    adr5: '',
    todayRange: '',
    confluences: {},
    outcome: 'Win', // Default to winner
    pips: '',
    notes: ''
  });

  // Case studies
  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', session: 'London', patternType: 'Type 1', tags: '', imageUrl: '', notes: '' });

  const sessions = ['Asian', 'London', 'New York'];
  const patternTypes = ['Type 1', 'Type 2', 'Type 3', 'Type 4'];
  const biasLevels = ['1', '2', '3'];
  const emaOptions = ['5/13', '13/50', '50/200', '200/800', '50/800'];
  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
  const outcomes = ['Win']; // Only winners for pattern recognition training

  const confluenceOptions = {
    'Type 1': {
      'Type 1a - Full 13 EMA Rules': [
        'Both legs strictly respect 13 EMA',
        'Clean rejection at session HOD/LOD',
        'Apex at PSH/PSL levels',
        'Apex at PDH/PDL levels',
        'Apex at PWH/PWL levels',
        'Apex at PMH/PML levels',
        'Apex at PYH/PYL levels',
        'Apex at 5-day averaged ADR levels'
      ],
      'Type 1b - 13 EMA Tap': [
        'First leg taps but does not break 13 EMA',
        'Second leg rejection pattern (Morning Star)',
        'Second leg rejection pattern (Railroad Tracks)',
        'Brinks Trade timing 9:45 PM EST',
        'Brinks Trade timing 3:45 AM EST',
        'Brinks Trade timing 9:45 AM EST',
        'London/NY session extremes',
        'Level 3 areas in BTMM methodology'
      ],
      'Type 1c - Leg Does Not Touch 13 EMA': [
        'First leg remains above/below 13 EMA',
        'Second leg closes inside 13 EMA',
        'Railroad Tracks confirmation',
        'COW (Cluster of Wicks) pattern',
        'Near session HOD/LOD',
        'Liquidity sweeps before reversal'
      ],
      'Dynamic EMA Interaction': [
        '13 EMA as dynamic resistance/support',
        'Both legs interact with 13 EMA',
        'Proximity to 13 EMA maintained'
      ],
      'Rejection Candlestick Patterns': [
        'Morning/Evening Stars',
        'Railroad Tracks pattern',
        'COW (Cluster of Wicks)',
        'Clean rejection from liquidity points'
      ],
      'Session Timing Alignment': [
        'London Session 3:30-5:30 AM EST',
        'New York Session 9:30-11:00 AM EST',
        'Brinks Trade 9:45 PM EST',
        'Brinks Trade 3:45 AM EST',
        'Brinks Trade 9:45 AM EST'
      ],
      'Liquidity Targeting': [
        'PSH/PSL liquidity sweeps',
        'PDH/PDL liquidity sweeps',
        'PWH/PWL liquidity sweeps',
        'PMH/PML liquidity sweeps',
        'PYH/PYL liquidity sweeps',
        '5-day averaged ADR levels'
      ]
    },
    'Type 2': {
      'Type 2a - Symmetrical Legs': [
        'Both legs symmetrical in length',
        'Both legs symmetrical in structure',
        'Clear rejection candlestick at apex',
        'Near session HOD/LOD',
        'After liquidity sweep during extremes',
        'Clear double top/bottom structure'
      ],
      'Type 2b - Extended Second Leg': [
        'Second leg extended beyond first leg',
        'Railroad Tracks at apex',
        'Morning/Evening Star at apex',
        'Near HOD/LOD levels',
        'Near HOW/LOW levels',
        'Near 5-day averaged ADR levels',
        'During Brinks Timing',
        'After large liquidity sweep'
      ],
      'Type 2c - Pattern at Key EMA Levels': [
        'Pattern forms at 13 EMA',
        'Pattern forms at 50 EMA',
        'Pattern forms at 200 EMA',
        'Both legs interact with EMA',
        'Second leg closes above/below EMA',
        'At session highs/lows',
        'During pullbacks after trend'
      ],
      'Apex Formation': [
        'Apex where both legs meet',
        'Reversal begins at apex',
        'Morning/Evening Star confirmation',
        'Railroad Tracks confirmation'
      ],
      'Dynamic EMA Interaction': [
        'Respects key EMAs (13, 50, 200)',
        'Second leg aligns with EMA bounce',
        'EMA rejection confluence'
      ],
      'Session Timing Alignment': [
        'London Session 3:30-5:30 AM EST',
        'New York Session 9:30-11:00 AM EST',
        'Brinks Trade 9:45 PM EST',
        'Brinks Trade 3:45 AM EST',
        'Brinks Trade 9:45 AM EST'
      ],
      'Liquidity Targeting': [
        'Session highs/lows sweep',
        'HOD/LOD liquidity',
        'HOW/LOW liquidity',
        'PWH/PWL liquidity',
        'Entry at liquidity points with reversal'
      ]
    },
    'Type 3': {
      'Type 3a - 50 EMA Bounce': [
        'Price pulls back to 50 EMA',
        'After clear trend or breakout',
        'Railroad Tracks confirmation',
        'Pin Bar confirmation',
        'During pullback in trending market',
        'Around session highs/lows',
        'Trend continuation setup'
      ],
      'Type 3b - Asian Range Bounce': [
        'Respects 50% of Asian session range',
        'Bounces off Asian range high/low',
        'Candlestick pattern confirmation',
        'Asian high/low respect',
        'Mid-level (50%) of Asian range',
        'During London/NY sessions',
        'Retraces to Asian boundary'
      ],
      'Type 3c - ADR/Key Level Rejection': [
        'Rejects ADR (Average Daily Range)',
        'Rejects PDH/PDL levels',
        'Rejects YH/YL levels',
        'Morning/Evening Star confirmation',
        'ADR high/low rejection',
        'Continuation after key level rejection'
      ],
      'Bounce Points': [
        'Key level interaction (50 EMA)',
        'Asian range interaction',
        'ADR level interaction',
        'Dynamic support/resistance'
      ],
      'Dynamic EMA Interaction': [
        '50 EMA confirms trend direction',
        '50 EMA as retracement zone',
        'Rejection patterns at EMA',
        'EMA signals entry points'
      ],
      'Session Timing Alignment': [
        'London Session 3:30-5:30 AM EST',
        'New York Session 9:30-11:00 AM EST',
        'Brinks Trade 9:45 PM EST',
        'Brinks Trade 3:45 AM EST',
        'Brinks Trade 9:45 AM EST'
      ],
      'Liquidity Targeting': [
        'Price sweeps at session highs/lows',
        'Rejection within ADR boundary',
        'Session extremes targeting'
      ]
    },
    'Type 4': {
      'Type 4a - 50 EMA Continuation': [
        'Strong breakout from consolidation',
        'Retraces to 50 EMA',
        'Respects 50 EMA as dynamic support/resistance',
        'Rejection candlestick at EMA',
        'Mid-session retracements',
        'After initial session breakout',
        '50 EMA aligns with session momentum'
      ],
      'Type 4b - Breakout Pullback': [
        'Breaks significant level (PDH/PDL)',
        'Breaks Asian high/low',
        'Breaks ADR boundary',
        'Retraces to test breakout level',
        'Rejection candlestick at test',
        'During Brinks Timing',
        'After London Open breakout'
      ],
      'Type 4c - Trend Continuation with 200 EMA': [
        'Strong trend above/below 200 EMA',
        'Long-term momentum confirmed',
        'Retraces to 200 EMA',
        'Consolidates before continuation',
        'Candlestick pattern at 200 EMA',
        'During trending markets',
        'Higher timeframe confluence'
      ],
      'Breakout and Retracement': [
        'Breakout followed by retracement',
        'Retracement confirms the move',
        'Aligns with key EMA (50 or 200)',
        'Aligns with significant level (PDH/PDL)',
        'Aligns with ADR levels'
      ],
      'Dynamic EMA Interaction': [
        '50 EMA trend direction role',
        '200 EMA trend direction role',
        '50 EMA retracement zones',
        '200 EMA retracement zones',
        'Price respects levels before continuation'
      ],
      'Session Timing Alignment': [
        'London Session 3:30-5:30 AM EST',
        'New York Session 9:30-11:00 AM EST',
        'Brinks Trade 9:45 PM EST',
        'Brinks Trade 3:45 AM EST',
        'Brinks Trade 9:45 AM EST',
        'London Open Breakout 3:30-5:30 AM EST',
        'New York Continuation 9:30-11:00 AM EST'
      ],
      'Liquidity Targeting': [
        'Above/below key levels liquidity',
        'Session highs/lows liquidity',
        'ADR boundaries liquidity',
        'Confirms breakout after clearing pools',
        'Continuation after liquidity clear'
      ]
    }
  };

  const generateDescription = (patternType, confluences, pair, session, biasLevel, emaCrosses, adr5, todayRange) => {
    const selectedCrosses = Object.entries(emaCrosses || {}).filter(([_, v]) => v).map(([k]) => k);
    const adrNum = parseFloat(String(adr5 || '').replace(/[^\d.]/g, ''));
    const trNum = parseFloat(String(todayRange || '').replace(/[^\d.]/g, ''));
    const multiple = adrNum && trNum ? (trNum / adrNum).toFixed(2) : null;
    const biasHeader = `Bias Level: ${biasLevel || 'N/A'}${selectedCrosses.length ? ` | EMA: ${selectedCrosses.join(', ')}` : ''}${multiple ? ` | ADR5: ${adrNum} | Range: ${trNum} (${multiple}x)` : ''}. `;
    const selectedConfluences = Object.entries(confluences).filter(([_, selected]) => selected);
    if (selectedConfluences.length === 0) return `${biasHeader}${patternType} pattern setup on ${pair} during ${session} session.`;

    let description = biasHeader;
    
    switch (patternType) {
      case 'Type 1':
        description += `Type 1 safety trade setup identified on ${pair} during ${session} session. `;
        if (confluences['Above Asian range (25-50 pips)']) description += 'Stop hunt executed above Asian range (25-50 pips) targeting retail stops. ';
        if (confluences['Below Asian range (25-50 pips)']) description += 'Stop hunt executed below Asian range (25-50 pips) targeting retail stops. ';
        if (confluences['M pattern off 200 EMA']) description += 'M pattern formation with rejection off 200 EMA level providing strong resistance. ';
        if (confluences['W pattern off 200 EMA']) description += 'W pattern formation with support from 200 EMA level. ';
        if (confluences['RSI below MBL crossing signal']) description += 'TDI confirmation with RSI below Market Base Line crossing signal line for bearish entry. ';
        if (confluences['RSI above MBL crossing signal']) description += 'TDI confirmation with RSI above Market Base Line crossing signal line for bullish entry. ';
        if (confluences['Railroad track pattern']) description += 'Entry confirmed by railroad track candlestick pattern on second leg. ';
        description += 'Trade aligns with London manipulation phase exploiting retail liquidity.';
        break;
        
      case 'Type 2':
        description += `Type 2 internal pattern setup on ${pair} during ${session} session. `;
        if (confluences['Asian range <50 pips']) description += 'Tight Asian range below 50 pips creating compressed environment. ';
        if (confluences['Pattern within range']) description += 'M/W pattern forming entirely within Asian boundaries. ';
        if (confluences['Smaller profit targets (20-30 pips)']) description += 'Risk management adjusted for constrained range with 20-30 pip targets. ';
        description += 'Internal manipulation strategy without boundary violations.';
        break;
        
      case 'Type 3':
        description += `Type 3 (50/50/50) confluence pattern on ${pair} during ${session} session. `;
        if (confluences['Clear rejection off 50 EMA']) description += 'Price showing clear rejection off 50 EMA dynamic level. ';
        if (confluences['RSI crossing 50 static line']) description += 'TDI RSI crossing 50 static line with momentum confirmation. ';
        if (confluences['Pattern in 50% of Asian range']) description += 'Pattern positioned optimally within 50% of Asian range. ';
        if (confluences['Triple confluence alignment']) description += 'All three 50/50/50 conditions aligned for high-probability entry. ';
        description += 'Advanced setup with 60-70% historical success rate.';
        break;
        
      case 'Type 4':
        description += `Type 4 breakout/continuation setup on ${pair} during ${session} session. `;
        if (confluences['Clear break of Asian range']) description += 'Decisive break above/below Asian range with volume confirmation. ';
        if (confluences['Asian high/low retest']) description += 'Successful retest of broken Asian level holding as new support/resistance. ';
        if (confluences['EMA alignment']) description += 'All EMAs properly aligned supporting trend direction. ';
        if (confluences['ADR completion']) description += 'Targeting ADR completion with potential for extended move. ';
        description += 'Trend continuation pattern aligning with institutional flow.';
        break;
    }
    
    return description;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 1600, 0.8);
        setFormData(prev => ({
          ...prev,
          image: file,
          imageUrl: compressedDataUrl
        }));
      } catch (e) {
        // Fallback: use original if compression fails
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData(prev => ({
            ...prev,
            image: file,
            imageUrl: ev.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePaste = useCallback(async (event) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          try {
            const compressedDataUrl = await compressImage(file, 1600, 0.8);
            setFormData(prev => ({
              ...prev,
              image: file,
              imageUrl: compressedDataUrl
            }));
          } catch (e) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              setFormData(prev => ({
                ...prev,
                image: file,
                imageUrl: ev.target.result
              }));
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Debounce search input -> searchTerm
  React.useEffect(() => {
    const id = setTimeout(() => setSearchTerm(searchInput.trim()), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Register service worker for PWA
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Ensure manifest link exists
      const hasManifest = document.querySelector('link[rel="manifest"]');
      if (!hasManifest) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.json';
        document.head.appendChild(link);
      }
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }, []);

  // Keyboard shortcuts: N (new trade), / (focus search), Esc (close modals), Ctrl+Enter (save)
  React.useEffect(() => {
    const onKey = (e) => {
      // Ignore when typing in inputs/textareas except for '/'
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea';

      // Focus search with '/'
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isTyping) {
        // Allow Ctrl/Cmd+Enter to submit when modal is open
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && showAddForm) {
          e.preventDefault();
          handleSubmit();
        }
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !showAddForm) {
        e.preventDefault();
        setShowAddForm(true);
        return;
      }
      if (e.key === 'Escape') {
        if (showAddForm) setShowAddForm(false);
        if (showSupabaseForm) setShowSupabaseForm(false);
        if (showAuthForm) { setShowAuthForm(false); setMagicSent(false); }
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAddForm, showSupabaseForm, showAuthForm, magicSent]);

  // Normalize a trade object to ensure timestamps exist
  const normalizeTrade = (t) => {
    if (!t) return t;
    const created = t.createdAt || t.timestamp || new Date().toISOString();
    const updated = t.updatedAt || t.timestamp || created;
    return { ...t, createdAt: created, updatedAt: updated };
  };

  // Initialize Supabase from saved config and fetch server trades
  React.useEffect(() => {
    const savedUrl = localStorage.getItem('supabaseUrl') || '';
    const savedKey = localStorage.getItem('supabaseAnonKey') || '';
    // Prefer env client if present
    if (supabaseEnvClient) {
      supabaseRef.current = supabaseEnvClient;
      setIsSupabaseConnected(true);
      setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
      setSupabaseAnonKey('env');
    } else {
      setSupabaseUrl(savedUrl);
      setSupabaseAnonKey(savedKey);
    }
    (async () => {
      if (!savedUrl || !savedKey) return;
      try {
        const lib = await loadSupabaseLibrary();
        supabaseRef.current = lib.createClient(savedUrl, savedKey);
        setIsSupabaseConnected(true);
        // Auth state
        try {
          const { data: u } = await supabaseRef.current.auth.getUser();
          setUser(u?.user || null);
        } catch (_) {}
        try {
          supabaseRef.current.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
          });
        } catch (_) {}
        const { data, error } = await supabaseRef.current
          .from('trades')
          .select('*')
          .order('timestamp', { ascending: true });
        if (!error && Array.isArray(data)) {
          // Merge server trades with local, preferring newest timestamp per id
          const byId = new Map();
          [...trades, ...data.map(normalizeTrade)].forEach((t) => {
            const existing = byId.get(t.id);
            const tUpdated = new Date((t.updatedAt || t.timestamp) || 0);
            const eUpdated = existing ? new Date((existing.updatedAt || existing.timestamp) || 0) : 0;
            if (!existing || tUpdated > eUpdated) {
              byId.set(t.id, t);
            }
          });
          setTrades(Array.from(byId.values()));
        }
      } catch (_) {
        setIsSupabaseConnected(false);
        supabaseRef.current = null;
      }
    })();
  }, []);

  // Load saved trades from IndexedDB on mount
  React.useEffect(() => {
    (async () => {
      try {
        const saved = await idbGet('trades');
        if (Array.isArray(saved)) {
          setTrades(saved.map(normalizeTrade));
        }
        const savedLessons = await idbGet('lessons');
        if (Array.isArray(savedLessons)) setLessons(savedLessons);
      } catch (_) {
        // Ignore load errors; app still works without persistence
      }
    })();
  }, []);

  // Persist trades whenever they change
  React.useEffect(() => {
    (async () => {
      try {
        await idbSet('trades', trades);
        await idbSet('lessons', lessons);
      } catch (_) {
        // Ignore save errors silently
      }
    })();
  }, [trades, lessons]);

  const handleConfluenceChange = (confluence, checked) => {
    setFormData(prev => ({
      ...prev,
      confluences: {
        ...prev.confluences,
        [confluence]: checked
      }
    }));
  };

  const handleSubmit = async () => {
    let remoteImageUrl = formData.imageUrl;
    try {
      if (isSupabaseConnected && supabaseRef.current && formData.imageUrl && formData.imageUrl.startsWith('data:')) {
        const blob = dataUrlToBlob(formData.imageUrl);
        const fileName = `trade-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: upErr } = await supabaseRef.current.storage.from('trade-images').upload(fileName, blob, { contentType: blob.type, upsert: true });
        if (!upErr) {
          const { data: pub } = supabaseRef.current.storage.from('trade-images').getPublicUrl(fileName);
          if (pub?.publicUrl) remoteImageUrl = pub.publicUrl;
        }
      }
    } catch (_) {}

    const nowIso = new Date().toISOString();
    const newTrade = {
      id: editingTrade ? editingTrade.id : uuidv4(),
      ...formData,
      imageUrl: remoteImageUrl || formData.imageUrl,
      description: generateDescription(
        formData.patternType,
        formData.confluences,
        formData.pair,
        formData.session,
        formData.biasLevel,
        formData.emaCrosses,
        formData.adr5,
        formData.todayRange
      ),
      timestamp: nowIso,
      createdAt: editingTrade?.createdAt || editingTrade?.timestamp || nowIso,
      updatedAt: nowIso,
    };

    if (editingTrade) {
      setTrades(prev => prev.map(trade => trade.id === editingTrade.id ? newTrade : trade));
      setEditingTrade(null);
    } else {
      setTrades(prev => [...prev, newTrade]);
    }

    if (isSupabaseConnected && supabaseRef.current) {
      try {
        // Avoid sending fields that may not exist in DB schema
        const { id, date, session, patternType, pair, imageUrl, description, timestamp, confluences, outcome, pips, notes, biasLevel, emaCrosses, adr5, todayRange } = newTrade;
        const baseRecord = { id, date, session, patternType, pair, imageUrl, description, timestamp, confluences, outcome, pips, notes, biasLevel, emaCrosses, adr5, todayRange };
        const upsertRecord = user?.id ? { ...baseRecord, user_id: user.id } : baseRecord;
        await supabaseRef.current.from('trades').upsert(upsertRecord, { onConflict: 'id' });
      } catch (_) {}
    }

    // Reset form
    setFormData({
      date: '',
      session: 'London',
      patternType: 'Type 1',
      pair: 'EURUSD',
      image: null,
      imageUrl: '',
      // Bias-first defaults
      biasLevel: '1',
      emaCrosses: {},
      adr5: '',
      todayRange: '',
      confluences: {},
      outcome: 'Win', // Default to winner
      pips: '',
      notes: ''
    });
    setShowAddForm(false);
    setToast({ type: 'success', message: editingTrade ? 'Trade updated' : 'Trade saved' });
  };

  const deleteTrade = async (id) => {
    const confirmed = window.confirm('Delete this trade? This cannot be undone.');
    if (!confirmed) return;
    setTrades(prev => prev.filter(trade => trade.id !== id));
    if (isSupabaseConnected && supabaseRef.current) {
      try {
        let q = supabaseRef.current.from('trades').delete().eq('id', id);
        if (user?.id) q = q.eq('user_id', user.id);
        await q;
      } catch (_) {}
    }
    setToast({ type: 'success', message: 'Trade deleted' });
  };

  const exportTrades = () => {
    try {
      const dataStr = JSON.stringify(trades, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `btmm-trades-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast({ type: 'success', message: 'Trades exported' });
    } catch (_) {
      setToast({ type: 'error', message: 'Export failed' });
    }
  };

  // Case study image upload (reuse compress)
  const handleLessonImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1600, 0.8);
      setLessonForm((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (_) {}
  };

  const saveLesson = async () => {
    const nowIso = new Date().toISOString();
    let imageUrl = lessonForm.imageUrl;
    try {
      if (isSupabaseConnected && supabaseRef.current && lessonForm.imageUrl?.startsWith('data:')) {
        const blob = dataUrlToBlob(lessonForm.imageUrl);
        const fileName = `lesson-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: upErr } = await supabaseRef.current.storage.from('lesson-images').upload(fileName, blob, { contentType: blob.type, upsert: true });
        if (!upErr) {
          const { data: pub } = supabaseRef.current.storage.from('lesson-images').getPublicUrl(fileName);
          if (pub?.publicUrl) imageUrl = pub.publicUrl;
        }
      }
    } catch (_) {}

    const newLesson = { id: uuidv4(), ...lessonForm, imageUrl, timestamp: nowIso };
    setLessons((prev) => [newLesson, ...prev]);
    try { await idbSet('lessons', [newLesson, ...lessons]); } catch (_) {}
    if (isSupabaseConnected && supabaseRef.current) {
      try {
        const row = user?.id ? { ...newLesson, user_id: user.id } : newLesson;
        await supabaseRef.current.from('case_studies').upsert(row, { onConflict: 'id' });
      } catch (_) {}
    }
    setLessonForm({ title: '', session: 'London', patternType: 'Type 1', tags: '', imageUrl: '', notes: '' });
    setShowLessonModal(false);
    setToast({ type: 'success', message: 'Lesson saved' });
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error('Invalid file');
      const byId = new Map();
      [...trades, ...imported].forEach((t) => {
        if (!t || !t.id) return;
        const existing = byId.get(t.id);
        if (!existing || new Date(t.timestamp) > new Date(existing.timestamp)) {
          byId.set(t.id, t);
        }
      });
      const merged = Array.from(byId.values());
      setTrades(merged);
      if (isSupabaseConnected && supabaseRef.current) {
        try { await supabaseRef.current.from('trades').upsert(merged, { onConflict: 'id' }); } catch (_) {}
      }
      setToast({ type: 'success', message: 'Trades imported' });
    } catch (_) {
      setToast({ type: 'error', message: 'Import failed' });
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const editTrade = (trade) => {
    // Do not carry createdAt/updatedAt into the form fields
    const { createdAt, updatedAt, ...rest } = trade || {};
    setFormData(rest);
    setEditingTrade(trade);
    setShowAddForm(true);
  };

  // Filter trades based on search and filters
  React.useEffect(() => {
    let filtered = trades;
    
    if (selectedDate) {
      filtered = filtered.filter(trade => trade.date === selectedDate);
    }
    
    if (selectedSession) {
      filtered = filtered.filter(trade => trade.session === selectedSession);
    }
    
    if (selectedPattern) {
      filtered = filtered.filter(trade => trade.patternType === selectedPattern);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sorting
    const compare = (a, b) => {
      let av, bv;
      switch (sortBy) {
        case 'date':
          av = a.date || '';
          bv = b.date || '';
          return av.localeCompare(bv);
        case 'pips': {
          const parsePips = (v) => {
            if (!v) return 0;
            const n = parseFloat(String(v).replace(/[^-\d.]/g, ''));
            return isNaN(n) ? 0 : n;
          };
          av = parsePips(a.pips);
          bv = parsePips(b.pips);
          return av - bv;
        }
        case 'patternType':
          av = a.patternType || '';
          bv = b.patternType || '';
          return av.localeCompare(bv);
        case 'session':
          av = a.session || '';
          bv = b.session || '';
          return av.localeCompare(bv);
        case 'timestamp':
        default:
          av = new Date(a.timestamp).getTime();
          bv = new Date(b.timestamp).getTime();
          return av - bv;
      }
    };
    const sorted = [...filtered].sort(compare);
    if (sortDir === 'desc') sorted.reverse();
    setFilteredTrades(sorted);
  }, [trades, selectedDate, selectedSession, selectedPattern, searchTerm, sortBy, sortDir]);

  // Virtualizer for trades list
  const rowVirtualizer = useVirtualizer({
    count: filteredTrades.length,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => 420,
    overscan: 6,
  });

  // Auto-hide toast
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'Win': return 'text-green-600 bg-green-50';
      case 'Loss': return 'text-red-600 bg-red-50';
      case 'Breakeven': return 'text-yellow-600 bg-yellow-50';
      case 'Pending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPatternColor = (pattern) => {
    switch (pattern) {
      case 'Type 1': return 'bg-purple-100 text-purple-800';
      case 'Type 2': return 'bg-blue-100 text-blue-800';
      case 'Type 3': return 'bg-green-100 text-green-800';
      case 'Type 4': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black overflow-x-hidden" role="main" id="main">
      {/* Header */}
      <HeaderBar
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabase={() => setShowSupabaseForm(true)}
        user={user}
        onSignOut={async () => { try { await supabaseRef.current?.auth?.signOut(); setToast({ type: 'success', message: 'Signed out' }); } catch (_) {} }}
        onOpenAuth={() => setShowAuthForm(true)}
        onExport={exportTrades}
        onOpenImport={() => importInputRef.current?.click()}
        importInputRef={importInputRef}
        onAddNew={() => setShowAddForm(true)}
        onImportFileChange={handleImportFile}
        onAddLesson={() => setShowLessonModal(true)}
      />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Filters */}
        <Filters
          sessions={sessions}
          patternTypes={patternTypes}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          selectedPattern={selectedPattern}
          setSelectedPattern={setSelectedPattern}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          onClearFilters={() => { setSelectedDate(''); setSelectedSession(''); setSelectedPattern(''); setSearchInput(''); }}
          searchInputRef={searchInputRef}
        />

        {/* Stats */}
        <StatsBar trades={trades} />

        {/* Case Studies */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Case Studies</h2>
            <button onClick={() => setShowLessonModal(true)} className="px-3 py-2 bg-black/70 border border-yellow-500/30 text-white rounded-lg hover:bg-yellow-900/20 text-sm">Add Lesson</button>
          </div>
          {lessons.length === 0 ? (
            <p className="text-gray-400 text-sm">No lessons yet. Click “Add Lesson” to create your first case study.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map(lsn => (
                <CaseStudyCard key={lsn.id} lesson={lsn} />
              ))}
            </div>
          )}
        </div>

        {/* Trades List (virtualized) */}
        <div className="space-y-6">
          {toast && (
            <div role="status" aria-live="polite" className={`${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'} fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow text-white`}>
              {toast.message}
            </div>
          )}
          {filteredTrades.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-12 text-center border border-yellow-500/30">
              <Camera className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No winning patterns found</h3>
              <p className="text-gray-300 mb-6">Add your first winning trade screenshot to build your pattern recognition library</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-6 py-3 rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-all duration-200 font-semibold shadow-lg"
              >
                Add Winning Trade
              </button>
            </div>
          ) : (
            <div ref={listParentRef} className="overflow-auto max-h-[70vh]">
              <div
                style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const trade = filteredTrades[virtualRow.index];
                  return (
                    <div
                      key={trade.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                      className="pb-6"
                    >
                      <TradeCard
                        trade={trade}
                        isExpanded={expandedTrade === trade.id}
                        onToggleExpand={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                        onEdit={() => editTrade(trade)}
                        onDelete={() => deleteTrade(trade.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Trade Modal */}
      <TradeModal
        isOpen={showAddForm}
        onClose={() => {
                    setShowAddForm(false);
                    setEditingTrade(null);
                    setFormData({
                      date: '',
                      session: 'London',
                      patternType: 'Type 1',
                      pair: 'EURUSD',
                      image: null,
                      imageUrl: '',
                      biasLevel: '1',
                      emaCrosses: {},
                      adr5: '',
                      todayRange: '',
                      confluences: {},
            outcome: 'Win',
                      pips: '',
                      notes: ''
                    });
                  }}
        onSubmit={handleSubmit}
        editingTrade={editingTrade}
        sessions={sessions}
        patternTypes={patternTypes}
        
        pairs={pairs}
        formData={formData}
        setFormData={setFormData}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        confluenceOptions={confluenceOptions}
        handleConfluenceChange={handleConfluenceChange}
      />

      {/* Supabase Settings Modal */}
      <SupabaseSettingsModal
        isOpen={showSupabaseForm}
        supabaseUrl={supabaseUrl}
        setSupabaseUrl={setSupabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        setSupabaseAnonKey={setSupabaseAnonKey}
        isSupabaseConnected={isSupabaseConnected}
        onClose={() => setShowSupabaseForm(false)}
        onTest={async () => {
          try {
            const lib = await loadSupabaseLibrary();
            const c = lib.createClient(supabaseUrl || import.meta.env.VITE_SUPABASE_URL, (supabaseAnonKey === 'env' ? import.meta.env.VITE_SUPABASE_ANON_KEY : supabaseAnonKey) || '');
            const { data, error } = await c.from('trades').select('*').limit(1);
            if (!error) setToast({ type: 'success', message: 'Connection OK' });
            else setToast({ type: 'error', message: 'Connection failed' });
          } catch (_) {
            setToast({ type: 'error', message: 'Connection failed' });
          }
        }}
        onDisconnect={() => {
                    localStorage.removeItem('supabaseUrl');
                    localStorage.removeItem('supabaseAnonKey');
                    supabaseRef.current = null;
                    setIsSupabaseConnected(false);
                    setShowSupabaseForm(false);
                  }}
        onSave={async () => {
                  localStorage.setItem('supabaseUrl', supabaseUrl || '');
                  localStorage.setItem('supabaseAnonKey', supabaseAnonKey || '');
                  if (supabaseUrl && supabaseAnonKey) {
                    try {
                      const lib = await loadSupabaseLibrary();
                      supabaseRef.current = lib.createClient(supabaseUrl, supabaseAnonKey);
                      setIsSupabaseConnected(true);
                    } catch (_) {
                      setIsSupabaseConnected(false);
                    }
                  }
                  setShowSupabaseForm(false);
                }}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={showAuthForm}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        magicSent={magicSent}
        onClose={() => { setShowAuthForm(false); setMagicSent(false); }}
        onSendLink={async () => {
                  if (!supabaseRef.current) return;
                  try {
                    const { error } = await supabaseRef.current.auth.signInWithOtp({ email: authEmail, options: { emailRedirectTo: window.location.href } });
                    if (!error) { setMagicSent(true); setToast({ type: 'success', message: 'Magic link sent' }); }
                  } catch (_) {}
                }}
      />

      {/* Case Study Modal */}
      <CaseStudyModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        onSubmit={saveLesson}
        sessions={sessions}
        patternTypes={patternTypes}
        formData={lessonForm}
        setFormData={setLessonForm}
        fileInputRef={lessonFileRef}
        handleImageUpload={handleLessonImageUpload}
      />
    </div>
  );
};

export default BTMMTradeAnalyzer;