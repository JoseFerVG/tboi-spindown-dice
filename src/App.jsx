import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Zap, BatteryCharging, Sparkles, AlertTriangle, CheckCircle, 
  ArrowRight, RotateCcw, Volume2, VolumeX, Shield, Info, ExternalLink,
  Sliders, Award, Compass, Filter, X, Dice6
} from 'lucide-react';
import confetti from 'canvas-confetti';
import itemsData from './data/items_db.json';
import { GOD_TIER_COMBOS } from './data/godTierCombos';
import { 
  getSpindownStep, 
  calculateForwardPath, 
  calculateDistance, 
  findSourcesForTarget 
} from './utils/spindown';

export default function App() {
  const [lang, setLang] = useState('es'); // 'es' or 'en'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRolling, setIsRolling] = useState(false);

  // Active Modifiers
  const [hasCarBattery, setHasCarBattery] = useState(false);
  const [has9Volt, setHas9Volt] = useState(false);
  const [hasTheBattery, setHasTheBattery] = useState(false);

  // Active Tab: 'forward' | 'reverse' | 'distance' | 'combos'
  const [activeTab, setActiveTab] = useState('forward');

  // Selected Items for Modes
  const [selectedForwardId, setSelectedForwardId] = useState(629); // Bot Fly default
  const [selectedTargetId, setSelectedTargetId] = useState(628); // Death Certificate default
  const [distSourceId, setDistSourceId] = useState(183); // Toothpicks default
  const [distTargetId, setDistTargetId] = useState(182); // Sacred Heart default

  // Search Picker Modal State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTargetType, setPickerTargetType] = useState('forward'); // 'forward', 'target', 'distSource', 'distTarget'
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerQualityFilter, setPickerQualityFilter] = useState('all');
  const [pickerPoolFilter, setPickerPoolFilter] = useState('all');

  // Locked Items State
  const [lockedItemIds, setLockedItemIds] = useState(new Set());
  const [showLockedManager, setShowLockedManager] = useState(false);

  // Audio Ref
  const audioRef = useRef(null);

  // Play Sound Effect with optional roll animation
  const playD6Sound = (triggerDiceAnim = false) => {
    if (triggerDiceAnim) {
      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 600);
    }
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('sfx/the_d6_roll.wav');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch (e) {}
  };

  // Preloaded Database
  const [items] = useState(itemsData);

  // Quick Map of items by ID
  const itemsById = useMemo(() => {
    const map = {};
    for (const it of items) {
      map[it.id] = it;
    }
    return map;
  }, [items]);

  // Quality Badges and Colors (Repentance Style)
  const getQualityBadge = (quality) => {
    switch (quality) {
      case 4:
        return {
          label: 'Q4',
          roman: 'IV',
          stars: '★★★★',
          tierName: lang === 'es' ? 'Tier Dios' : 'God Tier',
          title: lang === 'es' ? 'Calidad 4 (Legendario / Tier Dios)' : 'Quality 4 (God Tier)',
          bg: 'bg-purple-950/85',
          border: 'border-yellow-400',
          text: 'text-yellow-300 font-extrabold',
          glow: 'quality-glow-4',
          badgeClass: 'bg-gradient-to-r from-amber-500 to-purple-600 text-black font-black'
        };
      case 3:
        return {
          label: 'Q3',
          roman: 'III',
          stars: '★★★',
          tierName: lang === 'es' ? 'Excelente' : 'Great',
          title: lang === 'es' ? 'Calidad 3 (Excelente)' : 'Quality 3 (High)',
          bg: 'bg-sky-950/85',
          border: 'border-sky-400',
          text: 'text-sky-300 font-bold',
          glow: 'quality-glow-3',
          badgeClass: 'bg-sky-500 text-black font-bold'
        };
      case 2:
        return {
          label: 'Q2',
          roman: 'II',
          stars: '★★',
          tierName: lang === 'es' ? 'Bueno' : 'Decent',
          title: lang === 'es' ? 'Calidad 2 (Bueno)' : 'Quality 2 (Decent)',
          bg: 'bg-emerald-950/85',
          border: 'border-emerald-500',
          text: 'text-emerald-300 font-bold',
          glow: 'quality-glow-2',
          badgeClass: 'bg-emerald-600 text-black font-bold'
        };
      case 1:
        return {
          label: 'Q1',
          roman: 'I',
          stars: '★',
          tierName: lang === 'es' ? 'Bajo' : 'Low',
          title: lang === 'es' ? 'Calidad 1 (Bajo)' : 'Quality 1 (Low)',
          bg: 'bg-amber-950/70',
          border: 'border-amber-700',
          text: 'text-amber-300',
          glow: 'quality-glow-1',
          badgeClass: 'bg-amber-700 text-white font-bold'
        };
      default:
        return {
          label: 'Q0',
          roman: '0',
          stars: '∅',
          tierName: lang === 'es' ? 'Pobre' : 'Garbage',
          title: lang === 'es' ? 'Calidad 0 (Pobre / Basura)' : 'Quality 0 (Garbage)',
          bg: 'bg-zinc-900/85',
          border: 'border-zinc-700',
          text: 'text-zinc-400',
          glow: 'quality-glow-0',
          badgeClass: 'bg-zinc-700 text-zinc-300'
        };
    }
  };

  // Trigger celebration on high value target
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#a855f7', '#e11d48', '#38bdf8']
      });
    } catch (e) {}
  };

  // Step forward manually from pedestal
  const handleManualStepForward = () => {
    playD6Sound(true);
    const nextItem = getSpindownStep(selectedForwardId, itemsById, lockedItemIds);
    if (!nextItem) return;

    if (hasCarBattery) {
      const secondItem = getSpindownStep(nextItem.id, itemsById, lockedItemIds);
      if (secondItem) {
        setSelectedForwardId(secondItem.id);
        if (secondItem.quality === 4) triggerConfetti();
        return;
      }
    }

    setSelectedForwardId(nextItem.id);
    if (nextItem.quality === 4) triggerConfetti();
  };

  // Open item picker for a specific field
  const handleOpenPicker = (targetType) => {
    setPickerTargetType(targetType);
    setPickerSearch('');
    setPickerQualityFilter('all');
    setPickerPoolFilter('all');
    setPickerOpen(true);
  };

  // Select item from picker
  const handleSelectItem = (item) => {
    playD6Sound(true);
    if (item.quality === 4) {
      triggerConfetti();
    }
    if (pickerTargetType === 'forward') {
      setSelectedForwardId(item.id);
    } else if (pickerTargetType === 'target') {
      setSelectedTargetId(item.id);
    } else if (pickerTargetType === 'distSource') {
      setDistSourceId(item.id);
    } else if (pickerTargetType === 'distTarget') {
      setDistTargetId(item.id);
    }
    setPickerOpen(false);
  };

  // Forward calculations
  const forwardPath = useMemo(() => {
    if (!selectedForwardId || !itemsById[selectedForwardId]) return [];
    return calculateForwardPath(selectedForwardId, itemsById, lockedItemIds, hasCarBattery, 40);
  }, [selectedForwardId, itemsById, lockedItemIds, hasCarBattery]);

  // Reverse calculations
  const reverseSources = useMemo(() => {
    if (!selectedTargetId || !itemsById[selectedTargetId]) return [];
    return findSourcesForTarget(selectedTargetId, items, itemsById, lockedItemIds, hasCarBattery, 30);
  }, [selectedTargetId, items, itemsById, lockedItemIds, hasCarBattery]);

  // Distance calculation between A & B
  const distanceInfo = useMemo(() => {
    if (!distSourceId || !distTargetId || !itemsById[distSourceId] || !distTargetId) return null;
    return calculateDistance(distSourceId, distTargetId, itemsById, lockedItemIds);
  }, [distSourceId, distTargetId, itemsById, lockedItemIds]);

  // Picker search filtering
  const filteredPickerItems = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase();
    return items.filter(it => {
      if (it.is_skipped_default) return false;
      if (pickerQualityFilter !== 'all' && it.quality !== parseInt(pickerQualityFilter)) return false;
      if (pickerPoolFilter !== 'all' && !it.pools.includes(pickerPoolFilter)) return false;
      if (!query) return true;
      const matchId = String(it.id).includes(query);
      const matchEn = it.name_en.toLowerCase().includes(query);
      const matchEs = it.name_es.toLowerCase().includes(query);
      const matchTags = it.tags.some(t => t.toLowerCase().includes(query));
      return matchId || matchEn || matchEs || matchTags;
    });
  }, [items, pickerSearch, pickerQualityFilter, pickerPoolFilter]);

  const currentForwardItem = itemsById[selectedForwardId] || items[0];
  const currentTargetItem = itemsById[selectedTargetId] || items[0];
  const currentDistSource = itemsById[distSourceId] || items[0];
  const currentDistTarget = itemsById[distTargetId] || items[0];

  return (
    <div className="min-h-screen pb-16 selection:bg-[#7a1818] selection:text-white">
      {/* =========================================================================
          TOP NAVIGATION & ISAAC HUD HEADER
          ========================================================================= */}
      <header className="border-b-4 border-[#2d1e16] bg-[#140e0b]/95 backdrop-blur sticky top-0 z-40 px-4 py-3 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Spindown Dice Active Slot */}
          <div className="flex items-center gap-3">
            {/* Active Item HUD Frame */}
            <div 
              onClick={() => playD6Sound(true)}
              title={lang === 'es' ? '¡Haz clic para girar el Spindown Dice!' : 'Click to roll Spindown Dice!'}
              className="relative w-14 h-14 flex items-center justify-center bg-[#1c120c] border-3 border-[#543828] rounded shadow-inner cursor-pointer group hover:border-amber-400 transition-colors"
            >
              <img 
                src="items/collectibles_723_spindowndice.png" 
                alt="Spindown Dice" 
                className={`w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform ${isRolling ? 'animate-dice-roll' : 'animate-pedestal-item'}`} 
              />
              <span className="absolute -bottom-1.5 -right-1 text-[9px] bg-red-950 text-red-200 border border-red-700 px-1 rounded font-mono font-bold">
                #723
              </span>
            </div>

            {/* Title & Authentic Tag */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-xl font-isaac-title text-amber-300 tracking-wider">
                  SPINDOWN DICE
                </h1>
                <span className="text-[10px] bg-red-950 text-red-300 border-2 border-red-700 px-2 py-0.5 rounded font-isaac-pixel font-bold shadow">
                  REPENTANCE
                </span>
              </div>
              <p className="text-xs text-[#a69682] mt-0.5 font-isaac-pixel">
                {lang === 'es' ? 'Calculadora de Saltos, Distancias y Sinergias' : 'Spins, Distances & Synergies Calculator'}
              </p>
            </div>
          </div>

          {/* Isaac In-Game Active Item HUD: 6-Pip Battery Charge Meter */}
          <div className="hidden lg:flex items-center gap-3 bg-[#19110d] px-3.5 py-2 rounded border-2 border-[#3d2a1e] shadow-inner">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 font-isaac-pixel uppercase tracking-wide">
                {lang === 'es' ? 'Carga del Dado' : 'Dice Charge'}
              </span>
              <span className="text-xs text-amber-300 font-bold font-mono">
                {has9Volt ? '5 / 5 Salas' : '6 / 6 Salas'}
              </span>
            </div>

            {/* Segmented Charge Pips (Authentic Isaac HUD style) */}
            <div className="flex flex-col gap-1">
              {/* Primary 6 green pips */}
              <div className="flex items-center gap-1 bg-black/60 p-1 border border-[#3b271b] rounded">
                {[1, 2, 3, 4, 5, 6].map(pip => (
                  <div 
                    key={pip} 
                    className={`isaac-battery-pip ${pip <= (has9Volt ? 5 : 6) ? 'charged' : ''}`}
                    title={pip <= (has9Volt ? 5 : 6) ? 'Carga lista' : 'Sin carga'}
                  />
                ))}
              </div>

              {/* The Battery: Orange Overflow row */}
              {hasTheBattery && (
                <div className="flex items-center gap-1 bg-black/60 p-1 border border-amber-900/60 rounded">
                  {[1, 2, 3, 4, 5, 6].map(pip => (
                    <div 
                      key={`ov_${pip}`} 
                      className="isaac-battery-pip overflow-charged"
                      title="Reserva de Batería (+6 Cargas)"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Badge indicator */}
            {hasCarBattery && (
              <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded font-mono" title="Car Battery activa: 2 activaciones">
                ⚡ x2
              </span>
            )}
          </div>

          {/* Controls: Sound, Language, Save file */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button 
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playD6Sound(true);
              }}
              title={soundEnabled ? 'Silenciar Efectos de Sonido' : 'Activar Sonidos de Isaac'}
              className="isaac-btn text-xs py-1.5 px-2.5"
            >
              {soundEnabled ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} className="text-zinc-500" />}
            </button>

            {/* Language Toggle */}
            <button 
              onClick={() => {
                setLang(lang === 'es' ? 'en' : 'es');
                playD6Sound();
              }}
              className="isaac-btn text-xs py-1.5 px-3 font-isaac-pixel font-bold"
            >
              {lang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
            </button>

            {/* Save file unlocked status */}
            <button
              onClick={() => {
                setShowLockedManager(true);
                playD6Sound();
              }}
              className="isaac-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Shield size={14} className={lockedItemIds.size > 0 ? "text-amber-400" : "text-emerald-400"} />
              <span className="font-isaac-pixel">
                {lockedItemIds.size > 0 
                  ? `${lockedItemIds.size} ${lang === 'es' ? 'bloqueados' : 'locked'}`
                  : (lang === 'es' ? 'Partida 100%' : '100% Save')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SYNERGIES & BATTERY MODIFIERS BAR
          ========================================================================= */}
      <section className="bg-[#18110d] border-b-3 border-[#38271c] py-3.5 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-[#d4c1a9] font-isaac-pixel">
            <Zap size={16} className="text-amber-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-amber-200">
              {lang === 'es' ? 'Sinergias de Batería:' : 'Battery Synergies:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Car Battery Toggle */}
            <button
              onClick={() => {
                setHasCarBattery(!hasCarBattery);
                playD6Sound(true);
              }}
              className={`isaac-btn flex items-center gap-2 py-1.5 px-3 rounded text-xs md:text-sm transition-all ${
                hasCarBattery ? 'isaac-btn-active ring-2 ring-amber-400/60' : 'bg-[#221610]'
              }`}
            >
              <img 
                src="items/collectibles_356_carbattery.png" 
                alt="Car Battery" 
                className="w-6 h-6 object-contain" 
              />
              <span className="font-bold">
                {lang === 'es' ? 'Batería de Coche' : 'Car Battery'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${hasCarBattery ? 'bg-amber-400 text-black font-black' : 'bg-[#3b271c] text-zinc-400'}`}>
                {hasCarBattery ? 'ID - 2' : 'OFF'}
              </span>
            </button>

            {/* 9 Volt Toggle */}
            <button
              onClick={() => {
                setHas9Volt(!has9Volt);
                playD6Sound();
              }}
              className={`isaac-btn flex items-center gap-2 py-1.5 px-3 rounded text-xs md:text-sm ${
                has9Volt ? 'isaac-btn-active' : 'bg-[#221610]'
              }`}
            >
              <img 
                src="items/collectibles_116_9volt.png" 
                alt="9 Volt" 
                className="w-5 h-5 object-contain" 
              />
              <span>9 Volt (-1 carga)</span>
            </button>

            {/* The Battery Toggle */}
            <button
              onClick={() => {
                setHasTheBattery(!hasTheBattery);
                playD6Sound();
              }}
              className={`isaac-btn flex items-center gap-2 py-1.5 px-3 rounded text-xs md:text-sm ${
                hasTheBattery ? 'isaac-btn-active' : 'bg-[#221610]'
              }`}
            >
              <img 
                src="items/collectibles_063_thebattery.png" 
                alt="The Battery" 
                className="w-5 h-5 object-contain" 
              />
              <span>The Battery (Reserva x2)</span>
            </button>
          </div>
        </div>

        {/* Authentic Isaac Post-It Note Callout for Car Battery Warning */}
        {hasCarBattery && (
          <div className="max-w-6xl mx-auto mt-4 px-2">
            <div className="isaac-postit p-3.5 flex items-start gap-3 text-sm">
              <div className="isaac-postit-tape"></div>
              <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
              <div className="font-isaac-doodle text-xs md:text-sm leading-relaxed">
                {lang === 'es' ? (
                  <>
                    <strong className="text-red-900 font-bold uppercase block text-sm">
                      ⚠️ ¡Aviso de Paridad con Batería de Coche!
                    </strong>
                    El Spindown Dice resta <span className="font-bold underline text-red-950">2 IDs en cada activación</span> (ejecuta 2 reducciones continuas).
                    Por lo tanto, <span className="font-bold text-red-950">saltará directamente sobre todos los ítems que estén a distancia impar</span>.
                    Revisa las columnas de impacto directo para planificar si necesitas hacer un giro simple sin Batería.
                  </>
                ) : (
                  <>
                    <strong className="text-red-900 font-bold uppercase block text-sm">
                      ⚠️ Car Battery Parity Notice!
                    </strong>
                    Spindown Dice subtracts <span className="font-bold underline text-red-950">2 IDs per spin</span> (two consecutive rolls).
                    It will <span className="font-bold text-red-950">completely bypass any item at an odd distance</span>.
                    Check the parity status indicators below!
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          MAIN TABS NAVIGATION (ISAAC STYLE BOOKMARKS)
          ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 border-b-3 border-[#3d2a1e] pb-2">
          <button
            onClick={() => { setActiveTab('forward'); playD6Sound(); }}
            className={`isaac-btn text-xs md:text-sm py-2.5 px-4 rounded-t flex items-center gap-2 font-isaac-pixel ${
              activeTab === 'forward' ? 'isaac-btn-active font-bold' : ''
            }`}
          >
            <Compass size={16} />
            <span>{lang === 'es' ? '1. ¿A dónde llego desde aquí?' : '1. Forward Reroll Chain'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('reverse'); playD6Sound(); }}
            className={`isaac-btn text-xs md:text-sm py-2.5 px-4 rounded-t flex items-center gap-2 font-isaac-pixel ${
              activeTab === 'reverse' ? 'isaac-btn-active font-bold' : ''
            }`}
          >
            <Sparkles size={16} />
            <span>{lang === 'es' ? '2. ¿Cómo consigo este ítem?' : '2. Reverse Target Search'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('distance'); playD6Sound(); }}
            className={`isaac-btn text-xs md:text-sm py-2.5 px-4 rounded-t flex items-center gap-2 font-isaac-pixel ${
              activeTab === 'distance' ? 'isaac-btn-active font-bold' : ''
            }`}
          >
            <ArrowRight size={16} />
            <span>{lang === 'es' ? '3. Distancia Ítem A ➜ Ítem B' : '3. Distance Between A & B'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('combos'); playD6Sound(); }}
            className={`isaac-btn text-xs md:text-sm py-2.5 px-4 rounded-t flex items-center gap-2 font-isaac-pixel ${
              activeTab === 'combos' ? 'isaac-btn-active font-bold' : ''
            }`}
          >
            <Award size={16} />
            <span>{lang === 'es' ? '4. Trucos Legendarios' : '4. God-Tier Combos'}</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: FORWARD CHAIN (TREASURE ROOM PEDESTAL)
            ========================================================================= */}
        {activeTab === 'forward' && (
          <div className="mt-6 space-y-6">
            {/* Treasure Room Altar & Pedestal Container */}
            <div className="isaac-panel p-6 isaac-spotlight">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Left: Floating Pedestal & Active Collectible */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* The Altar with divine light and bobbing item */}
                  <div className="relative w-28 h-32 flex flex-col items-center justify-end pb-1 shrink-0">
                    {/* Hovering Item */}
                    <img 
                      src={`items/${currentForwardItem.sprite}`} 
                      alt={currentForwardItem.name_es} 
                      className={`w-14 h-14 object-contain mb-2 drop-shadow-2xl z-10 ${isRolling ? 'animate-dice-roll' : 'animate-pedestal-item'}`} 
                    />
                    {/* Elliptical shadow on altar */}
                    <div className="w-10 h-2.5 bg-black/70 rounded-full mb-1 animate-pedestal-shadow blur-[1px]"></div>
                    {/* Pedestal Sprite */}
                    <img 
                      src="ui/pedestal.png" 
                      alt="Pedestal" 
                      className="w-24 h-12 object-contain drop-shadow" 
                    />
                  </div>

                  {/* Item Description Info */}
                  <div>
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-isaac-pixel font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping"></span>
                      {lang === 'es' ? 'Objeto actual en el pedestal:' : 'Current Pedestal Item:'}
                    </span>
                    
                    <h2 className="text-2xl md:text-3xl font-isaac-title text-amber-200 mt-1">
                      {lang === 'es' ? currentForwardItem.name_es : currentForwardItem.name_en}
                    </h2>

                    {/* Subtitle / Pickup Quote in Isaac handwriting */}
                    <div className="font-isaac-doodle text-amber-300/90 text-sm md:text-base mt-1 italic">
                      "{lang === 'es' ? currentForwardItem.name_en : currentForwardItem.name_es}"
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="bg-[#241711] px-2.5 py-1 rounded border-2 border-[#4d3324] font-mono font-bold text-amber-300">
                        ID #{currentForwardItem.id}
                      </span>
                      <span className={`px-2.5 py-1 rounded border-2 text-xs font-bold ${getQualityBadge(currentForwardItem.quality).bg} ${getQualityBadge(currentForwardItem.quality).border} ${getQualityBadge(currentForwardItem.quality).text}`}>
                        {getQualityBadge(currentForwardItem.quality).stars} ({getQualityBadge(currentForwardItem.quality).label})
                      </span>
                      <span className="bg-[#241711] px-2 py-1 rounded border border-[#4d3324] capitalize text-zinc-300">
                        {currentForwardItem.type}
                      </span>
                      {currentForwardItem.pools && currentForwardItem.pools.length > 0 && (
                        <span className="bg-[#241711] px-2 py-1 rounded border border-[#4d3324] text-amber-400/80">
                          {currentForwardItem.pools.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#d1c2ad] mt-2.5 max-w-xl whitespace-pre-line leading-relaxed font-mono">
                      {lang === 'es' ? currentForwardItem.desc_es : currentForwardItem.desc_en}
                    </p>
                  </div>
                </div>

                {/* Right: Pedestal Action Buttons */}
                <div className="flex flex-col gap-2.5 w-full md:w-auto">
                  {/* Interactive Roll Button */}
                  <button
                    onClick={handleManualStepForward}
                    className="isaac-btn py-3 px-5 text-sm font-isaac-pixel font-bold flex items-center justify-center gap-2 bg-[#8c2214] border-red-800 hover:bg-[#a82a18] shadow-lg"
                    title={lang === 'es' ? 'Simular 1 activación de Spindown Dice en este ítem' : 'Simulate 1 spin on this item'}
                  >
                    <Dice6 size={18} className="animate-spin" />
                    <span>
                      {hasCarBattery 
                        ? (lang === 'es' ? '¡GIRAR SPINDOWN (-2)!' : 'SPIN WITH BATTERY (-2)!') 
                        : (lang === 'es' ? '¡GIRAR SPINDOWN (-1)!' : 'SPIN THE DICE (-1)!')}
                    </span>
                  </button>

                  {/* Change Pedestal Item Button */}
                  <button
                    onClick={() => handleOpenPicker('forward')}
                    className="isaac-btn py-2.5 px-4 text-xs font-isaac-pixel font-bold flex items-center justify-center gap-2 bg-[#2c1e16] border-[#5a3e2d] hover:bg-[#3d2b20]"
                  >
                    <Search size={16} />
                    <span>{lang === 'es' ? 'ELEGIR OTRO OBJETO' : 'CHANGE PEDESTAL ITEM'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Path Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-isaac-title text-amber-300">
                  {lang === 'es' ? 'Cadena de Transformación del Dado' : 'Spindown Dice Reroll Chain'}
                </h3>
                <p className="text-xs text-[#a69682] font-isaac-pixel mt-0.5">
                  {hasCarBattery 
                    ? (lang === 'es' ? '⚡ Mostrando saltos de 2 en 2 con Batería de Coche' : '⚡ Showing double jumps with Car Battery')
                    : (lang === 'es' ? 'Mostrando saltos individuales (1 uso = ID - 1)' : 'Showing single jumps (1 spin = ID - 1)')}
                </p>
              </div>

              <div className="text-xs text-[#b8a791] bg-[#1a120d] border-2 border-[#3d2a1e] px-3 py-1.5 rounded font-mono">
                <span>{forwardPath.length} {lang === 'es' ? 'ítems calculados' : 'items calculated'}</span>
              </div>
            </div>

            {/* Path Timeline */}
            <div className="space-y-3">
              {forwardPath.length === 0 ? (
                <div className="isaac-card p-8 text-center text-zinc-500 font-isaac-pixel">
                  {lang === 'es' ? 'No hay más ítems alcanzables hacia abajo en esta ruta.' : 'No further items reachable in this path.'}
                </div>
              ) : (
                forwardPath.map((stepData) => {
                  const it = stepData.item;
                  const qInfo = getQualityBadge(it.quality);
                  const isQ4 = it.quality === 4;

                  return (
                    <div 
                      key={stepData.step}
                      className={`isaac-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
                        isQ4 ? `${qInfo.glow} bg-purple-950/25 border-yellow-400` : 'hover:border-[#73513a]'
                      }`}
                    >
                      {/* Step Number & Graphic */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Step Badge */}
                        <div className="flex flex-col items-center justify-center min-w-[70px] bg-[#241711] border-2 border-[#473022] rounded p-2 text-center shadow-inner">
                          <span className="text-[10px] text-zinc-400 uppercase font-mono">
                            {lang === 'es' ? 'Giro' : 'Spin'}
                          </span>
                          <span className="text-xl font-isaac-title text-amber-300">
                            #{stepData.step}
                          </span>
                        </div>

                        {/* Item Icon */}
                        <div className="relative w-14 h-14 flex items-center justify-center bg-[#1e140f] border-2 border-[#422c1f] rounded p-1 shrink-0">
                          <img 
                            src={`items/${it.sprite}`} 
                            alt={it.name_es} 
                            className="w-10 h-10 object-contain drop-shadow" 
                          />
                        </div>

                        {/* Item Details */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base md:text-lg font-bold text-amber-200">
                              {lang === 'es' ? it.name_es : it.name_en}
                            </h4>
                            <span className={`px-2 py-0.5 rounded border text-xs font-bold ${qInfo.bg} ${qInfo.border} ${qInfo.text}`}>
                              {qInfo.stars} {qInfo.label}
                            </span>
                            {isQ4 && (
                              <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded font-black tracking-wider animate-pulse shadow">
                                ⭐ TOP TIER (Q4)
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#a69682] mt-0.5 font-mono">
                            <span className="text-amber-400">ID #{it.id}</span>
                            <span>•</span>
                            <span className="capitalize">{it.type}</span>
                            {it.pools && it.pools.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-amber-300/80">
                                  {it.pools.slice(0, 2).join(', ')}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Bypassed Item Notice (Car Battery) */}
                          {stepData.bypassedItem && (
                            <div className="mt-1.5 text-xs text-amber-300 flex items-center gap-1.5 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60 font-isaac-doodle">
                              <span>⚡ {lang === 'es' ? 'Saltó sobre:' : 'Bypassed:'}</span>
                              <img src={`items/${stepData.bypassedItem.sprite}`} alt="" className="w-4 h-4 inline" />
                              <span className="font-bold">
                                {lang === 'es' ? stepData.bypassedItem.name_es : stepData.bypassedItem.name_en} (ID #{stepData.bypassedItem.id})
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-[#b8a791] mt-1 line-clamp-2 max-w-xl font-mono">
                            {lang === 'es' ? it.desc_es : it.desc_en}
                          </p>
                        </div>
                      </div>

                      {/* Charges and Rooms required info */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-[#2e2017] pt-2 md:pt-0">
                        <div className="text-right text-xs">
                          <div className="text-[#d9caa9] font-mono flex items-center gap-1 justify-end font-bold">
                            <BatteryCharging size={14} className="text-amber-400" />
                            <span>
                              {has9Volt ? stepData.charges9Volt : stepData.chargesStandard} {lang === 'es' ? 'cargas' : 'charges'}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {has9Volt ? `${stepData.charges9Volt} salas (con 9V)` : `${stepData.chargesStandard} salas de recarga`}
                          </span>
                        </div>

                        {/* Quick Action: Trace reverse path */}
                        <button
                          onClick={() => {
                            setSelectedTargetId(it.id);
                            setActiveTab('reverse');
                            playD6Sound(true);
                          }}
                          className="isaac-btn text-xs py-1.5 px-3 whitespace-nowrap font-isaac-pixel"
                          title={lang === 'es' ? 'Buscar cómo conseguir este ítem desde otros objetos' : 'Search sources for this item'}
                        >
                          <Search size={14} />
                          <span>{lang === 'es' ? 'Rastrear' : 'Trace'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: REVERSE TARGET CALCULATOR
            ========================================================================= */}
        {activeTab === 'reverse' && (
          <div className="mt-6 space-y-6">
            {/* Target Item Selector */}
            <div className="isaac-panel p-6 isaac-spotlight">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Desired Item on Pedestal */}
                  <div className="relative w-28 h-32 flex flex-col items-center justify-end pb-1 shrink-0">
                    <img 
                      src={`items/${currentTargetItem.sprite}`} 
                      alt={currentTargetItem.name_es} 
                      className="w-14 h-14 object-contain mb-2 drop-shadow-2xl z-10 animate-pedestal-item" 
                    />
                    <div className="w-10 h-2.5 bg-black/70 rounded-full mb-1 animate-pedestal-shadow blur-[1px]"></div>
                    <img 
                      src="ui/pedestal.png" 
                      alt="Pedestal" 
                      className="w-24 h-12 object-contain drop-shadow" 
                    />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-isaac-pixel font-bold">
                      {lang === 'es' ? 'Objeto objetivo que deseas conseguir:' : 'Desired Target Item:'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-isaac-title text-amber-200 mt-1">
                      {lang === 'es' ? currentTargetItem.name_es : currentTargetItem.name_en}
                    </h2>
                    <div className="font-isaac-doodle text-amber-300/90 text-sm md:text-base mt-1 italic">
                      "{lang === 'es' ? currentTargetItem.name_en : currentTargetItem.name_es}"
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="bg-[#241711] px-2.5 py-1 rounded border-2 border-[#4d3324] font-mono font-bold text-amber-300">
                        ID #{currentTargetItem.id}
                      </span>
                      <span className={`px-2.5 py-1 rounded border-2 text-xs font-bold ${getQualityBadge(currentTargetItem.quality).bg} ${getQualityBadge(currentTargetItem.quality).border} ${getQualityBadge(currentTargetItem.quality).text}`}>
                        {getQualityBadge(currentTargetItem.quality).stars} ({getQualityBadge(currentTargetItem.quality).label})
                      </span>
                      <span className="bg-[#241711] px-2 py-1 rounded border border-[#4d3324] capitalize text-zinc-300">
                        {currentTargetItem.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#d1c2ad] mt-2 max-w-xl whitespace-pre-line font-mono">
                      {lang === 'es' ? currentTargetItem.desc_es : currentTargetItem.desc_en}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPicker('target')}
                  className="isaac-btn py-3 px-5 text-sm font-isaac-pixel font-bold flex items-center justify-center gap-2 bg-[#8c2214] border-red-800 hover:bg-[#a82a18] shadow-lg"
                >
                  <Search size={18} />
                  <span>{lang === 'es' ? 'BUSCAR OTRO OBJETIVO' : 'CHOOSE DIFFERENT TARGET'}</span>
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-isaac-title text-amber-300">
                  {lang === 'es' 
                    ? `Objetos que se convierten en ${currentTargetItem.name_es}`
                    : `Items that spin down into ${currentTargetItem.name_en}`}
                </h3>
                <p className="text-xs text-[#a69682] font-isaac-pixel mt-0.5">
                  {lang === 'es'
                    ? 'Si encuentras cualquiera de estos en tu run, usa Spindown Dice el número de giros indicado:'
                    : 'If you encounter any of these in your run, reroll them the indicated amount of times:'}
                </p>
              </div>

              <div className="text-xs text-[#b8a791] bg-[#1a120d] border-2 border-[#3d2a1e] px-3 py-1.5 rounded font-mono">
                <span>{reverseSources.length} {lang === 'es' ? 'rutas encontradas' : 'sources found'}</span>
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {reverseSources.length === 0 ? (
                <div className="col-span-full isaac-card p-8 text-center text-zinc-500 font-isaac-pixel">
                  {lang === 'es' 
                    ? 'No se encontraron objetos que deriven a este ítem en un rango razonable (o el ítem es el ID más alto).'
                    : 'No items found that roll down into this target within reasonable distance.'}
                </div>
              ) : (
                reverseSources.map((src) => {
                  const it = src.item;
                  const qInfo = getQualityBadge(it.quality);
                  const is1Spin = src.normalSpins === 1;

                  return (
                    <div 
                      key={it.id}
                      className={`isaac-card p-3.5 flex items-center justify-between gap-3 ${
                        is1Spin ? 'border-amber-400 bg-amber-950/25 shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Item Icon */}
                        <div className="relative w-12 h-12 flex items-center justify-center bg-[#1e140f] border-2 border-[#422c1f] rounded shrink-0">
                          <img 
                            src={`items/${it.sprite}`} 
                            alt={it.name_es} 
                            className="w-9 h-9 object-contain drop-shadow" 
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm md:text-base font-bold text-amber-200 line-clamp-1">
                              {lang === 'es' ? it.name_es : it.name_en}
                            </h4>
                            <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${qInfo.bg} ${qInfo.border} ${qInfo.text}`}>
                              {qInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#a69682] font-mono">
                            <span className="text-amber-400">ID #{it.id}</span>
                            {it.pools && it.pools.length > 0 && (
                              <span className="text-amber-300/80 capitalize line-clamp-1">
                                • {it.pools[0]}
                              </span>
                            )}
                          </div>

                          {/* Car Battery Status */}
                          {hasCarBattery && (
                            <div className="mt-1">
                              {src.carBatteryExact ? (
                                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1 font-mono">
                                  <CheckCircle size={10} />
                                  {lang === 'es' ? `Cae exacto en ${src.carBatterySpins} usos con Batería` : `Direct hit in ${src.carBatterySpins} spins w/ Battery`}
                                </span>
                              ) : (
                                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1 font-mono">
                                  <AlertTriangle size={10} />
                                  {lang === 'es' ? 'Se pasa por 1 con Batería' : 'Bypassed by 1 with Battery'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Spin Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className={`px-3 py-1.5 rounded border-2 font-mono text-center ${
                          is1Spin ? 'bg-amber-400 text-black font-extrabold border-amber-200 shadow-md animate-pulse' : 'bg-[#241711] border-[#473022] text-amber-300 font-bold'
                        }`}>
                          <span className="text-xs md:text-sm">
                            {src.normalSpins} {src.normalSpins === 1 ? (lang === 'es' ? 'GIRO' : 'SPIN') : (lang === 'es' ? 'GIROS' : 'SPINS')}
                          </span>
                        </div>

                        <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                          {has9Volt ? `${src.normalSpins * 5} salas` : `${src.normalSpins * 6} salas`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: DISTANCE BETWEEN A & B
            ========================================================================= */}
        {activeTab === 'distance' && (
          <div className="mt-6 space-y-6">
            <div className="isaac-panel p-6">
              <h3 className="text-base md:text-lg font-isaac-title text-amber-300 mb-4 flex items-center gap-2">
                <ArrowRight size={20} />
                <span>{lang === 'es' ? 'Calculadora de Distancia Exacta entre dos Ítems' : 'Exact Distance Calculator between Two Items'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Source Item A */}
                <div className="isaac-card p-4 border-[#523928]">
                  <div className="text-xs uppercase text-amber-400 font-isaac-pixel font-bold mb-2 flex items-center justify-between">
                    <span>{lang === 'es' ? 'Ítem Origen (A)' : 'Origin Item (A)'}</span>
                    <button 
                      onClick={() => handleOpenPicker('distSource')}
                      className="text-xs text-amber-300 underline hover:text-white font-mono"
                    >
                      {lang === 'es' ? 'Cambiar Objeto' : 'Change Item'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={`items/${currentDistSource.sprite}`} alt="" className="w-12 h-12 object-contain drop-shadow" />
                    <div>
                      <h4 className="font-bold text-amber-200 text-base">
                        {lang === 'es' ? currentDistSource.name_es : currentDistSource.name_en}
                      </h4>
                      <span className="text-xs text-zinc-400 font-mono">ID #{currentDistSource.id} • Calidad {currentDistSource.quality}</span>
                    </div>
                  </div>
                </div>

                {/* Target Item B */}
                <div className="isaac-card p-4 border-[#523928]">
                  <div className="text-xs uppercase text-amber-400 font-isaac-pixel font-bold mb-2 flex items-center justify-between">
                    <span>{lang === 'es' ? 'Ítem Destino (B)' : 'Target Item (B)'}</span>
                    <button 
                      onClick={() => handleOpenPicker('distTarget')}
                      className="text-xs text-amber-300 underline hover:text-white font-mono"
                    >
                      {lang === 'es' ? 'Cambiar Objeto' : 'Change Item'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={`items/${currentDistTarget.sprite}`} alt="" className="w-12 h-12 object-contain drop-shadow" />
                    <div>
                      <h4 className="font-bold text-amber-200 text-base">
                        {lang === 'es' ? currentDistTarget.name_es : currentDistTarget.name_en}
                      </h4>
                      <span className="text-xs text-zinc-400 font-mono">ID #{currentDistTarget.id} • Calidad {currentDistTarget.quality}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distance Result Breakdown */}
              {distanceInfo && (
                <div className="mt-6 pt-6 border-t-2 border-[#38271c]">
                  {!distanceInfo.reachable ? (
                    <div className="p-4 bg-red-950/40 border-2 border-red-800 rounded text-red-200 text-sm flex items-center gap-3">
                      <AlertTriangle size={24} className="text-red-400 shrink-0" />
                      <div>
                        <strong className="block font-isaac-pixel">{lang === 'es' ? 'Inalcanzable:' : 'Unreachable:'}</strong>
                        <p className="font-mono mt-1">{distanceInfo.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Big KPI Numbers */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="isaac-card p-4 text-center">
                          <span className="text-xs text-[#a69682] uppercase font-isaac-pixel block">
                            {lang === 'es' ? 'Giros Normales' : 'Normal Spins'}
                          </span>
                          <span className="text-3xl font-isaac-title text-amber-300 mt-2 block">
                            {distanceInfo.normalSteps}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono mt-1 block">
                            {has9Volt ? `${distanceInfo.charges9Volt} salas (con 9V)` : `${distanceInfo.chargesStandard} salas requeridas`}
                          </span>
                        </div>

                        <div className={`isaac-card p-4 text-center ${
                          distanceInfo.carBatteryFeasible ? 'border-emerald-600 bg-emerald-950/20' : 'border-amber-600 bg-amber-950/20'
                        }`}>
                          <span className="text-xs text-[#a69682] uppercase font-isaac-pixel block">
                            {lang === 'es' ? 'Con Batería de Coche' : 'With Car Battery'}
                          </span>
                          <span className="text-3xl font-isaac-title text-amber-300 mt-2 block">
                            {distanceInfo.carBatterySteps} {distanceInfo.carBatterySteps === 1 ? 'uso' : 'usos'}
                          </span>
                          <span className="text-xs mt-1 block font-mono">
                            {distanceInfo.carBatteryFeasible ? (
                              <span className="text-emerald-400 font-semibold">
                                ✅ {lang === 'es' ? '¡Impacto Exacto!' : 'Direct Hit!'}
                              </span>
                            ) : (
                              <span className="text-amber-400 font-semibold">
                                ⚠️ {lang === 'es' ? 'Te lo saltas por 1' : 'Overshoots by 1'}
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="isaac-card p-4 text-center">
                          <span className="text-xs text-[#a69682] uppercase font-isaac-pixel block">
                            {lang === 'es' ? 'Cargas de Batería' : 'Total Charges'}
                          </span>
                          <span className="text-3xl font-isaac-title text-amber-300 mt-2 block">
                            {hasCarBattery ? distanceInfo.chargesWithCarBattery : distanceInfo.chargesStandard}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono mt-1 block">
                            {lang === 'es' ? 'Equivalente a recargas completas' : 'Full spacebar recharges'}
                          </span>
                        </div>
                      </div>

                      {/* Parity Advice for Car Battery */}
                      {!distanceInfo.carBatteryFeasible && (
                        <div className="isaac-postit p-4 mt-2">
                          <div className="isaac-postit-tape"></div>
                          <strong className="font-isaac-doodle text-sm md:text-base text-red-950 block">
                            💡 {lang === 'es' ? 'Estrategia para no saltarte el ítem:' : 'Strategy to avoid bypassing:'}
                          </strong>
                          <p className="font-isaac-doodle text-xs md:text-sm text-[#2a160c] mt-1.5 leading-relaxed">
                            {lang === 'es' ? (
                              `La distancia es impar (${distanceInfo.normalSteps} giros). La Batería de Coche salta de 2 en 2, por lo que saltará directamente sobre ${currentDistTarget.name_es}. Solución: Haz 1 giro simple sin Batería de Coche (desequipándola temporalmente con Mantequilla o cambiando de activo), y luego usa la Batería para los ${distanceInfo.normalSteps - 1} giros restantes.`
                            ) : (
                              `The distance is odd (${distanceInfo.normalSteps} spins). Car Battery jumps by 2, bypassing ${currentDistTarget.name_en}. Solution: Do 1 single spin without Car Battery, then use Car Battery for the remaining spins.`
                            )}
                          </p>
                        </div>
                      )}

                      {/* Intermediate Path Visualizer */}
                      <div className="mt-4">
                        <h4 className="text-xs uppercase text-amber-400 font-isaac-pixel font-bold mb-2">
                          {lang === 'es' ? 'Recorrido Paso a Paso:' : 'Step-by-Step Path:'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#120d0a] border-2 border-[#38261b] rounded max-h-64 overflow-y-auto">
                          {distanceInfo.fullNormalPath.map((stepItem, idx) => (
                            <div key={stepItem.id} className="flex items-center gap-1.5 bg-[#20150f] border border-[#422c1f] p-1.5 rounded text-xs">
                              <span className="font-mono text-zinc-500 font-bold text-[10px]">#{idx + 1}</span>
                              <img src={`items/${stepItem.sprite}`} alt="" className="w-5 h-5 object-contain" />
                              <span className="text-amber-200 font-semibold">{lang === 'es' ? stepItem.name_es : stepItem.name_en}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">(ID {stepItem.id})</span>
                              {idx < distanceInfo.fullNormalPath.length - 1 && (
                                <ArrowRight size={12} className="text-zinc-600 ml-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: GOD TIER COMBOS
            ========================================================================= */}
        {activeTab === 'combos' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-isaac-title text-amber-300">
                  {lang === 'es' ? 'Trucos y Atajos Legendarios de Spindown Dice' : 'Legendary Spindown Dice Shortcuts'}
                </h3>
                <p className="text-xs text-[#a69682] font-isaac-pixel mt-0.5">
                  {lang === 'es' 
                    ? 'Los combos más rotos y codiciados de The Binding of Isaac Repentance:'
                    : 'The most game-breaking shortcuts discovered by the Isaac community:'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOD_TIER_COMBOS.map((combo, idx) => {
                const fromItem = itemsById[combo.fromId];
                const toItem = itemsById[combo.toId];
                if (!fromItem || !toItem) return null;

                return (
                  <div key={idx} className="isaac-card p-4 flex flex-col justify-between border-2 hover:border-amber-400/80 transition-all">
                    <div>
                      {/* Top Tag and Title */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs bg-red-950 text-red-300 border-2 border-red-700 px-2 py-0.5 rounded font-isaac-pixel font-bold">
                          {combo.tag}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-[#281a12] px-2.5 py-0.5 rounded border border-[#4d3222]">
                          {combo.spins} {combo.spins === 1 ? (lang === 'es' ? 'Giro' : 'Spin') : (lang === 'es' ? 'Giros' : 'Spins')}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-amber-200 mb-2">
                        {lang === 'es' ? combo.name_es : combo.name_en}
                      </h4>

                      {/* Visual Item Transition */}
                      <div className="flex items-center justify-center gap-4 my-3 p-3 bg-[#120c09] border-2 border-[#38261b] rounded shadow-inner">
                        <div className="text-center">
                          <img src={`items/${fromItem.sprite}`} alt="" className="w-10 h-10 object-contain mx-auto mb-1 drop-shadow" />
                          <span className="text-xs text-zinc-300 font-semibold block">{lang === 'es' ? fromItem.name_es : fromItem.name_en}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">ID #{fromItem.id}</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <ArrowRight size={22} className="text-amber-400 animate-pulse" />
                          <span className="text-[10px] text-amber-400 font-isaac-pixel mt-1">Spindown</span>
                        </div>

                        <div className="text-center">
                          <img src={`items/${toItem.sprite}`} alt="" className="w-10 h-10 object-contain mx-auto mb-1 drop-shadow" />
                          <span className="text-xs text-amber-300 font-bold block">{lang === 'es' ? toItem.name_es : toItem.name_en}</span>
                          <span className="text-[10px] text-amber-400 font-mono font-bold">ID #{toItem.id} (Q{toItem.quality})</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#a69682] leading-relaxed font-mono">
                        {lang === 'es' ? combo.description_es : combo.description_en}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-[#2e1f16] flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedForwardId(combo.fromId);
                          setActiveTab('forward');
                          playD6Sound(true);
                          triggerConfetti();
                        }}
                        className="isaac-btn text-xs py-1.5 px-3 flex items-center gap-1.5 font-isaac-pixel font-bold"
                      >
                        <Compass size={14} />
                        <span>{lang === 'es' ? 'Cargar en Calculadora' : 'Load in Calculator'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          SEARCH / ITEM PICKER MODAL (ISAAC DUNGEON CHEST STYLE)
          ========================================================================= */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="isaac-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-4 border-[#6e4e3a]">
            {/* Modal Header */}
            <div className="p-4 bg-[#241711] border-b-3 border-[#473022] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search size={20} className="text-amber-400" />
                <h3 className="font-bold text-amber-200 font-isaac-title text-sm md:text-base">
                  {lang === 'es' ? 'SELECCIONA UN OBJETO' : 'SELECT AN ITEM'}
                </h3>
              </div>
              <button 
                onClick={() => setPickerOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={22} />
              </button>
            </div>

            {/* Search Input & Quality / Pool Filters */}
            <div className="p-4 bg-[#19110d] border-b-2 border-[#3b271b] space-y-3">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder={lang === 'es' ? 'Buscar por nombre (Español o Inglés), ID (#118)...' : 'Search by name, ID (#118)...'}
                className="isaac-input font-mono"
                autoFocus
              />

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Quality Filter */}
                <div className="flex items-center gap-1 bg-[#120c09] p-1 border border-[#3b271b] rounded">
                  <span className="text-zinc-400 px-1 font-isaac-pixel">{lang === 'es' ? 'Calidad:' : 'Quality:'}</span>
                  {['all', '4', '3', '2', '1', '0'].map(q => (
                    <button
                      key={q}
                      onClick={() => setPickerQualityFilter(q)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        pickerQualityFilter === q ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {q === 'all' ? (lang === 'es' ? 'Todas' : 'All') : `Q${q}`}
                    </button>
                  ))}
                </div>

                {/* Pool Filter */}
                <div className="flex items-center gap-1 bg-[#120c09] p-1 border border-[#3b271b] rounded">
                  <span className="text-zinc-400 px-1 font-isaac-pixel">{lang === 'es' ? 'Pool:' : 'Pool:'}</span>
                  {['all', 'treasure', 'shop', 'boss', 'devil', 'angel', 'secret'].map(pool => (
                    <button
                      key={pool}
                      onClick={() => setPickerPoolFilter(pool)}
                      className={`px-2 py-0.5 rounded text-xs capitalize font-mono ${
                        pickerPoolFilter === pool ? 'bg-amber-400 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {pool === 'all' ? (lang === 'es' ? 'Todas' : 'All') : pool}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Items Grid List */}
            <div className="p-4 overflow-y-auto max-h-[60vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-[#120c08]">
              {filteredPickerItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 font-isaac-pixel">
                  {lang === 'es' ? 'No se encontraron objetos con ese criterio.' : 'No items match your search.'}
                </div>
              ) : (
                filteredPickerItems.map(item => {
                  const qInfo = getQualityBadge(item.quality);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="isaac-card p-2 flex items-center gap-2.5 text-left hover:border-amber-400 transition-all group"
                    >
                      <img 
                        src={`items/${item.sprite}`} 
                        alt={item.name_es} 
                        className="w-10 h-10 object-contain shrink-0 group-hover:scale-110 transition-transform drop-shadow" 
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-amber-200 truncate block">
                            {lang === 'es' ? item.name_es : item.name_en}
                          </span>
                          <span className={`text-[9px] px-1 rounded font-bold shrink-0 ${qInfo.bg} ${qInfo.border} ${qInfo.text}`}>
                            {qInfo.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          ID #{item.id} • {item.type}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LOCKED ITEMS MANAGER DRAWER / MODAL
          ========================================================================= */}
      {showLockedManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="isaac-panel w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-4 border-[#6e4e3a]">
            <div className="p-4 bg-[#241711] border-b-3 border-[#473022] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-amber-400" />
                <h3 className="font-bold text-amber-200 font-isaac-title text-sm md:text-base">
                  {lang === 'es' ? 'GESTIÓN DE ÍTEMS BLOQUEADOS' : 'LOCKED ITEMS MANAGER'}
                </h3>
              </div>
              <button 
                onClick={() => setShowLockedManager(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-4 bg-[#19110d] text-xs text-[#a69682] border-b-2 border-[#3b271b] space-y-2 font-mono">
              <p>
                {lang === 'es' ? (
                  'En The Binding of Isaac, si no has desbloqueado un objeto en tu partida, Spindown Dice lo salta automáticamente y sigue reduciendo el ID. Por defecto, esta calculadora asume una partida al 100% (todos desbloqueados).'
                ) : (
                  'In Isaac, locked items are skipped by Spindown Dice. By default, this calculator assumes a 100% save file with all items unlocked.'
                )}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setLockedItemIds(new Set())}
                  className="isaac-btn text-xs py-1 px-3 bg-emerald-950 border-emerald-700 text-emerald-200 font-isaac-pixel"
                >
                  {lang === 'es' ? 'Desbloquear Todos (Partida 100%)' : 'Unlock All (100% Save)'}
                </button>
                <button
                  onClick={() => {
                    setLockedItemIds(new Set([628, 331, 441, 678, 689, 691]));
                  }}
                  className="isaac-btn text-xs py-1 px-3 bg-amber-950 border-amber-700 text-amber-200 font-isaac-pixel"
                >
                  {lang === 'es' ? 'Bloquear Ítems Difíciles' : 'Lock Endgame Items'}
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[50vh] space-y-1 bg-[#120c08]">
              {items.slice(0, 100).map(it => {
                const isLocked = lockedItemIds.has(it.id);
                return (
                  <div 
                    key={it.id} 
                    onClick={() => {
                      const nextSet = new Set(lockedItemIds);
                      if (isLocked) nextSet.delete(it.id);
                      else nextSet.add(it.id);
                      setLockedItemIds(nextSet);
                    }}
                    className={`p-2 rounded flex items-center justify-between cursor-pointer border ${
                      isLocked ? 'bg-red-950/40 border-red-800 text-red-200' : 'bg-[#18100c] border-[#38261b] text-[#c9b9a5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={`items/${it.sprite}`} alt="" className="w-6 h-6 object-contain" />
                      <span className="font-semibold text-xs">{lang === 'es' ? it.name_es : it.name_en}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">(ID #{it.id})</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${isLocked ? 'bg-red-800 text-white' : 'bg-[#291b14] text-zinc-400'}`}>
                      {isLocked ? (lang === 'es' ? 'BLOQUEADO' : 'LOCKED') : (lang === 'es' ? 'DESBLOQUEADO' : 'UNLOCKED')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="max-w-6xl mx-auto px-4 mt-16 text-center text-xs text-[#7d6856] border-t-2 border-[#2d1e16] pt-6 font-mono">
        <p>The Binding of Isaac: Repentance © Nicalis, Inc. & Edmund McMillen. All sprites and assets extracted directly from the game files.</p>
        <p className="mt-1 font-isaac-doodle text-sm text-[#8f7560]">Crafted with precision for Spindown Dice mechanics & Car Battery parity calculations.</p>
      </footer>
    </div>
  );
}
