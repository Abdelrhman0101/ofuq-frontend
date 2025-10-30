"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { FaGraduationCap, FaGlobe, FaUsers, FaChartLine } from 'react-icons/fa';
import { geoCentroid } from "d3-geo";
import { getGeneralStats, getStudentsByCountry, type GeneralStats, type StudentsByCountryItem } from "@/utils/statsService";
import { getPublicDiplomasCount } from "@/utils/categoryService";
import nationalities from "@/data/nationalities.json";
import styles from "./WorldUsersMap.module.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type HoverInfo = {
  nameAr: string;
  count: number;
  offsetX: number;
  offsetY: number;
};

function normalizeArabic(input: string): string {
  const diacritics = /[\u064B-\u0652]/g; // التشكيل
  const tatweel = /\u0640/g; // التطويل
  return input
    .replace(diacritics, "")
    .replace(tatweel, "")
    .replace(/\s+/g, "")
    .trim();
}

function normalizeEnglish(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u2019'`"\-(),.]/g, "")
    .replace(/\b(the|and|of|republic|federation|kingdom|state|states)\b/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function arabicToEnglishCountry(arName: string): string | null {
  const arNorm = normalizeArabic(arName);
  const item = (nationalities as any[]).find((n) => normalizeArabic(String(n?.arabic_name || "")) === arNorm);
  return item?.english_name ?? null;
}

// عدّاد رقمي بسيط مع حركة ذكية
function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setDisplay(Math.floor(value * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

export default function WorldUsersMap() {
  const [distribution, setDistribution] = useState<StudentsByCountryItem[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [diplomasCount, setDiplomasCount] = useState<number>(0);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [hoverCoords, setHoverCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dist, gen, diplCount] = await Promise.all([
          getStudentsByCountry(),
          getGeneralStats(),
          getPublicDiplomasCount(),
        ]);
        if (mounted) {
          setDistribution(dist);
          setGeneralStats(gen);
          setDiplomasCount(diplCount);
        }
      } catch (e) {
        // Logged inside service
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // تحسين الأداء: ترتيب التوزيع تنازليًا
  const sortedDistribution = useMemo(
    () => [...distribution].sort((a, b) => b.students_count - a.students_count),
    [distribution]
  );

  // نسب تقدم ذكية للحلقات (يمكن تعديل الأهداف حسب الحاجة)
  const MAX_COUNTRIES = 195;
  const TARGET_STUDENTS = 5000;
  const TARGET_COURSES = 200;
  const TARGET_DIPLOMAS = 60;

  const progressCountries = Math.round(Math.min(100, (distribution.length / MAX_COUNTRIES) * 100));
  const progressStudents = Math.round(Math.min(100, ((generalStats?.total_students ?? 0) / TARGET_STUDENTS) * 100));
  const progressCourses = Math.round(Math.min(100, ((generalStats?.total_courses ?? 0) / TARGET_COURSES) * 100));
  const progressDiplomas = Math.round(Math.min(100, (diplomasCount / TARGET_DIPLOMAS) * 100));

  return (
    <section className={styles['world-map-section']}>
      <div className={styles['world-map-wrapper']}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>رواد المنصة حول العالم</h2>
          <p className={styles['section-subtitle']}>مرّر الفأرة على النقاط لمعرفة البلد وعدد الطلاب</p>
        </div>

        <div className={styles['map-container']}>
          <ComposableMap projectionConfig={{ scale: 160 }}>
            {/* تعريف التدرجات اللونية للعلامات */}
            <defs>
              <radialGradient id="markerGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4142D0" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#019EBB" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#019EBB" stopOpacity="0.6" />
              </radialGradient>
              <radialGradient id="markerGradientHover" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4142D0" stopOpacity="1" />
                <stop offset="50%" stopColor="#019EBB" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#019EBB" stopOpacity="0.7" />
              </radialGradient>
              {/* تأثير الوهج للعلامات */}
              <filter id="markerGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) => (
                <>
                  {geographies.map((geo: any) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="rgba(100, 116, 139, 0.1)"
                      stroke="rgba(1, 158, 187, 0.2)"
                      strokeWidth={0.8}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          fill: "rgba(1, 158, 187, 0.05)",
                          stroke: "rgba(1, 158, 187, 0.3)",
                          outline: "none"
                        },
                        pressed: { outline: "none" }
                      }}
                    />
                  ))}

                  {sortedDistribution.map((item, index) => {
                    const englishName = arabicToEnglishCountry(item.country_ar);
                    if (!englishName) return null;
                    const matchedGeo = geographies.find((g: any) => {
                      const props = g?.properties || {};
                      const candidate = props.name || props.NAME || props.NAME_EN || props.ADMIN || "";
                      const cNorm = normalizeEnglish(candidate);
                      const eNorm = normalizeEnglish(englishName);
                      return cNorm === eNorm || cNorm.includes(eNorm) || eNorm.includes(cNorm);
                    });
                    if (!matchedGeo) return null;
                    const [lon, lat] = geoCentroid(matchedGeo) as [number, number];
                    
                    // حساب حجم العلامة بناءً على عدد الطلاب
                    const baseRadius = 4;
                    const maxRadius = 12;
                    const radius = Math.max(baseRadius, Math.min(maxRadius, baseRadius + Math.sqrt(item.students_count) * 0.8));
                    
                    // تأخير الحركة لكل علامة
                    const animationDelay = index * 0.1;
                    
                  return (
                    <Marker key={`${item.country_ar}-${lon}-${lat}`} coordinates={[lon, lat]}> 
                      <g
                        onMouseEnter={(e) => {
                          setHoverInfo({
                            nameAr: item.country_ar,
                            count: item.students_count,
                            offsetX: 0,
                            offsetY: -80,
                          });
                          setHoverKey(item.country_ar);
                          setHoverCoords([lon, lat]);
                        }}
                        onMouseLeave={() => { setHoverInfo(null); setHoverKey(null); }}
                        className={styles['marker-group']}
                        style={{
                          animationDelay: `${animationDelay}s`
                        }}
                      >
                        {/* دائرة الوهج الخارجية */}
                        <circle 
                          r={radius + 4} 
                          fill="rgba(1, 158, 187, 0.2)"
                          className={styles['marker-outer-glow']}
                          style={{
                            animation: `markerPulse 3s ease-in-out infinite ${animationDelay}s`,
                            pointerEvents: 'none'
                          }}
                        />
                        
                        {/* إضافة طبقة إضافية للتوهج الخارجي */}
                        <circle 
                          r={radius + 8} 
                          fill="url(#markerGradient)"
                          className={styles['marker-outer-glow']}
                          style={{
                            animationDelay: `${index * 0.2}s`,
                            pointerEvents: 'none'
                          }}
                        />
                          
                          {/* العلامة الرئيسية */}
                          <circle 
                            r={radius} 
                            fill={hoverKey === item.country_ar ? "url(#markerGradientHover)" : "url(#markerGradient)"}
                            className={styles['marker-glow']}
                            filter="url(#markerGlow)"
                            style={{
                              cursor: 'pointer',
                              animation: `markerPulse 3s ease-in-out infinite ${animationDelay}s`
                            }}
                          />
                          
                          {/* نقطة مركزية صغيرة */}
                          <circle 
                            r={2} 
                            fill="#ffffff"
                            opacity="0.9"
                            style={{
                              animation: `markerPulse 3s ease-in-out infinite ${animationDelay + 0.5}s`
                            }}
                          />
                          
                          {/* التولتيب يُعرض في طبقة Overlay فقط لمنع التكرار */}
                        </g>
                      </Marker>
                  );
                })}

                {/* Overlay لرفع العنصر المُشار إليه والتولتيب فوق الجميع */}
                {hoverKey && hoverCoords && (() => {
                  const hi = distribution.find(d => d.country_ar === hoverKey);
                  if (!hi) return null;
                  const baseRadius = 4;
                  const maxRadius = 12;
                  const radius = Math.max(baseRadius, Math.min(maxRadius, baseRadius + Math.sqrt(hi.students_count) * 0.8));
                  return (
                    <Marker key={`hover-overlay-${hoverKey}`} coordinates={hoverCoords}>
                      <g className={`${styles['marker-group']} ${styles['marker-overlay'] ?? ''}`} style={{ pointerEvents: 'none' }}>
                        <circle r={radius + 4} fill="rgba(1, 158, 187, 0.2)" className={styles['marker-outer-glow']} />
                        <circle r={radius + 8} fill="url(#markerGradient)" className={styles['marker-outer-glow']} />
                        <circle r={radius} fill="url(#markerGradientHover)" className={styles['marker-glow']} filter="url(#markerGlow)" />
                        <circle r={2} fill="#ffffff" opacity="0.9" />
                        {hoverInfo && (
                          <g transform={`translate(${hoverInfo.offsetX}, ${hoverInfo.offsetY})`} className={styles['tooltip-group']}>
                            <rect x="2" y="2" rx={10} ry={10} width={180} height={60} fill="rgba(0, 0, 0, 0.1)" className={styles['tooltip-shadow']} />
                            <rect rx={10} ry={10} width={180} height={60} fill="white" stroke="#019EBB" strokeWidth="2" className={styles['tooltip-rect']} />
                            <rect rx={10} ry={10} width={180} height={24} fill="url(#markerGradient)" />
                            <text x={90} y={16} className={styles['tooltip-country']} textAnchor="middle" dominantBaseline="middle" fontWeight="700" fontSize="13" fill="white">{hoverInfo.nameAr}</text>
                            <g className={styles['tooltip-body']}>
                              <text x={90} y={40} className={styles['student-count']} textAnchor="middle" dominantBaseline="middle" fill="#019EBB" fontWeight="700" fontSize="18">{hoverInfo.count.toLocaleString()}</text>
                              <text x={90} y={54} className={styles['tooltip-label']} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontWeight="500" fontSize="11">طالب</text>
                            </g>
                          </g>
                        )}
                      </g>
                    </Marker>
                  );
                })()}
                </>
              )}
            </Geographies>
          </ComposableMap>
        </div>

        {/* قسم الإحصائيات بتصميم احترافي عصري */}
        <div className={styles['stats-grid']}>
          {/* بطاقة الدول */}
          <div className={styles['stat-card']} style={{ animationDelay: '0.1s' }}>
            <div className={styles['stat-header']}>
              <div className={styles['stat-progress']} style={{ ['--progress' as any]: progressCountries }}>
                <div className={styles['stat-progress-inner']}>
                  <FaGlobe className={styles['stat-icon']} />
                </div>
              </div>
              <h3 className={styles['stat-title']}>الدول</h3>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-number']}><CountUp value={distribution.length} /></div>
              <div className={styles['stat-label']}>دولة</div>
              <div className={styles['stat-description']}>عدد الدول المشاركة</div>
            </div>
          </div>

          {/* بطاقة إجمالي الطلاب */}
          <div className={styles['stat-card']} style={{ animationDelay: '0.2s' }}>
            <div className={styles['stat-header']}>
              <div className={styles['stat-progress']} style={{ ['--progress' as any]: progressStudents }}>
                <div className={styles['stat-progress-inner']}>
                  <FaUsers className={styles['stat-icon']} />
                </div>
              </div>
              <h3 className={styles['stat-title']}>إجمالي الطلاب</h3>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-number']}><CountUp value={(generalStats?.total_students ?? 0)} /></div>
              <div className={styles['stat-label']}>طالب</div>
              <div className={styles['stat-description']}>إجمالي الطلاب المسجلين</div>
            </div>
          </div>

          {/* بطاقة المقررات */}
          <div className={styles['stat-card']} style={{ animationDelay: '0.3s' }}>
            <div className={styles['stat-header']}>
              <div className={styles['stat-progress']} style={{ ['--progress' as any]: progressCourses }}>
                <div className={styles['stat-progress-inner']}>
                  <FaGraduationCap className={styles['stat-icon']} />
                </div>
              </div>
              <h3 className={styles['stat-title']}>المقررات</h3>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-number']}><CountUp value={(generalStats?.total_courses ?? 0)} /></div>
              <div className={styles['stat-label']}>مقرر</div>
              <div className={styles['stat-description']}>المقررات المتاحة</div>
            </div>
          </div>

          {/* بطاقة الدبلومات */}
          <div className={styles['stat-card']} style={{ animationDelay: '0.4s' }}>
            <div className={styles['stat-header']}>
              <div className={styles['stat-progress']} style={{ ['--progress' as any]: progressDiplomas }}>
                <div className={styles['stat-progress-inner']}>
                  <FaChartLine className={styles['stat-icon']} />
                </div>
              </div>
              <h3 className={styles['stat-title']}>الدبلومات</h3>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-number']}><CountUp value={diplomasCount} /></div>
              <div className={styles['stat-label']}>دبلومة</div>
              <div className={styles['stat-description']}>الدبلومات المتاحة للنشر</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}