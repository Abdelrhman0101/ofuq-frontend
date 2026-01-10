 "use client";
 
 import React, { useEffect, useMemo, useState } from "react";
 import styles from "./SectionsManager.module.css";
 
 type SectionItem = {
   label: string;
   slug: string;
 };
 
 const STORAGE_KEY = "ofuq_sections";
 
 function getDefaultSections(): SectionItem[] {
   return [
     { label: "التربوية", slug: "educational" },
     { label: "الدعوية", slug: "dawah" },
     { label: "الإعلامية", slug: "media" },
     { label: "الإدارية", slug: "management" },
     { label: "الشرعية", slug: "sharia" },
     { label: "تطوير الذات", slug: "self-development" },
     { label: "التقنية", slug: "tech" },
     { label: "السلوكية", slug: "behavioral" },
     { label: "المهنية", slug: "professional" },
     { label: "خدمة المجتمع", slug: "community-service" },
   ];
 }
 
 function loadSections(): SectionItem[] {
   try {
     const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
     if (!raw) return getDefaultSections();
     const parsed = JSON.parse(raw);
     if (Array.isArray(parsed)) {
       return parsed.filter((x) => x && typeof x.label === "string" && typeof x.slug === "string");
     }
     return getDefaultSections();
   } catch {
     return getDefaultSections();
   }
 }
 
 function saveSections(items: SectionItem[]) {
   try {
     if (typeof window !== "undefined") {
       window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
     }
   } catch {}
 }
 
 export default function SectionsManager({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
   const [sections, setSections] = useState<SectionItem[]>([]);
   const [label, setLabel] = useState("");
   const [slug, setSlug] = useState("");
 
   useEffect(() => {
     if (isOpen) {
       setSections(loadSections());
     }
   }, [isOpen]);
 
   const canAdd = useMemo(() => {
     const l = label.trim();
     const s = slug.trim();
     if (!l || !s) return false;
     if (!/^[a-z0-9\-]+$/i.test(s)) return false;
     if (sections.some((x) => x.slug.toLowerCase() === s.toLowerCase())) return false;
     return true;
   }, [label, slug, sections]);
 
   const handleAdd = () => {
     if (!canAdd) return;
     const next = [...sections, { label: label.trim(), slug: slug.trim() }];
     setSections(next);
     saveSections(next);
     setLabel("");
     setSlug("");
   };
 
   const handleDelete = (slugToDelete: string) => {
     const next = sections.filter((x) => x.slug !== slugToDelete);
     setSections(next);
     saveSections(next);
   };
 
   if (!isOpen) return null;
 
   return (
     <div className={styles.overlay} role="dialog" aria-modal="true">
       <div className={styles.modal}>
         <div className={styles.header}>
           <h3 className={styles.title}>ادارة الاقسام</h3>
           <button className={styles.closeBtn} onClick={onClose}>إغلاق</button>
         </div>
         <div className={styles.content}>
           <div className={styles.formRow}>
             <input
               type="text"
               placeholder="اسم القسم"
               className={styles.input}
               value={label}
               onChange={(e) => setLabel(e.target.value)}
             />
             <input
               type="text"
               placeholder="المعرف (slug)"
               className={styles.input}
               value={slug}
               onChange={(e) => setSlug(e.target.value)}
             />
             <button className={styles.btnPrimary} onClick={handleAdd} disabled={!canAdd}>إضافة</button>
           </div>
           <div className={styles.list}>
             <div className={styles.listHeader}>
               <div>الاسم</div>
               <div>المعرف</div>
               <div>إجراءات</div>
             </div>
             {sections.map((item) => (
               <div key={item.slug} className={styles.listItem}>
                 <div>{item.label}</div>
                 <div>{item.slug}</div>
                 <div>
                   <button className={styles.btnDanger} onClick={() => handleDelete(item.slug)}>حذف</button>
                 </div>
               </div>
             ))}
           </div>
         </div>
         <div className={styles.footer}>
           <button className={styles.btnSecondary} onClick={onClose}>تم</button>
         </div>
       </div>
     </div>
   );
 }
