import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, Cat, ChevronLeft, Check, Scissors, Star, UserRound, 
  Wind, Ban, HeartPulse, AlertTriangle, Waves, Zap, Lock, LogOut,
  Droplets, ShieldCheck, Leaf, MessageCircle, Plus, XCircle,
  Trash2, CheckCircle, Info, BarChart3, Banknote, AlertCircle, Sparkles, Gem,
  CalendarDays, Filter, Download, ShieldAlert, History, PlusCircle, Timer,
  PawPrint, Copy, Phone, ExternalLink, ChevronRight, LayoutList, Grid, CalendarOff,
  Lightbulb, Search, FileText, X, AlertOctagon, Loader2, Sparkle
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, deleteDoc, updateDoc } from 'firebase/firestore';

// --- 全域配置 ---
const CONFIG = { lineId: "@051yzbua", adminPw: "moko2025" };
// --- Firebase 鑰匙設定 ---
const firebaseConfig = {
  apiKey: "AIzaSyB-你的金鑰", // 建議之後換成你自己在 Firebase 申請的
  authDomain: "fluffymoko-web.firebaseapp.com",
  projectId: "fluffymoko-web",
  storageBucket: "fluffymoko-web.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefg"
};

// 初始化指令
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const COATS = [
  { id: 'short', label: '短毛（單層毛）', desc: '米克斯、德文、美短、暹羅', prices: { basic: 1100, advanced: 1500 } },
  { id: 'medium', label: '中長毛（雙層毛）', desc: '英短、曼赤肯、加菲', prices: { basic: 1300, advanced: 2000 } },
  { id: 'long', label: '長毛', desc: '布偶、挪威、緬因、金吉拉、波斯、西森', prices: { basic: 1500, advanced: 2500 } }
];

const SPAS = [
  { 
    id: 'milk', name: '奈米微氣泡牛奶賦活浴', price: 400, theme: 'pink', focus: '深層水合・絲滑潤澤', 
    target: '適合狀況：皮膚乾燥脫屑、毛髮易起靜電、換毛期梳理困難、長毛貓維持澎潤觸感。',
    desc: '採用日本專利奈米發生技術。將水分微細化至毛孔 1/100，深度滲透毛鱗片核心注入高倍水分，有效減少洗後靜電，還原綢緞般的垂墜觸感與自然蓬鬆光澤。' 
  },
  { 
    id: 'carbon', name: '高濃度二氧化碳碳酸淨化浴', price: 450, theme: 'cyan', focus: '油脂溶解・循環促進', 
    target: '適合狀況：皮脂分泌旺盛（皮脂溢）、黑尾巴、下巴粉刺、有重油垢者。',
    desc: '透過專用設備產生超高濃度 CO2 分子。獨特的乳化作用能精準溶解堆積在毛孔深層的固態油脂，穩定皮膚弱酸性障壁，讓毛囊重新呼吸，針對黑尾巴與重油垢效果顯著。' 
  },
  { 
    id: 'ozone', name: '活性氧臭氧防護療癒浴', price: 500, theme: 'purple', focus: '物理滅菌・強效除臭', recommended: true,
    target: '適合狀況：多貓家庭接觸頻繁、免疫力較低、皮膚敏感抓癢、曾有黴菌康復後之日常防護。',
    desc: '利用活性氧強大的物理氧化能力，瓦解異味蛋白質分子與環境細菌。在皮膚表層建立物理性防護網，減少外在細菌附著，提升皮膚對環境的防禦力。' 
  }
];

const ADDONS = [
  { id: 'mud', name: '日本微米草本賦活泥', price: 850, theme: 'green', icon: <Leaf size={24}/>, focus: '深層代謝 ｜ 極致澎潤', desc: '選用日本微米級天然草本粉末。利用物理吸附力深層剝離毛孔中的老廢角質與髒汙。同步注入植物萃取精華，還原貓咪被毛驚人的空氣感。' },
  { id: 'nano', name: '奈米深層淨膚理療', price: 300, theme: 'blue', icon: <ShieldCheck size={24}/>, focus: '化學微粒 ｜ 環境修復', desc: '專為長期處於二手菸、拜香油煙或環境粉塵環境的貓咪設計。利用奈米級微細成分精準乳化剝離孔隙中頑固的化學微粒，徹底還原貓咪最初的潔淨本質。' }
];

const LIGHT_ADDONS = [
  { id: 'ceramide', name: '科研神經醯胺保濕', price: 100, icon: <Droplets size={18}/>, desc: '在皮膚表面形成透氣鎖水網，修補受損障壁，預防乾癢，提升表皮結構穩固度。' },
  { id: 'pearl', name: '極致珠光賦活養護', price: 500, icon: <Gem size={18}/>, desc: '頂規賦活配方，透過多重胺基酸修復毛髮受損，賦予珍珠般光澤。' }
];

const TIME_SLOTS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
const t2m = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };

