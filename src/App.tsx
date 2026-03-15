/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  MapPin, 
  Camera, 
  Trash2, 
  CheckCircle2, 
  ChevronDown, 
  Info,
  X,
  Navigation,
  Star,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface ParkingData {
  floor: string;
  pillar: string;
  photo: string | null;
  memo: string;
  timestamp: number;
}

// --- Constants ---
const FLOORS = [
  '지상 6층', '지상 5층', '지상 4층', '지상 3층', '지상 2층', '지상 1층',
  '지하 1층', '지하 2층', '지하 3층'
];
const STORAGE_KEY = 'where_is_my_car_data';

export default function App() {
  const [parkingData, setParkingData] = useState<ParkingData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form State
  const [floor, setFloor] = useState(FLOORS[0]);
  const [pillar, setPillar] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setParkingData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved parking data', e);
      }
    }
  }, []);

  // Photo handling with compression
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsPhotoLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(compressedDataUrl);
          setIsPhotoLoading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save data with error handling
  const handleSave = () => {
    try {
      const newData: ParkingData = {
        floor,
        pillar,
        photo,
        memo,
        timestamp: Date.now(),
      };
      
      const serializedData = JSON.stringify(newData);
      localStorage.setItem(STORAGE_KEY, serializedData);
      
      setParkingData(newData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsRecording(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      alert('저장 공간이 부족하거나 오류가 발생했습니다. 사진 크기를 줄이거나 메모를 줄여보세요.');
    }
  };

  // Clear data
  const handleClear = () => {
    setParkingData(null);
    localStorage.removeItem(STORAGE_KEY);
    // Reset form
    setFloor(FLOORS[0]);
    setPillar('');
    setPhoto(null);
    setMemo('');
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center bg-sky-200 rounded-2xl shadow-inner overflow-hidden">
            {/* Cute White Car Body */}
            <div className="relative z-10 translate-y-1">
              <Car className="w-8 h-8 text-white fill-white" strokeWidth={1.5} />
              {/* Smile */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <Smile className="w-3 h-3 text-sky-400" />
              </div>
            </div>
            
            {/* Star Marker with P */}
            <div className="absolute top-1 right-1 z-20">
              <div className="relative flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 shadow-sm" />
                <span className="absolute text-[10px] font-black text-sky-800">P</span>
              </div>
            </div>

            {/* Background Pastel Bubbles */}
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white/20 rounded-full blur-sm" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/10 rounded-full blur-sm" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">
            내 차 어디 있지<span className="text-sky-300">?</span>
          </h1>
        </div>
        {parkingData && !isRecording && (
          <button 
            onClick={() => setIsRecording(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            새로 기록하기
          </button>
        )}
      </header>

      <main className="max-w-md mx-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="text-emerald-400 w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-emerald-400">저장 완료!</h2>
              <p className="text-slate-400">안전하게 주차를 마치셨네요!<br />제가 잘 기억해둘게요.</p>
            </motion.div>
          ) : !parkingData || isRecording ? (
            /* Recording Screen */
            <motion.div
              key="record"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section className="bg-[#111827]/80 border border-white/5 rounded-[32px] p-8 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-4 pb-6 mb-8 border-b border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/20">
                    <MapPin className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">오늘의 주차 위치 기록하기</h2>
                </div>

                <div className="space-y-8">
                    {/* Building-shaped Floor Selection */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">층수 선택 (빌딩)</label>
                      <div className="flex flex-col gap-2 bg-slate-900/30 p-4 rounded-[24px] border border-white/5">
                        {FLOORS.map((f) => {
                          const isUnderground = f.startsWith('지하');
                          return (
                            <button
                              key={f}
                              onClick={() => setFloor(f)}
                              className={`h-12 rounded-xl font-bold transition-all border ${
                                floor === f 
                                  ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] scale-[1.02] z-10' 
                                  : isUnderground 
                                    ? 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800/60'
                                    : 'bg-slate-700/20 border-white/5 text-slate-300 hover:bg-slate-700/40'
                              } ${f === '지상 1층' ? 'mb-4' : ''}`}
                            >
                              {f}
                              {f === '지상 1층' && <div className="text-[8px] opacity-50 mt-[-2px]">GROUND LEVEL</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  {/* Pillar Number - Appears when floor is selected (it's always selected by default, but we can animate it) */}
                  <AnimatePresence>
                    {floor && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                      >
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">구역 / 기둥 번호</label>
                        <input 
                          type="text"
                          placeholder="예: A-03, 12번 기둥"
                          value={pillar}
                          onChange={(e) => setPillar(e.target.value)}
                          className="w-full h-16 bg-slate-900/50 border border-white/5 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-700 text-center text-xl font-bold text-white"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">주차 공간 사진</label>
                    <div 
                      onClick={triggerCamera}
                      className={`w-full aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative ${
                        photo ? 'border-sky-500/50 bg-slate-900/30' : 'border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-white/10'
                      }`}
                    >
                      {isPhotoLoading ? (
                        <div className="animate-pulse text-slate-500">사진 처리 중...</div>
                      ) : photo ? (
                        <>
                          <img src={photo} alt="Parking" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-8 h-8" />
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Camera className="text-slate-600 w-12 h-12 mb-3" />
                          <span className="text-sm font-bold text-slate-500">사진 촬영 또는 업로드</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>

                  {/* Memo */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">간단 메모</label>
                    <textarea 
                      placeholder="예: 엘리베이터 입구 바로 앞"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full h-28 bg-slate-900/50 border border-white/5 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-700 text-white resize-none"
                    />
                  </div>

                  <div className="pt-4 text-center">
                    <div className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
                      WHEREISMYCAR • SIMPLE & FAST
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                  <button 
                    onClick={handleSave}
                    disabled={!pillar && !photo}
                    className="w-full h-16 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    주차 완료 저장하기
                  </button>
                  {isRecording && parkingData && (
                    <button 
                      onClick={() => setIsRecording(false)}
                      className="w-full h-14 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-2xl transition-all"
                    >
                      취소
                    </button>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            /* View Screen */
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-sky-400 font-medium flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4 animate-pulse" />
                  현재 주차된 위치입니다
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white">
                  {parkingData.floor}
                </h2>
                <div className="inline-block px-6 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                  <span className="text-2xl font-bold text-yellow-400">{parkingData.pillar || '구역 미지정'}</span>
                </div>
              </div>

              {parkingData.photo && (
                <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                  <img 
                    src={parkingData.photo} 
                    alt="Parking Spot" 
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
              )}

              {parkingData.memo && (
                <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 flex gap-4">
                  <Info className="text-sky-400 w-6 h-6 shrink-0" />
                  <p className="text-slate-300 leading-relaxed">{parkingData.memo}</p>
                </div>
              )}

              <div className="pt-6">
                <button 
                  onClick={handleClear}
                  className="w-full h-16 bg-white text-slate-900 font-bold text-lg rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-6 h-6" />
                  차 찾기 완료 (기록 삭제)
                </button>
                <p className="text-center text-xs text-slate-500 mt-4 uppercase tracking-widest">
                  기록 시간: {new Date(parkingData.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Branding */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center pointer-events-none">
        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          WhereIsMyCar • Simple & Fast
        </div>
      </footer>
    </div>
  );
}