// 初始化 Firebase
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0); 
  const [pw, setPw] = useState('');
  const [adminMonth, setAdminMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Data State handled by Firebase sync
  const [data, setData] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [booking, setBooking] = useState({ parent: '', phone: '', cat: '', coat: 'short', weight: 4, type: 'basic', spas: [], addons: [], date: '', time: '', agree: false });
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualBooking, setManualBooking] = useState({ cat: '', date: '', time: '11:00', duration: 120 });
  const [copyMsg, setCopyMsg] = useState(null);
  
  // 查詢功能狀態
  const [searchPhone, setSearchPhone] = useState('');
  const [memberHistory, setMemberHistory] = useState([]);
  
  // V78: Step 1 內建查詢狀態
  const [quickSearchPhone, setQuickSearchPhone] = useState('');
  const [quickSearchResult, setQuickSearchResult] = useState(null);
  
  // 契約與刪除 Modal 狀態
  const [showContract, setShowContract] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 提交載入狀態
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin 視圖模式
  const [adminView, setAdminView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 滾動參考
  const scrollRef = useRef(null);

  // --- Firebase Auth & Data Sync ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // 預約資料
    const bookingsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'));
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(fetchedData);
    }, (error) => console.error("Error fetching bookings:", error));

    // 休假資料
    const holidaysRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'holidays');
    const unsubHolidays = onSnapshot(holidaysRef, (docSnap) => {
      if (docSnap.exists()) {
        setHolidays(docSnap.data().dates || []);
      }
    }, (error) => console.error("Error fetching holidays:", error));

    return () => {
      unsubBookings();
      unsubHolidays();
    };
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  // --- 邏輯計算 ---
  const wExtra = useMemo(() => booking.weight >= 6 ? Math.ceil(booking.weight - 5.99) * 100 : 0, [booking.weight]);
  const cost = useMemo(() => {
    try {
      const c = COATS.find(x => x.id === booking.coat) || COATS[0];
      const base = c.prices[booking.type] || 0;
      const sPrice = (booking.type === 'basic' && booking.spas.length > 0) ? (SPAS.find(x => x.id === booking.spas[0])?.price || 0) : 0;
      const aPrice = booking.addons.reduce((acc, id) => {
        const item = [...ADDONS, ...LIGHT_ADDONS].find(a => a.id === id);
        return acc + (item?.price || 0);
      }, 0);
      return base + sPrice + aPrice + wExtra;
    } catch (e) { return 0; }
  }, [booking, wExtra]);

  const blockedSlots = useMemo(() => {
    if (!booking.date) return [];
    return data.filter(b => b.date === booking.date && b.status === 'confirmed').flatMap(b => {
      const start = t2m(b.time);
      const end = start + (b.duration || 90);
      return TIME_SLOTS.filter(s => t2m(s) >= start && t2m(s) < end);
    });
  }, [booking.date, data]);

  const filteredAdminData = useMemo(() => data.filter(b => b.date?.startsWith(adminMonth)), [data, adminMonth]);
  const monthlyRevenue = useMemo(() => filteredAdminData.filter(b => b.status === 'confirmed').reduce((sum, item) => sum + (item.price || 0), 0), [filteredAdminData]);

  const groups = useMemo(() => {
    const gs = {};
    filteredAdminData.forEach(b => { if(!gs[b.date]) gs[b.date]=[]; gs[b.date].push(b); });
    return Object.keys(gs).sort().map(d => ({ date: d, items: gs[d].sort((x,y)=>x.time.localeCompare(y.time)) }));
  }, [filteredAdminData]);

  const calendarDays = useMemo(() => {
    const [y, m] = adminMonth.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [adminMonth]);

  // --- 操作函數 ---
  const handleAdminLogin = () => { if (pw === CONFIG.adminPw) { setStep(100); setPw(''); } };
  
  const updateStatus = async (id, s) => {
    if (!user) return;
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', id), { status: s });
    } catch (e) { console.error("Update failed", e); }
  };
  
  const updateDuration = async (id, mins) => {
    if (!user) return;
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', id), { duration: parseInt(mins) });
    } catch (e) { console.error("Update duration failed", e); }
  };
  
  const initiateDelete = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (deleteTargetId && user) {
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', deleteTargetId));
        } catch (e) { console.error("Delete failed", e); }
        setDeleteTargetId(null);
    }
  };
  
  const addManualRecord = async () => {
    if (!manualBooking.cat || !manualBooking.date || !user) return;
    const newBooking = { 
        ...manualBooking, 
        id: String(Date.now()), 
        status: 'confirmed', 
        service: '手動登記', 
        price: 0, 
        parent: '手動登記', 
        phone: 'N/A' 
    };
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', newBooking.id), newBooking);
        setShowAddForm(false);
    } catch (e) { console.error("Manual add failed", e); }
  };

  const toggleHoliday = async (dateStr) => {
    if (!user) return;
    const newHolidays = holidays.includes(dateStr) ? holidays.filter(d => d !== dateStr) : [...holidays, dateStr];
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'holidays'), { dates: newHolidays });
    } catch (e) { console.error("Holiday update failed", e); }
  };

  const handleSearchHistory = () => {
    if (!searchPhone) return;
    const history = data.filter(d => d.phone === searchPhone && d.status === 'confirmed').sort((a,b) => new Date(b.date) - new Date(a.date));
    setMemberHistory(history);
  };

  // V78: Step 1 內建搜尋邏輯
  const handleQuickSearch = () => {
    if(!quickSearchPhone) return;
    // 找最近一筆成功的訂單
    const found = data.filter(d => d.phone === quickSearchPhone && d.status === 'confirmed')
                      .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    if(found) {
        setQuickSearchResult(found);
    } else {
        alert('查無此電話的歷史預約紀錄');
        setQuickSearchResult(null);
    }
  };

  const applyQuickSearch = () => {
    if(quickSearchResult) {
        setBooking(prev => ({
            ...prev,
            parent: quickSearchResult.parent,
            phone: quickSearchResult.phone,
            cat: quickSearchResult.cat,
            coat: quickSearchResult.coat || 'short',
            weight: quickSearchResult.weight || 4,
            type: quickSearchResult.type || 'basic',
            spas: quickSearchResult.spas || [],
            addons: quickSearchResult.addons || [],
        }));
        setQuickSearchResult(null);
    }
  };

  const rebook = (item) => {
    setBooking({
        parent: item.parent,
        phone: item.phone,
        cat: item.cat,
        coat: item.coat || 'short',
        weight: item.weight || 4,
        type: item.type || 'basic',
        spas: item.spas || [],
        addons: item.addons || [],
        date: '',
        time: '',
        agree: true
    });
    setStep(1);
  };

  const submitBooking = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const newBooking = { 
        id: String(Date.now()), 
        ...booking, 
        duration: booking.type === 'advanced' ? 120 : 90, 
        status: 'pending', 
        price: cost, 
        service: booking.type==='basic'?'日常美容':'高階賦活' 
    };
    
    setTimeout(async () => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', newBooking.id), newBooking);
            setIsSubmitting(false);
            setStep(4);
        } catch (e) {
            console.error("Submit failed", e);
            setIsSubmitting(false);
            alert("預約提交失敗，請檢查網路連線");
        }
    }, 1500);
  };

  const copyOrderText = (item) => {
    const text = `【Moko 預約確認】\n貓咪：${item.cat}\n日期：${item.date}\n時間：${item.time}\n服務：${item.service}\n預收金額：$${item.price}\n聯絡電話：${item.phone}`;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); } catch (err) { console.error('Copy failed', err); }
    document.body.removeChild(textArea);
    setCopyMsg(item.id);
    setTimeout(() => setCopyMsg(null), 2000);
  };

  const addToCalendar = (item) => {
    const dateStr = item.date.replace(/-/g, '');
    const [h, m] = item.time.split(':');
    const start = `${dateStr}T${h}${m}00`;
    const durMins = item.duration || 90;
    const endH = String(parseInt(h) + Math.floor((parseInt(m) + durMins) / 60)).padStart(2, '0');
    const endM = String((parseInt(m) + durMins) % 60).padStart(2, '0');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:預約:${item.cat}(${item.service})\nDTSTART:${start}\nDTEND:${dateStr}T${endH}${endM}00\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob);
    link.download = `Moko_${item.cat}.ics`; link.click();
  };

  const getLineLink = () => {
    const sName = booking.spas.length > 0 ? SPAS.find(s=>s.id===booking.spas[0])?.name : '無';
    const text = `【FluffyMoko 預約申請】\n\n🐾 貓咪姓名：${booking.cat}\n👤 家長：${booking.parent}\n📞 電話：${booking.phone}\n📅 日期：${booking.date}\n⏰ 時間：${booking.time}\n✨ 方案：${booking.type==='basic'?'日常美容':'高階賦活'}\n🛁 SPA：${sName}\n💰 預估金額：$${cost}\n\n---\n※ 實際美容時間及價格，依現場看到貓咪體型、毛量為主。`;
    return `https://line.me/R/oaMessage/${CONFIG.lineId}/?${encodeURIComponent(text)}`;
  };

  const Progress = ({s}) => (
    <div className="flex-1 flex justify-between ml-6 relative">
      <div className="absolute top-3.5 left-6 right-6 h-[1px] bg-[#D7C4A3]/30 -z-0"></div>
      {[1,2,3,4].map(i => (
        <div key={i} className="flex flex-col items-center flex-1 relative z-10 text-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${s>=i?'bg-[#8B5E3C] border-[#8B5E3C] text-white shadow-md scale-110':'bg-white border-[#D7C4A3] text-[#D7C4A3]'}`}>{s>i?<Check size={14}/>:i}</div>
          <div className={`text-[10px] mt-2 font-bold tracking-tight ${s>=i?'text-[#8B5E3C]':'text-[#D7C4A3]'}`}>{['資訊','養護','時段','核對'][i-1]}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6F0] to-[#F3EFE7] text-[#4A3728] font-sans text-left overflow-x-hidden pb-10 selection:bg-[#8B5E3C]/20">
      {/* Header */}
      <nav className="max-w-lg mx-auto px-6 py-6 flex justify-between items-center bg-[#F9F6F0]/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStep(0)}>
          <div className="w-10 h-10 bg-[#8B5E3C] rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform"><PawPrint size={22}/></div>
          <div><h1 className="font-black text-xl leading-none tracking-tight text-[#4A3728]">FluffyMoko</h1><p className="text-[9px] font-bold text-[#8B5E3C] uppercase mt-0.5 tracking-widest text-left">Cat Wellness Salon</p></div>
        </div>
        <button onClick={() => setStep(step === 100 ? 0 : 99)} className="p-2.5 text-[#8B5E3C] hover:bg-[#8B5E3C]/10 rounded-2xl transition-all active:scale-95">
          {step === 100 ? <LogOut size={20}/> : <Lock size={20}/>}
        </button>
      </nav>

      <main className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#8B5E3C]/5 border border-[#D7C4A3]/10 min-h-[720px] flex flex-col overflow-hidden transition-all duration-300 relative text-left">
          
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div ref={scrollRef} className="p-8 flex flex-col flex-1 overflow-y-auto no-scrollbar text-left">
              <div className="text-center mb-10"><h2 className="text-xl md:text-2xl font-black leading-snug text-[#4A3728]">我們幫貓整理的，不只是毛，<br/>還有情緒、節奏，<br/>和那一點點需要被尊重的界線。</h2><div className="w-12 h-1.5 bg-[#8B5E3C]/20 mx-auto rounded-full mt-6"></div></div>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                 <div className="p-6 bg-white border border-[#D7C4A3]/20 rounded-[2rem] flex flex-col items-center shadow-sm"><UserRound size={26} className="text-[#8B5E3C] mb-2"/><span className="text-[12px] font-black text-[#4A3728]">純貓空間</span><p className="text-[9px] text-[#D7C4A3] mt-1 font-bold uppercase tracking-widest text-center">Exclusive Cats</p></div>
                 <div className="p-6 bg-white border border-[#D7C4A3]/20 rounded-[2rem] flex flex-col items-center shadow-sm"><Wind size={26} className="text-[#8B5E3C] mb-2"/><span className="text-[12px] font-black text-center">全程手吹</span><p className="text-[9px] text-[#D7C4A3] mt-1 font-bold uppercase tracking-tighter text-center">No Dryer Box</p></div>
              </div>
              
              {/* V60 新增：會員查詢按鈕 (移至首頁) */}
              <div className="mb-8">
                 <button onClick={() => setStep(50)} className="w-full bg-[#FDFBF7] text-[#8B5E3C] py-4 rounded-[1.5rem] font-black shadow-sm border border-[#D7C4A3]/30 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-white"><Search size={18}/> 查詢我的歷史預約</button>
              </div>

              {/* 1. 核心理念 */}
              <div className="space-y-6 mb-8 text-[11px] font-medium text-[#6B5A4E]">
                <div className="bg-white p-7 rounded-[2rem] border border-[#D7C4A3]/30 shadow-sm space-y-8">
                  <div>
                    <p className="flex gap-2 items-center text-[#8B5E3C] font-black text-[14px] mb-2 tracking-tight"><Scissors size={16}/> 堅持「不剃毛」護理理念</p>
                    <p className="leading-relaxed pl-6">貓咪被毛具備調節體溫的天然屏障。剃毛會導致貓咪失去保護，大幅增加灼傷與失溫風險，並造成高度心理應激。除醫療診斷必要外，我們堅守被毛的防禦本質，確保孩子在美容過程中維持身心穩定。</p>
                  </div>
                  <div className="border-t border-[#D7C4A3]/10 pt-6">
                    <p className="flex gap-2 items-center text-[#8B5E3C] font-black text-[14px] mb-2 tracking-tight"><HeartPulse size={16}/> 秉持「不主動擠肛門腺」原則</p>
                    <p className="leading-relaxed pl-6">正常貓咪會隨排便自然排空腺體。不當的人工擠壓屬於侵入性刺激，容易造成腺體發炎甚至心理恐懼。除非醫療診斷確有阻塞需求，否則我們不主動操作，尊重其自然生理循環與健康穩定。</p>
                  </div>
                </div>
              </div>

              {/* 2. 法規聲明 */}
              <div className="mb-8 bg-red-50/60 border border-red-100 rounded-[2rem] p-7 space-y-4">
                <div className="flex items-center gap-2 text-red-700 font-black tracking-widest uppercase text-left"><ShieldAlert size={18}/> 重要法規與健康聲明</div>
                <div className="space-y-4 text-[11px] font-medium text-red-900/80">
                  <p className="leading-relaxed">
                    ● <span className="font-black underline text-red-800">醫療禁忌提醒</span>：若貓咪患有「酵母菌感染」、「耳疥蟲」或「黴菌/皮癬」等皮膚病症，本館依法無法進行處理。請務必先就醫完成療程後再預約。
                  </p>
                  <div className="pt-3 border-t border-red-100/50">
                    <p className="font-black text-red-800 mb-1 text-left">● 關於藥浴法律聲明：</p>
                    <p className="leading-relaxed pl-1 text-left">
                      根據台灣《獸醫師法》，具有醫療療效之「藥浴」涉及處方診斷，必須由專業醫師執行。美容師依法不得代客執行藥浴服務。本館僅提供頂級科研機能配方之賦活養護洗沐。
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 特殊規費 */}
              <div className="mb-10 bg-orange-50/60 p-7 rounded-[2rem] border border-orange-200/60 space-y-5 text-[11px] font-bold">
                 <div className="flex items-center gap-2 text-orange-700 font-black tracking-widest uppercase text-left"><AlertTriangle size={16}/> 特殊規費與補償條款</div>
                 <div className="space-y-1.5 text-left text-left"><div className="flex justify-between items-center text-orange-800 font-black text-left"><span>環境深度消毒費</span><span>$6000</span></div><p className="text-[#6B5A4E] font-medium">經現場確認貓咪具傳染病、大量跳蚤適用。包含全店封館深度消毒成本。</p></div>
                 <div className="space-y-1.5 pt-3 border-t border-orange-200/50">
                    <div className="flex justify-between items-center text-orange-800 font-black"><span>人員受傷補償金</span><span>$1000 - $2000</span></div>
                    <p className="text-[#6B5A4E] font-medium text-left">若因貓咪攻擊致工作人員受傷就醫適用。含急診掛號、傷口處置與必要疫苗支出。金額視實際傷勢核計。</p>
                    <p className="text-[#8B5E3C] font-black text-[10px] mt-2 bg-orange-100/80 p-2.5 rounded-xl leading-relaxed border border-orange-200 italic">每一次受傷都會造成美容師永久的職業傷害，重則斷送美容生涯。</p>
                 </div>
              </div>

              <button onClick={() => setStep(1)} className="mt-auto w-full bg-[#8B5E3C] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-[#8B5E3C]/20 active:scale-95 transition-all text-center tracking-[0.1em] uppercase hover:bg-[#7A5235]">開始預約專屬護理</button>
            </div>
          )}
          
          {/* Step 50: 會員歷史查詢 */}
          {step === 50 && (
             <div ref={scrollRef} className="p-8 flex flex-col flex-1 overflow-y-auto no-scrollbar text-left animate-in fade-in zoom-in-95">
               <div className="flex items-center mb-10 text-left">
                <button onClick={()=>setStep(0)} className="w-12 h-12 rounded-2xl border border-[#D7C4A3]/40 flex items-center justify-center text-[#D7C4A3] hover:bg-white active:scale-90 transition-all shadow-sm shrink-0"><ChevronLeft size={22}/></button>
                <h2 className="text-xl font-black text-[#4A3728] ml-4">預約紀錄查詢</h2>
               </div>

               <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-[#D7C4A3]/20 mb-8 flex items-center pr-2">
                  <div className="flex-1 flex flex-col px-4 py-2">
                    <label className="text-[9px] font-black text-[#D7C4A3] uppercase tracking-widest mb-0.5">預約電話</label>
                    <input type="tel" value={searchPhone} onChange={e=>setSearchPhone(e.target.value)} placeholder="09xxxxxxxx" className="w-full bg-transparent outline-none font-black text-sm text-[#4A3728] placeholder:text-[#D7C4A3]/40"/>
                  </div>
                  <button onClick={handleSearchHistory} className="bg-[#8B5E3C] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"><Search size={20}/></button>
               </div>

               <div className="space-y-4">
                  {memberHistory.length > 0 ? memberHistory.map(record => (
                     <div key={record.id} className="bg-white p-5 rounded-[2rem] border border-[#D7C4A3]/10 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                           <div>
                              <span className="text-[10px] text-[#D7C4A3] font-bold">{record.date}</span>
                              <h3 className="font-black text-[#4A3728] text-lg">{record.cat}</h3>
                           </div>
                           <div className="text-right">
                              <span className="text-sm font-black text-[#8B5E3C] block">${record.price}</span>
                              <span className="text-[9px] font-bold text-white bg-[#8B5E3C] px-2 py-0.5 rounded-full">{record.type === 'advanced' ? '高階' : '日常'}</span>
                           </div>
                        </div>
                        <div className="text-[11px] text-[#6B5A4E] bg-gray-50 p-3 rounded-xl border border-gray-100">
                           {record.service} 
                           {record.spas && record.spas.length > 0 && ` + ${SPAS.find(s=>s.id===record.spas[0])?.name}`}
                           {record.addons && record.addons.length > 0 && ` + 理療`}
                        </div>
                        <button onClick={() => rebook(record)} className="w-full py-3 mt-1 bg-[#FDFBF7] text-[#8B5E3C] font-black text-xs rounded-xl border border-[#D7C4A3]/30 hover:bg-[#8B5E3C] hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95">
                           <History size={14}/> 照此紀錄再次預約
                        </button>
                     </div>
                  )) : (
                     searchPhone && <div className="text-center py-12 opacity-40"><p className="text-[#4A3728] text-xs font-bold">查無此號碼的預約紀錄</p></div>
                  )}
               </div>
             </div>
          )}

          {/* Step 1: Info */}
          {step === 1 && (
            <div ref={scrollRef} className="p-8 flex flex-col flex-1 overflow-y-auto animate-in fade-in slide-in-from-right-4 no-scrollbar text-left text-left">
              <div className="flex items-center mb-10 text-left">
                <button onClick={()=>setStep(0)} className="w-12 h-12 rounded-2xl border border-[#D7C4A3]/40 flex items-center justify-center text-[#D7C4A3] hover:bg-white active:scale-90 transition-all shadow-sm shrink-0"><ChevronLeft size={22}/></button>
                <Progress s={1}/>
              </div>
              
              {/* V78: 老朋友快搜 (Step 1 專用) */}
              <div className="mb-8 p-5 bg-[#8B5E3C]/5 rounded-[2rem] border border-[#8B5E3C]/10 text-left">
                <div className="flex items-center gap-2 text-[11px] font-black text-[#8B5E3C] mb-3 uppercase tracking-widest"><Sparkle size={14}/> 老朋友快搜</div>
                <div className="flex gap-2">
                   <input type="tel" value={quickSearchPhone} onChange={e=>setQuickSearchPhone(e.target.value)} placeholder="輸入電話自動帶入資料" className="flex-1 bg-white p-3 rounded-xl text-sm font-black text-[#4A3728] border border-[#D7C4A3]/20 focus:border-[#8B5E3C] outline-none"/>
                   <button onClick={handleQuickSearch} className="bg-[#8B5E3C] text-white px-4 rounded-xl shadow-sm active:scale-95 transition-all"><Search size={18}/></button>
                </div>
                {quickSearchResult && (
                    <div className="mt-3 bg-white p-3 rounded-xl border border-[#D7C4A3]/20 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                        <div>
                            <span className="text-[10px] text-[#D7C4A3] font-bold">最近一次：{quickSearchResult.date}</span>
                            <div className="font-black text-[#4A3728]">{quickSearchResult.cat}</div>
                        </div>
                        <button onClick={applyQuickSearch} className="bg-[#FDFBF7] text-[#8B5E3C] px-3 py-1.5 rounded-lg text-[10px] font-black border border-[#D7C4A3]/30 hover:bg-[#8B5E3C] hover:text-white transition-all">代入此紀錄</button>
                    </div>
                )}
              </div>

              <div className="space-y-7 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <section><label className="text-[10px] font-black text-[#D7C4A3] mb-2 block uppercase tracking-widest ml-1 text-left">家長姓名</label>
                  <input value={booking.parent} onChange={e=>setBooking({...booking, parent:e.target.value})} placeholder="您的姓名" className="w-full bg-white p-4 rounded-2xl border border-[#D7C4A3]/20 outline-none font-bold text-sm text-[#4A3728] focus:border-[#8B5E3C] transition-all placeholder:text-[#D7C4A3]/50 shadow-sm"/></section>
                  <section><label className="text-[10px] font-black text-[#D7C4A3] mb-2 block uppercase tracking-widest ml-1 text-left">聯繫電話</label>
                  <input value={booking.phone} onChange={e=>setBooking({...booking, phone:e.target.value})} placeholder="手機號碼" className="w-full bg-white p-4 rounded-2xl border border-[#D7C4A3]/20 outline-none font-bold text-sm text-[#4A3728] focus:border-[#8B5E3C] transition-all placeholder:text-[#D7C4A3]/50 shadow-sm"/></section>
                </div>
                <section><label className="text-[10px] font-black text-[#D7C4A3] mb-2 block uppercase tracking-widest ml-1 text-left">貓咪姓名</label>
                <input value={booking.cat} onChange={e=>setBooking({...booking, cat:e.target.value})} placeholder="大名" className="w-full bg-white p-4 rounded-2xl border border-[#D7C4A3]/20 outline-none font-bold text-sm text-[#4A3728] focus:border-[#8B5E3C] transition-all placeholder:text-[#D7C4A3]/50 shadow-sm"/></section>
                
                {/* 毛量 */}
                <section className="space-y-3">{COATS.map(c => (
                    <button key={c.id} onClick={()=>setBooking({...booking, coat:c.id})} className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${booking.coat===c.id?'border-[#8B5E3C] bg-[#8B5E3C]/5 shadow-md text-left':'bg-white border-[#D7C4A3]/10 shadow-sm hover:border-[#8B5E3C]/30 text-left'}`}>
                      <div className="flex justify-between items-center font-black text-[15px] mb-1"><span>{c.label}</span><span className="text-[#8B5E3C] tracking-tighter text-right">${c.prices.basic} / ${c.prices.advanced}</span></div>
                      <p className="text-[10px] text-[#D7C4A3] font-bold">{c.desc}</p>
                    </button>
                ))}</section>

                {/* 折耳貓警語 */}
                <div className="p-6 bg-red-50/50 border border-red-200 rounded-[2rem] space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-red-600 font-black text-[12px] uppercase"><Ban size={18}/> 重要：本館不接收折耳貓預約</div>
                    <p className="text-[10px] font-medium text-red-800 leading-relaxed text-left">
                        折耳貓天生患有骨骼遺傳疾病（軟骨發育不全），其關節極其脆弱且長期處於慢性疼痛中。美容過程中的固定擺位、洗沐掙扎均極易引發骨折、發病或不可逆的痛楚。為了貓咪福祉與生命安全，本館不承接折耳貓服務。
                    </p>
                </div>

                <section className="p-6 bg-white rounded-[2rem] border border-[#D7C4A3]/30 shadow-sm">
                  <div className="flex justify-between text-[11px] font-black text-[#D7C4A3] mb-4 uppercase tracking-widest text-left">體重估計 ({booking.weight}kg)</div>
                  <input type="range" min="1" max="15" step="0.1" value={booking.weight} onChange={e=>setBooking({...booking, weight:parseFloat(e.target.value)})} className="w-full h-1.5 bg-[#D7C4A3]/30 rounded-full accent-[#8B5E3C] appearance-none cursor-pointer"/>
                  <div className="text-[10px] mt-4 font-bold text-orange-800 bg-[#FDFBF7] p-3.5 rounded-xl border border-orange-100 flex justify-between items-center">
                    <span>● 6kg 起每 1kg 加收 $100</span><span className="text-[#8B5E3C] font-black text-xs">試算加收: ${wExtra}</span>
                  </div>
                </section>
                
                {/* 方案選擇 (詳述優化) */}
                <div className="grid grid-cols-1 gap-4 text-left">
                  <div onClick={()=>setBooking({...booking, type:'basic', spas: []})} className={`p-7 rounded-[2.5rem] border-2 cursor-pointer transition-all active:scale-95 ${booking.type==='basic'?'border-[#8B5E3C] bg-[#8B5E3C]/5 shadow-md text-left':'bg-white border-gray-100 shadow-sm hover:border-[#8B5E3C]/30 text-left'}`}>
                    <div className="flex items-center gap-2 font-black text-sm mb-3"><Scissors size={18} className="text-[#8B5E3C]"/> 日常美容 (純淨基礎維護)</div>
                    <div className="flex items-center gap-2 mb-4 bg-white/80 w-fit px-3 py-1.5 rounded-xl border border-black/5 text-left"><Clock size={12} className="text-[#8B5E3C]"/><span className="text-[10px] font-black tracking-tight text-[#6B5A4E]">作業時長：約 1.5 小時起</span></div>
                    <ul className="text-[11px] font-medium text-[#6B5A4E] space-y-1.5 text-left">
                        <li>● 核心衛生：剪甲、精細耳道清理、腳底衛生毛修剪。</li>
                        <li>● 養護流程：低敏雙道深度洗沐、職人全程純手吹、梳理除塵。</li>
                        <li>● 適合對象：僅需定期維持潔淨，無特定重度油脂堆積困擾者。</li>
                    </ul>
                  </div>
                  <div onClick={()=>setBooking({...booking, type:'advanced', spas: booking.spas.length > 0 ? [booking.spas[0]] : []})} className={`p-7 rounded-[2.5rem] border-2 cursor-pointer transition-all relative active:scale-95 ${booking.type==='advanced'?'border-[#8B5E3C] bg-[#8B5E3C]/5 shadow-md text-left':'bg-white border-gray-100 shadow-sm hover:border-[#8B5E3C]/30 text-left'}`}>
                    <div className="absolute -top-3 right-6 bg-[#8B5E3C] text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg animate-pulse uppercase tracking-widest text-center">深度護理推薦</div>
                    <div className="flex items-center gap-2 font-black text-sm mb-3 text-[#4A3728]"><Star size={18} className="text-[#8B5E3C]"/> 高階機能賦活養護 (深度調理)</div>
                    <div className="flex items-center gap-2 mb-4 bg-[#8B5E3C]/10 w-fit px-3 py-1.5 rounded-xl border border-[#8B5E3C]/10 text-left"><Clock size={12} className="text-[#8B5E3C]"/><span className="text-[10px] font-black text-[#8B5E3C] tracking-tight">作業時長：約 2 小時起</span></div>
                    <ul className="text-[11px] font-medium text-[#6B5A4E] space-y-3 text-left">
                        <li>● 專利技術：針對黑下巴、黑尾巴及重度皮脂溢進行多道式科學乳化分解程序。徹底清除堵塞毛囊之固體脂質髒垢。</li>
                        <li>● 尊享價值：方案內含價值 $500「專業 SPA 賦活浴」三選一，並導入高效修復精華，還原毛髮驚人的蓬鬆空氣感與洗後長效清爽。</li>
                        <li>● 適合對象：有重油垢困擾、皮脂分泌旺盛或追求極致蓬鬆感與皮膚防禦力者。</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 text-left"><Info size={16} className="text-orange-600 shrink-0"/><p className="text-[11px] font-bold text-orange-900 leading-relaxed text-left">實際美容時間、金額依照現場看到貓咪體型、毛量為主。</p></div>
                
                <label className="flex items-start gap-4 p-6 bg-white rounded-[2rem] border border-[#D7C4A3]/30 cursor-pointer group transition-all shadow-sm text-left">
                    <input type="checkbox" checked={booking.agree} onChange={e => setBooking({...booking, agree: e.target.checked})} className="mt-1 w-5 h-4 rounded text-[#8B5E3C] focus:ring-[#8B5E3C] cursor-pointer"/>
                    <div className="text-[11px] font-medium text-[#6B5A4E] leading-relaxed group-hover:text-[#4A3728] text-left">我確認貓咪目前無疾病。了解應激風險、時長提示、補償費與法規聲明。</div>
                </label>
              </div>
              
              <div className="flex gap-3 mt-10 w-full text-center">
                <button onClick={()=>setStep(0)} className="w-20 h-20 rounded-[1.8rem] bg-white border-2 border-[#D7C4A3]/30 flex items-center justify-center text-[#D7C4A3] hover:bg-[#FDFBF7] active:scale-90 transition-all shrink-0 shadow-sm"><ChevronLeft size={28}/></button>
                <button disabled={!booking.cat || !booking.agree} onClick={()=>setStep(2)} className="flex-1 py-5 bg-[#8B5E3C] text-white rounded-[1.8rem] font-black shadow-2xl shadow-[#8B5E3C]/20 active:scale-95 transition-all text-center tracking-widest uppercase hover:bg-[#7A5235]">下一步：選擇內容 (${cost})</button>
              </div>
            </div>
          )}

          {/* Step 2: SPA */}
          {step === 2 && (
            <div ref={scrollRef} className="p-8 flex-1 flex flex-col overflow-y-auto pb-32 animate-in fade-in slide-in-from-right-4 no-scrollbar">
              <div className="flex items-center mb-10 text-left">
                <button onClick={()=>setStep(1)} className="w-12 h-12 rounded-2xl border border-[#D7C4A3]/40 flex items-center justify-center text-[#D7C4A3] hover:bg-[#FDFBF7] active:scale-90 shadow-sm shrink-0 transition-all"><ChevronLeft size={22}/></button>
                <Progress s={2}/>
              </div>
              
              {/* SPA 頁面提示 */}
              {booking.type === 'basic' && (
                <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-3xl flex gap-3 items-start animate-pulse">
                  <Lightbulb size={24} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-[#4A3728] text-sm mb-1">小提醒</h4>
                    <p className="text-[11px] font-medium text-blue-800 leading-relaxed">一般美容方案不含 SPA 與理療。如無加購需求，可直接點擊下方「下一步」跳過此頁。</p>
                  </div>
                </div>
              )}

              <h3 className="text-md font-black text-[#8B5E3C] flex items-center gap-2 mb-8 text-left"><Waves size={22}/> 專業機能養護方案詳述</h3>
              <div className="space-y-12 flex-1">
                <section className="space-y-6 text-left">
                  <p className="text-[10px] font-black text-[#D7C4A3] uppercase tracking-widest text-left">SPA 賦活浴詳述 ({booking.type === 'advanced' ? '方案內含・擇一' : '單項加購'})</p>
                  <div className="grid grid-cols-1 gap-6">
                  {SPAS.map(s => {
                    const active = booking.spas.includes(s.id);
                    const themes = { pink: 'border-pink-300 bg-white text-pink-900 shadow-md', cyan: 'border-cyan-300 bg-white text-cyan-900 shadow-md', purple: 'border-indigo-300 bg-white text-indigo-900 shadow-md' };
                    return (
                        <div key={s.id} onClick={()=>{ setBooking({...booking, spas: [s.id]}); }} className={`group p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col gap-5 relative active:scale-[0.98] ${active ? themes[s.theme] + ' scale-[1.02]' : 'border-[#D7C4A3]/20 bg-white hover:shadow-md'}`}>
                          {s.recommended && <div className="absolute -top-3 right-8 bg-[#8B5E3C] text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg animate-bounce text-center uppercase tracking-widest">店長推薦</div>}
                          <div className="flex justify-between items-center"><div className="flex items-center gap-5"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-center ${active ? 'bg-white shadow-inner' : 'bg-gray-50 text-[#4A3728] shadow-sm'}`}><Zap size={28}/></div><div><div className="text-md font-black tracking-tight text-[#4A3728]">{s.name}</div><div className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-70' : 'text-[#D7C4A3]'}`}>{s.focus}</div></div></div><span className="text-[13px] font-black text-[#8B5E3C] text-right">{booking.type === 'advanced' ? '方案內含' : `$${s.price}`}</span></div>
                          <p className={`p-5 rounded-[1.5rem] text-[11px] font-bold leading-relaxed bg-white/50 border border-black/5 ${active ? 'text-gray-900' : 'text-[#6B5A4E]'}`}>{s.target}</p>
                          <p className={`text-[11px] font-medium leading-relaxed px-1 ${active ? 'opacity-90' : 'text-[#D7C4A3]'}`}>{s.desc}</p>
                        </div>
                    );
                  })}
                  </div>
                </section>

                <section className="space-y-8 text-left">
                  <p className="text-[10px] font-black text-[#D7C4A3] uppercase tracking-widest pl-1 text-left">專業進階理療詳述</p>
                  <div className="grid grid-cols-1 gap-7">
                     {ADDONS.map(a => {
                        const active = booking.addons.includes(a.id);
                        const themes = { green: 'border-green-600 bg-white text-green-900 shadow-md', blue: 'border-blue-600 bg-white text-blue-900 shadow-md' };
                        const defaultStyle = a.id === 'mud' ? 'border-green-200 text-green-800' : 'border-blue-200 text-blue-800';
                        
                        return (
                          <div key={a.id} onClick={() => setBooking({...booking, addons: active ? booking.addons.filter(i=>i!==a.id) : [...booking.addons, a.id]})} className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col gap-5 relative active:scale-[0.98] ${active ? themes[a.theme] + ' shadow-2xl scale-[1.02]' : defaultStyle + ' bg-white shadow-sm hover:shadow-md'}`}>
                             <div className="flex justify-between items-start">
                                <div className="flex items-center gap-5">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-center ${active ? (a.theme==='green'?'bg-green-50 text-green-600':'bg-blue-50 text-blue-600') : (a.theme==='green'?'bg-green-50 text-green-600':'bg-blue-50 text-blue-600')}`}>{a.icon}</div>
                                   <div>
                                      <div className={`text-md font-black tracking-tight ${active ? 'text-gray-900' : 'text-[#4A3728]'}`}>{a.name}</div>
                                      <div className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-gray-500' : 'text-[#D7C4A3]'}`}>{a.focus}</div>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[13px] font-black ${active ? 'text-[#8B5E3C]' : 'text-gray-400'}`}>+$ {a.price}</span>
                                    {active && <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mt-2 ${a.theme==='green'?'bg-green-600 border-green-600':'bg-blue-600 border-blue-600'} shadow-md`}><Check size={16} className="text-white" strokeWidth={4}/></div>}
                                </div>
                             </div>
                             <p className={`p-5 rounded-[1.5rem] text-[11px] font-bold leading-relaxed border border-black/5 ${active ? 'bg-[#FDFBF7] text-[#4A3728]' : 'text-[#6B5A4E]'}`}>{a.desc}</p>
                          </div>
                        );
                     })}
                     
                     <div className="grid grid-cols-2 gap-4">
                        {LIGHT_ADDONS.map(a => {
                          const active = booking.addons.includes(a.id);
                          return (
                            <div key={a.id} onClick={() => setBooking({...booking, addons: active?booking.addons.filter(i=>i!==a.id):[...booking.addons, a.id]})} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col relative h-full active:scale-[0.98] ${active ? 'border-[#8B5E3C] bg-[#8B5E3C]/5 shadow-lg scale-[1.02]' : 'border-[#D7C4A3]/20 bg-white shadow-sm hover:border-[#8B5E3C]/30'}`}>
                                <div className="flex justify-between items-start w-full mb-auto">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${active?'bg-white text-[#8B5E3C]':'bg-gray-50 text-[#8B5E3C]'}`}>{a.icon}</div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[12px] font-black text-right ${active ? 'text-[#8B5E3C]' : 'text-gray-600'}`}>+$ {a.price}</span>
                                        {active && <div className="mt-1.5 w-5 h-5 bg-[#8B5E3C] rounded-full flex items-center justify-center shadow-sm border border-white"><Check size={12} className="text-white" strokeWidth={4}/></div>}
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <span className="text-[13px] font-black block leading-tight text-[#4A3728]">{a.name}</span>
                                    <p className="text-[9px] text-[#6B5A4E] font-medium leading-tight mt-2">{a.desc}</p>
                                </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                </section>
              </div>
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-8 flex gap-3 text-center">
                <button onClick={()=>setStep(1)} className="w-16 h-16 rounded-[1.5rem] bg-white border-2 border-[#D7C4A3]/30 flex items-center justify-center text-[#D7C4A3] active:scale-90 transition-all shrink-0 shadow-sm"><ChevronLeft size={24}/></button>
                <button onClick={()=>setStep(3)} className="flex-1 py-5 bg-[#8B5E3C] text-white rounded-[1.5rem] font-black shadow-2xl active:scale-95 transition-all text-center uppercase tracking-widest hover:bg-[#7A5235]">下一步：選擇預約時段 (${cost})</button>
              </div>
            </div>
          )}

          {/* Step 3: Picker */}
          {step === 3 && (
            <div ref={scrollRef} className="p-8 flex-1 flex flex-col text-center no-scrollbar animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center mb-10 text-left">
                <button onClick={()=>setStep(2)} className="w-12 h-12 rounded-2xl border border-[#D7C4A3]/40 flex items-center justify-center text-[#D7C4A3] hover:bg-[#FDFBF7] active:scale-90 shadow-sm transition-all"><ChevronLeft size={22}/></button>
                <Progress s={3}/>
              </div>
              <div className="mb-8 text-center">
                <h3 className="text-[15px] font-black text-[#4A3728] tracking-tight whitespace-nowrap overflow-hidden text-center">不急著完成，只在意貓咪的感受。</h3>
                <p className="text-[9px] font-black text-[#8B5E3C] mt-2 tracking-[0.2em] opacity-80 uppercase text-center">系統已根據方案自動計算佔用時段</p>
              </div>
              
              {/* V63 修正：日期選擇框常駐 */}
              <input type="date" value={booking.date} min={new Date().toISOString().split('T')[0]} onChange={e=>setBooking({...booking, date:e.target.value})} className="w-full p-3 rounded-2xl bg-white border-2 border-[#D7C4A3]/30 font-black text-center mb-8 outline-none shadow-sm text-base text-[#4A3728] text-center"/>

              {holidays.includes(booking.date) ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 animate-in zoom-in-95">
                   <CalendarOff size={48} className="text-[#D7C4A3] mb-4"/>
                   <h3 className="text-lg font-black text-[#4A3728]">抱歉，本日為店休日</h3>
                   <p className="text-xs text-[#D7C4A3] font-bold mt-2">請選擇其他日期為貓咪預約</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-12 flex-1">
                  {TIME_SLOTS.map(t => {
                    const isB = blockedSlots.includes(t);
                    const isS = booking.time === t;
                    return (
                      <button 
                        key={t} 
                        disabled={isB} 
                        onClick={() => setBooking(prev => ({ ...prev, time: t }))}
                        className={`py-3.5 rounded-2xl border transition-all text-[15px] font-black text-center ${
                          isB 
                            ? 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed'
                            : isS 
                              ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-lg scale-[1.05]'
                              : 'bg-white border-gray-200 text-[#4A3728] hover:border-[#8B5E3C]/30 hover:bg-gray-50'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <button onClick={()=>setStep(2)} className="w-16 h-16 rounded-[1.5rem] bg-white border-2 border-[#D7C4A3]/30 flex items-center justify-center text-[#D7C4A3] active:scale-90 transition-all shrink-0 shadow-sm"><ChevronLeft size={24}/></button>
                <button disabled={holidays.includes(booking.date)} onClick={() => { setIsSubmitting(true); setTimeout(() => { setData([...data, { id: Date.now(), ...booking, duration: booking.type === 'advanced' ? 120 : 90, status: 'pending', price: cost, service: booking.type==='basic'?'日常美容':'高階賦活' }]); setIsSubmitting(false); setStep(4); }, 1500); }} className="flex-1 py-6 bg-[#8B5E3C] text-white rounded-[1.5rem] font-black shadow-2xl active:scale-95 transition-all text-center tracking-widest uppercase hover:bg-[#7A5235] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : '確認提交預約單'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div ref={scrollRef} className="p-8 text-center flex-1 flex flex-col justify-center items-center bg-[#FDFBF7]/30 animate-in zoom-in-95 duration-500 no-scrollbar text-center">
               <div className="w-24 h-24 bg-[#8B5E3C]/10 text-[#8B5E3C] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner"><Sparkles size={48}/></div>
               <div className="mb-6 text-center"><h2 className="text-2xl font-black text-[#4A3728]">預約尚未正式完成！</h2><p className="text-orange-600 font-black text-[14px] mt-2 animate-pulse tracking-tight">請點擊下方按鈕將預約單回傳至 LINE 核對</p></div>
               <div className="bg-white p-9 rounded-[3rem] border-2 border-[#D7C4A3]/20 w-full space-y-7 text-left my-8 relative shadow-2xl overflow-hidden text-left relative">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-200 via-[#8B5E3C] to-orange-200 opacity-20"></div>
                 <div className="absolute -left-2 top-1/2 w-4 h-4 bg-[#F9F6F0] rounded-full"></div>
                 <div className="absolute -right-2 top-1/2 w-4 h-4 bg-[#F9F6F0] rounded-full"></div>
                 <div className="absolute top-1/2 left-4 right-4 h-[2px] border-t-2 border-dashed border-gray-100"></div>

                 <div className="flex justify-between items-center pb-8 text-left"><div><span className="text-[9px] font-black text-[#D7C4A3] uppercase block mb-1 tracking-widest">Cat Identity</span><p className="font-black text-2xl text-[#4A3728] tracking-tight">{booking.cat}</p></div><span className="px-5 py-2 bg-[#8B5E3C] text-white text-[11px] font-black rounded-2xl shadow-lg uppercase tracking-widest text-center">方案：{booking.type === 'basic' ? '日常' : '高階'}</span></div>
                 <div className="pt-8 text-left"><span className="text-[9px] font-black text-[#D7C4A3] uppercase block mb-2 tracking-widest">Appointment Slot</span><div className="flex items-center gap-3 text-[#4A3728] font-black text-[16px] mb-1.5"><Calendar size={16}/> {booking.date}</div><div className="flex items-center gap-3 text-[#8B5E3C] font-black text-[16px]"><Clock size={16}/> {booking.time}</div></div>
                 <div className="pt-8 text-left">
                    <div className="flex justify-between items-end mb-6">
                        <div className="text-left">
                            <span className="text-[9px] font-black text-[#D7C4A3] uppercase block mb-1 tracking-widest">Estimated Cost</span>
                            <span className="text-3xl font-black text-[#8B5E3C] tracking-tighter">${cost}</span>
                            <p className="text-[9px] text-orange-700 font-bold mt-2 tracking-tight">金額依現場實際狀況為主</p>
                        </div>
                        <div className="text-right"><p className="text-[9px] font-black text-[#D7C4A3] tracking-[0.2em] uppercase">Moko Salon</p></div>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-4 text-center">
                        <p className="text-[11px] font-black text-orange-600 bg-orange-50 px-6 py-1.5 rounded-full mb-2 border border-orange-100 shadow-sm animate-pulse tracking-widest">核實確認中</p>
                        <p className="text-[10px] font-bold text-[#D7C4A3] uppercase tracking-tighter">資訊回傳官方 LINE 後即正式生效</p>
                    </div>
                 </div>
               </div>
               
               {/* V70: 定型化契約提示 (連結至官網) */}
               <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-[1.5rem] flex gap-4 items-start text-left hover:shadow-md transition-all cursor-pointer group w-full mb-6 mt-6" onClick={() => window.open('https://fluffymoko.com/', '_blank')}>
                   <div className="shrink-0 mt-1 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                       <FileText size={24} className="text-[#8B5E3C]"/>
                   </div>
                   <div className="flex-1">
                       <h4 className="font-black text-[#4A3728] text-[13px] mb-2 flex items-center gap-2">
                           服務契約簽署須知
                           <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">必辦</span>
                       </h4>
                       <div className="text-[11px] text-slate-600 leading-relaxed space-y-2">
                           <p>因應 2026 年最新動保法規修訂，為保障您與毛孩的權益，所有服務皆需簽署《定型化服務契約》。</p>
                           <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-red-700 font-bold text-[10px]">
                               ⚠️ 嚴肅提醒：<br/>若未完成契約簽署，本店將「依法無法提供任何服務」，屆時預約將自動取消，請務必配合。
                           </div>
                           <p className="text-[#8B5E3C] font-black underline underline-offset-2 text-right pt-1 group-hover:text-orange-600 transition-colors flex items-center justify-end gap-1">
                               點此前往 FluffyMoko 官網閱讀並簽署 <ExternalLink size={12}/>
                           </p>
                       </div>
                   </div>
               </div>

               <div className="flex gap-3 w-full">
                  <button onClick={()=>setStep(3)} className="w-14 h-14 rounded-[1.5rem] border-2 border-[#D7C4A3]/30 flex items-center justify-center text-[#D7C4A3] hover:bg-white active:scale-90 transition-all shrink-0 shadow-sm"><ChevronLeft size={24}/></button>
                  <a href={getLineLink()} target="_blank" className="flex-1 py-4 bg-[#06C755] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-lg tracking-tight"><MessageCircle size={24}/> 回傳資訊至 LINE</a>
               </div>
               <button onClick={()=>setStep(0)} className="mt-8 text-[#D7C4A3] font-black text-[11px] uppercase tracking-[0.4em] hover:text-[#8B5E3C] transition-colors active:scale-95">返回首頁</button>
            </div>
          )}

          {/* V72: 刪除確認 Modal */}
          {deleteTargetId && (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><AlertOctagon size={32}/></div>
                  <div>
                    <h3 className="text-lg font-black text-[#4A3728]">確定刪除此預約？</h3>
                    <p className="text-xs text-[#D7C4A3] mt-2 font-bold">此操作無法復原，請謹慎確認。</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all">取消</button>
                     <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-200 active:scale-95 transition-all">確認刪除</button>
                  </div>
               </div>
            </div>
          )}

          {/* Admin看板 */}
          {step === 100 && (
             <div ref={scrollRef} className="p-6 flex-1 flex flex-col overflow-y-auto bg-[#FDFBF7]/30 pb-20 animate-in fade-in duration-500 text-left">
               <div className="flex justify-between items-center mb-6 text-left"><div className="flex items-center gap-3 text-left"><button onClick={()=>setStep(0)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#D7C4A3] shadow-sm text-center"><ChevronLeft size={18}/></button><h2 className="text-xl font-black text-[#4A3728] uppercase tracking-tight">營運管理看板</h2></div><div className="bg-[#8B5E3C] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-md text-center">ADMIN</div></div>
               
               {/* 頂部切換按鈕區域 */}
               <div className="flex justify-between items-center mb-6">
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setAdminView('list')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${adminView === 'list' ? 'bg-[#8B5E3C] text-white shadow-md' : 'bg-white text-[#D7C4A3] border border-[#D7C4A3]/20'}`}
                    >
                      <LayoutList size={16} className="inline mr-1"/> 列表
                    </button>
                    <button 
                      onClick={() => setAdminView('calendar')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${adminView === 'calendar' || adminView === 'day' ? 'bg-[#8B5E3C] text-white shadow-md' : 'bg-white text-[#D7C4A3] border border-[#D7C4A3]/20'}`}
                    >
                      <Grid size={16} className="inline mr-1"/> 日曆
                    </button>
                    <button 
                      onClick={() => setAdminView('holidays')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${adminView === 'holidays' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-red-400 border border-red-200'}`}
                    >
                      <Ban size={16} className="inline mr-1"/> 休假
                    </button>
                 </div>
               </div>

               <div className="flex gap-4 mb-6 text-center">
                  <div className="flex-1 bg-white p-4 rounded-3xl border border-[#D7C4A3]/20 shadow-sm text-left">
                     <div className="flex items-center gap-2 text-[10px] font-black text-[#D7C4A3] uppercase mb-2 text-left"><Filter size={14}/> 月份管理</div>
                     <input type="month" value={adminMonth} onChange={e=>setAdminMonth(e.target.value)} className="w-full bg-gray-50 p-2 rounded-xl text-xs font-black outline-none border border-[#D7C4A3]/10 text-[#4A3728] text-center"/>
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-3xl border border-[#D7C4A3]/20 shadow-sm text-center">
                     <div className="text-[10px] font-black text-[#D7C4A3] mb-1 text-center">本月預收</div>
                     <div className="text-xl font-black text-[#8B5E3C] text-center">${monthlyRevenue}</div>
                  </div>
               </div>
               
               {/* 視圖：休假管理 */}
               {adminView === 'holidays' && (
                  <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-red-100 animate-in zoom-in-95">
                    <h3 className="text-center font-black text-[#4A3728] mb-4 flex items-center justify-center gap-2"><CalendarOff className="text-red-500"/> 設定店休日</h3>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                     {['日','一','二','三','四','五','六'].map(d => <div key={d} className="text-center text-[10px] font-black text-[#D7C4A3]">{d}</div>)}
                   </div>
                   <div className="grid grid-cols-7 gap-2">
                     {calendarDays.map((d, i) => {
                       if (!d) return <div key={i}></div>;
                       const dateStr = `${adminMonth}-${String(d).padStart(2,'0')}`;
                       const isOff = holidays.includes(dateStr);
                       return (
                         <div key={i} onClick={() => toggleHoliday(dateStr)} className={`aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all border-2 ${isOff ? 'bg-red-500 text-white border-red-500 shadow-inner' : 'bg-white border-gray-100 text-[#4A3728] hover:border-red-200'}`}>
                            <span className="text-xs font-bold">{d}</span>
                         </div>
                       );
                     })}
                   </div>
                   <p className="text-center text-[10px] text-red-400 mt-4 font-bold">點擊日期切換 營業 / 店休</p>
                  </div>
               )}
               
               {/* 視圖：日曆模式 */}
               {adminView === 'calendar' && (
                 <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#D7C4A3]/20 animate-in zoom-in-95">
                   <div className="grid grid-cols-7 gap-2 mb-2">
                     {['日','一','二','三','四','五','六'].map(d => <div key={d} className="text-center text-[10px] font-black text-[#D7C4A3]">{d}</div>)}
                   </div>
                   <div className="grid grid-cols-7 gap-2">
                     {calendarDays.map((d, i) => {
                       if (!d) return <div key={i}></div>;
                       const dateStr = `${adminMonth}-${String(d).padStart(2,'0')}`;
                       const count = data.filter(x => x.date === dateStr && x.status === 'confirmed').length;
                       const isOff = holidays.includes(dateStr);
                       return (
                         <div key={i} onClick={() => { if(!isOff) { setSelectedDate(dateStr); setAdminView('day'); } }} className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${selectedDate === dateStr ? 'bg-[#8B5E3C] text-white shadow-md' : isOff ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-[#8B5E3C]/10 text-[#4A3728]'}`}>
                            {isOff && <div className="absolute inset-0 flex items-center justify-center opacity-10"><Ban size={24}/></div>}
                            <span className={`text-xs font-bold ${isOff ? 'text-gray-300' : ''}`}>{d}</span>
                            {!isOff && count > 0 && <div className="mt-1 flex gap-0.5">{Array(Math.min(count, 3)).fill(0).map((_, idx) => <div key={idx} className={`w-1 h-1 rounded-full ${selectedDate === dateStr ? 'bg-white' : 'bg-[#8B5E3C]'}`}></div>)}</div>}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}

               {/* 視圖：單日時間軸 */}
               {adminView === 'day' && (
                 <div className="animate-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-6">
                       <button onClick={() => setAdminView('calendar')} className="p-2 bg-white rounded-xl shadow-sm border border-[#D7C4A3]/20"><ChevronLeft size={16}/></button>
                       <h3 className="font-black text-lg text-[#4A3728]">{selectedDate} 時間軸</h3>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#D7C4A3]/20 relative overflow-hidden h-[600px] overflow-y-auto">
                       <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-gray-100"></div>
                       <div className="relative h-[640px]">
                          {['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map((t, idx) => (
                             <div key={t} className="flex items-center gap-4 absolute w-full" style={{ top: `${idx * 64}px` }}>
                                <span className="text-[10px] font-black text-[#D7C4A3] w-8 text-right">{t}</span>
                                <div className="h-[1px] flex-1 bg-gray-100/50"></div>
                             </div>
                          ))}
                          
                          {data.filter(x => x.date === selectedDate && x.status !== 'cancelled').map(item => {
                             const startMins = t2m(item.time);
                             const top = ((startMins - 660) / 60) * 64; 
                             const height = (item.duration / 60) * 64;
                             return (
                               <div key={item.id} className={`absolute left-12 right-2 rounded-xl p-2 text-xs font-black shadow-md border-l-4 overflow-hidden flex flex-col justify-center ${item.status==='confirmed'?'bg-green-50 border-green-500 text-green-800':'bg-orange-50 border-orange-500 text-orange-800'}`} style={{ top: `${top}px`, height: `${height - 4}px` }}>
                                  <div className="flex justify-between items-center w-full">
                                    <span>{item.cat}</span>
                                    <span className="opacity-70 text-[9px]">{item.time}</span>
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                 </div>
               )}

               {/* 視圖：列表模式 */}
               {adminView === 'list' && (
                 <div className="space-y-8 text-left">
                   <div className="grid grid-cols-2 gap-3 text-left">
                      <button onClick={()=>setShowAddForm(true)} className="bg-[#8B5E3C] text-white p-4 rounded-[2rem] shadow-lg flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-center">
                         <PlusCircle size={22}/><span className="text-[10px] font-black uppercase tracking-widest">手動新增預約</span>
                      </button>
                   </div>

                   {showAddForm && (
                     <div className="mb-10 p-7 bg-white border-2 border-[#8B5E3C] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 text-left">
                        <div className="flex justify-between items-center mb-6 text-left"><div><h3 className="font-black text-sm text-left">手動登記時段</h3><p className="text-[10px] text-[#D7C4A3] font-bold mt-1 text-left">處理電話預約或封鎖擋期</p></div><button onClick={()=>setShowAddForm(false)} className="active:scale-90"><XCircle size={22} className="text-[#D7C4A3]"/></button></div>
                        <div className="space-y-4 text-left">
                           <input placeholder="名稱 (例：店休、小黃)" value={manualBooking.cat} onChange={e=>setManualBooking({...manualBooking, cat:e.target.value})} className="w-full bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#D7C4A3]/20 font-black text-xs outline-none focus:border-[#8B5E3C] transition-all text-left"/>
                           <div className="grid grid-cols-2 gap-3 text-left">
                              <input type="date" value={manualBooking.date} onChange={e=>setManualBooking({...manualBooking, date:e.target.value})} className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#D7C4A3]/20 font-black text-xs outline-none text-left"/>
                              <select value={manualBooking.time} onChange={e=>setManualBooking({...manualBooking, time:e.target.value})} className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#D7C4A3]/20 font-black text-xs outline-none text-left">{TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}</select>
                           </div>
                           <div className="text-left"><label className="text-[9px] font-black text-[#D7C4A3] mb-1.5 block uppercase tracking-widest text-left">佔用時長 (分)</label><input type="number" defaultValue={120} onChange={e=>setManualBooking({...manualBooking, duration:parseInt(e.target.value)})} className="w-full bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#D7C4A3]/20 font-black text-xs outline-none text-left"/></div>
                           <button onClick={addManualRecord} className="w-full py-4 bg-[#8B5E3C] text-white rounded-2xl font-black text-xs text-center shadow-lg active:scale-95 transition-all">確認新增紀錄</button>
                        </div>
                     </div>
                   )}
                   
                  {groups.length === 0 ? <p className="text-center py-20 text-[#D7C4A3] italic font-bold text-center">目前無預約資料</p> : groups.map(g => (
                    <div key={g.date} className="space-y-4 text-left">
                       <div className="flex items-center gap-3 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-sm py-2 z-10 text-left">
                          <div className="h-[2px] flex-1 bg-[#D7C4A3]/30"></div>
                          <span className="text-[11px] font-black text-[#8B5E3C] px-3 tracking-widest bg-white border border-[#D7C4A3]/20 py-1 rounded-full shadow-sm">{g.date}</span>
                          <div className="h-[2px] flex-1 bg-[#D7C4A3]/30"></div>
                       </div>
                       {g.items.map(item => (
                         <div key={item.id} className={`bg-white border rounded-[2rem] shadow-md relative transition-all overflow-hidden text-left ${item.status==='cancelled'?'opacity-40 grayscale':''}`}>
                           <div className="p-6 pb-4 text-left">
                              <div className="flex justify-between items-start mb-4 text-left">
                                 <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-2 flex-wrap text-left">
                                       <span className={`text-[9px] font-black px-3 py-1 rounded-full shadow-sm text-center ${item.status==='confirmed'?'bg-green-100 text-green-700':item.status==='cancelled'?'bg-red-100 text-red-600':'bg-orange-100 text-orange-600 animate-pulse'}`}>{item.status==='confirmed'?'已確認':item.status==='cancelled'?'已取消':'確認中'}</span>
                                       <span className="text-xs font-black text-[#8B5E3C] bg-[#8B5E3C]/5 px-3 py-1 rounded-full shadow-inner">{item.time}</span>
                                    </div>
                                    <h3 className="font-black text-lg text-[#4A3728] mt-1 text-left">{item.cat} <span className="text-xs text-[#D7C4A3] font-bold">({item.service})</span></h3>
                                 </div>
                                 <div className="text-right font-black text-[#8B5E3C] text-lg tracking-tighter">${item.price}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-[#D7C4A3]/20 pt-4 text-[11px] text-left">
                                 <div className="flex flex-col gap-1 text-left"><span className="text-[#D7C4A3] font-bold uppercase text-[9px] tracking-widest">家長姓名</span><p className="font-black text-[#4A3728]">{item.parent}</p></div>
                                 <div className="flex flex-col gap-1 text-left"><span className="text-[#D7C4A3] font-bold uppercase text-[9px] tracking-widest">聯繫電話</span><p className="font-black text-[#4A3728] underline underline-offset-4 decoration-[#D7C4A3]">{item.phone}</p></div>
                              </div>
                           </div>
                           <div className="px-6 pb-6 pt-2 text-left">
                              <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100 text-left">
                                 <div className="flex items-center gap-2 mb-2 text-left"><Timer size={14} className="text-[#8B5E3C]"/><span className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-left">調整作業分 (含緩衝)</span></div>
                                 <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-center">
                                    {[60, 90, 120, 150, 180, 210, 240].map(mins => (
                                      <button key={mins} onClick={()=>updateDuration(item.id, mins)} className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${item.duration===mins?'bg-[#8B5E3C] text-white shadow-md':'bg-white text-[#D7C4A3] border border-[#D7C4A3]/10'}`}>{mins}m</button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="bg-[#FDFBF7] p-4 flex gap-2 border-t border-[#D7C4A3]/10 text-center">
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'confirmed'); }} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black transition-all text-center ${item.status==='confirmed'?'bg-green-600 text-white shadow-lg shadow-green-600/20':'bg-white text-green-600 border border-green-200'}`}><Check size={16}/> 確認</button>
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'cancelled'); }} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black transition-all text-center ${item.status==='cancelled'?'bg-red-600 text-white shadow-lg shadow-red-600/20':'bg-white text-red-600 border border-red-200'}`}><XCircle size={16}/> 取消</button>
                              <button id={`copy-${item.id}`} onClick={(e) => { e.stopPropagation(); copyOrderText(item); }} className="p-3 bg-white border border-[#D7C4A3]/30 text-[#4A3728] rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 text-[10px] font-black shadow-sm text-center">
                                 {copyMsg === item.id ? "已複製" : <Copy size={16}/>}
                            </button>
                            {item.status === 'confirmed' && <button onClick={(e) => { e.stopPropagation(); addToCalendar(item); }} className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl shadow-sm text-center"><CalendarDays size={16}/></button>}
                            <button onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }} className="p-3 text-red-400 hover:text-red-600 transition-colors text-center hover:bg-red-50 rounded-2xl"><Trash2 size={18}/></button>
                         </div>
                       </div>
                     ))}
                  </div>
                ))}
               </div>
               )}

               <button onClick={()=>setStep(0)} className="mt-16 w-full py-5 bg-white border-2 border-[#D7C4A3]/40 rounded-[2.5rem] font-black text-xs text-[#D7C4A3] shadow-md active:scale-95 transition-all uppercase tracking-[0.4em] hover:text-[#8B5E3C] hover:border-[#8B5E3C]">安全退出後台系統</button>
             </div>
          )}

          {step === 99 && (
            <div className="p-10 flex-1 flex flex-col justify-center items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-[#8B5E3C]/10 text-[#8B5E3C] rounded-full flex items-center justify-center mb-10 shadow-inner"><Lock size={32}/></div>
              <h2 className="text-xl font-black text-[#4A3728] mb-8 uppercase text-center tracking-widest">營運中心登入</h2>
              <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="管理密碼" className="w-full bg-[#FDFBF7] p-5 rounded-2xl border-2 border-[#D7C4A3]/30 outline-none text-center font-black tracking-[0.5em] focus:border-[#8B5E3C] shadow-inner mb-6 text-center text-[#4A3728] placeholder:text-[#D7C4A3]/30"/>
              <div className="flex gap-3 w-full text-center">
                <button onClick={()=>setStep(0)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs active:scale-95 text-center text-[#D7C4A3]">返回</button>
                <button onClick={handleAdminLogin} className="flex-[2] bg-[#8B5E3C] text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 text-center hover:bg-[#7A5235]">進入看板</button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="max-w-lg mx-auto mt-6 text-center opacity-30 px-6">
        <p className="text-[9px] font-black text-[#D7C4A3] uppercase tracking-[0.3em] leading-relaxed text-center">FluffyMoko Cat Grooming & SPA Studio<br/>All Rights Reserved.</p>
      </footer>
    </div>
  );

}
export default App;


