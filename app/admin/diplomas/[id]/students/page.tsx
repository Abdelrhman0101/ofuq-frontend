"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import Toast from "@/components/Toast";
import styles from "../AdminDiplomaCourses.module.css";
import "@/styles/toast.css";
import apiClient from "@/utils/apiClient";
import { getDownloadUrl } from "@/utils/certificateService";

type CertificateStatus = "not_generated" | "processing" | "generated" | "failed";

interface AdminDiplomaStudent {
  id: number;
  name: string;
  email: string;
  phone: string;
  progress: number;
  certificate_status: CertificateStatus;
  is_eligible: boolean;
  file_url?: string | null;
}

export default function AdminDiplomaStudentsPage() {
  const { id } = useParams() as { id: string };
  const diplomaId = Number(id);
  const router = useRouter();

  const [students, setStudents] = useState<AdminDiplomaStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info" | "confirm">("info");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchStudents = async (search = "", filter = "") => {
    try {
      setLoading(true);
      setError(null);
      const resp = await apiClient.get(`/admin/diplomas/${diplomaId}/students`, {
        params: { search, filter },
        cacheTTL: 10
      });
      const result = resp.data;
      const list = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.students)
          ? result.data.students
          : Array.isArray(result?.students)
            ? result.students
            : Array.isArray(result)
              ? result
              : [];
      const normalized: AdminDiplomaStudent[] = list.map((s: any) => {
        const progress = Number(s.progress ?? s.progress_percentage ?? 0);
        const status = String(s.certificate_status ?? s.status ?? "not_generated") as CertificateStatus;
        const fileUrl = s.file_url ?? s.certificate_file_url ?? s.file_path ?? null;
        return {
          id: Number(s.student_id ?? s.id ?? s.user_id ?? s.user?.id ?? 0),
          name: String(s.student_name ?? s.name ?? s.user?.name ?? ""),
          email: String(s.email ?? s.user?.email ?? ""),
          phone: String(s.phone ?? s.user?.phone ?? ""),
          progress,
          certificate_status: status,
          is_eligible: Boolean(s.is_eligible ?? progress >= 100),
          file_url: fileUrl ? getDownloadUrl(String(fileUrl)) : null,
        };
      });
      setStudents(normalized);
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || "فشل في جلب قائمة الطلاب";
      setError(message);
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(diplomaId) && diplomaId > 0) {
      const timer = setTimeout(() => {
        fetchStudents(searchTerm, filterStatus);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setError("معرف دبلومة غير صالح");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diplomaId, searchTerm, filterStatus]);

  const goBack = () => router.push(`/admin/diplomas/${diplomaId}`);

  const handleGenerate = async (student: AdminDiplomaStudent) => {
    if (!student.is_eligible || student.progress < 100) return;
    setGeneratingId(student.id);
    try {
      const resp = await apiClient.post(`/admin/diplomas/${diplomaId}/students/${student.id}/generate-certificate`);
      const result = resp.data;
      const message = result?.message || "تم بدء توليد الشهادة";
      setToastMessage(message);
      setToastType("success");
      setToastVisible(true);
      // حدّث الحالة محليًا إلى processing دون إعادة تحميل الصفحة
      setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, certificate_status: "processing" } : s)));
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || "فشل في توليد الشهادة";
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownload = (student: AdminDiplomaStudent) => {
    const url = student.file_url || "";
    if (!url) {
      setToastMessage("ملف الشهادة غير متاح بعد");
      setToastType("warning");
      setToastVisible(true);
      return;
    }
    try {
      window.open(url, "_blank");
    } catch (err) {
      setToastMessage("تعذر فتح ملف الشهادة");
      setToastType("error");
      setToastVisible(true);
    }
  };

  const StatusBadge = ({ status }: { status: CertificateStatus }) => {
    const common: React.CSSProperties = {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: "0.85rem",
    };
    if (status === "processing") {
      return (
        <span style={{ ...common, background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
          جارِ التجهيز...
        </span>
      );
    }
    if (status === "generated") {
      return <span style={{ ...common, background: "#ECFDF5", color: "#065F46", border: "1px solid #D1FAE5" }}>تم التوليد</span>;
    }
    if (status === "failed") {
      return <span style={{ ...common, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5" }}>فشل التوليد</span>;
    }
    return <span style={{ ...common, background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}>غير مولّدة</span>;
  };

  if (loading && !students.length && !searchTerm) {
    return <div className={styles.loading}>جاري التحميل...</div>;
  }
  if (error && !students.length) {
    return <div className={styles.error}>حدث خطأ: {error}</div>;
  }

  return (
    <AdminAuthGuard>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <div>
              <h1 className={styles.title}>إدارة خريجي الدبلومة</h1>
              <p className={styles.subtitle}>معرّف الدبلومة: {diplomaId}</p>
            </div>
            <button className={styles.backButton} onClick={goBack}>عودة</button>
          </div>
        </div>

        <div className={styles.list}>
          <div className={styles.controlsContainer}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>قائمة الطلاب</h2>
            <div className={styles.filterGroup}>
              <div className={styles.customDropdown} ref={dropdownRef}>
                <div
                  className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.isOpen : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>
                    {filterStatus === "" && "كل الحالات"}
                    {filterStatus === "ready" && "جاهز للتوليد"}
                    {filterStatus === "generated" && "تم التوليد"}
                    {filterStatus === "not_ready" && "غير جاهز"}
                    {filterStatus === "failed" && "فشل التوليد"}
                  </span>
                  <svg
                    className={styles.chevron}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {[
                      { value: "", label: "كل الحالات" },
                      { value: "ready", label: "جاهز للتوليد" },
                      { value: "generated", label: "تم التوليد" },
                      { value: "not_ready", label: "غير جاهز" },
                      { value: "failed", label: "فشل التوليد" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`${styles.dropdownItem} ${filterStatus === option.value ? styles.isSelected : ""}`}
                        onClick={() => {
                          setFilterStatus(option.value);
                          setDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="بحث بالاسم، البريد، أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <svg
                  className={styles.searchIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th style={{ textAlign: "center" }}>التقدم</th>
                  <th style={{ textAlign: "center" }}>حالة الشهادة</th>
                  <th style={{ textAlign: "center" }}>تواصل</th>
                  <th style={{ textAlign: "center" }}>الشهادة</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isDisabled = !student.is_eligible || student.progress < 100 || generatingId === student.id;
                  const progressPct = Math.max(0, Math.min(100, Number(student.progress || 0)));
                  return (
                    <tr key={String(student.id)}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontWeight: 600, color: "#1f2937" }}>{student.name}</span>
                          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{student.email}</span>
                          <span style={{ fontSize: "0.85rem", color: "#6b7280", direction: "ltr", textAlign: "right" }}>
                            {student.phone}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className={styles.progressContainer} style={{ margin: "0 auto" }}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${progressPct}%` }}
                            ></div>
                          </div>
                          <span className={styles.progressText}>{progressPct}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <StatusBadge status={student.certificate_status} />
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <a
                            href={`tel:${student.phone}`}
                            className={`${styles.btnContact} ${styles.btnCall}`}
                            title="اتصال"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          </a>
                          <button
                            className={`${styles.btnContact} ${styles.btnWhatsapp}`}
                            title="واتساب"
                            onClick={() => {
                              let message = `مرحباً ${student.name}،\n\n`;
                              if (student.certificate_status === 'generated' && student.file_url) {
                                const certLink = getDownloadUrl(student.file_url);
                                message += `نبارك لكم إتمام الدبلومة بنجاح! 🎓\n\nيمكنكم تحميل شهادتكم من الرابط التالي:\n${certLink}\n\n`;
                              } else {
                                message += `بخصوص الدبلومة المسجلين بها.\n\n`;
                              }
                              message += `مع تحيات إدارة المنصة.`;

                              const url = `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {(!student.is_eligible || student.progress < 100) && (
                            <button className={styles.btnAction} disabled>غير مكتمل</button>
                          )}
                          {student.is_eligible && student.progress === 100 && student.certificate_status === "not_generated" && (
                            <button
                              className={styles.btnPrimary}
                              disabled={isDisabled}
                              onClick={() => handleGenerate(student)}
                            >
                              {generatingId === student.id ? "جاري التنفيذ..." : "توليد الشهادة"}
                            </button>
                          )}
                          {student.certificate_status === "processing" && (
                            <button className={styles.btnAction} disabled>
                              جارِ التجهيز...
                            </button>
                          )}
                          {student.certificate_status === "generated" && (
                            <button className={styles.btnPrimary} onClick={() => handleDownload(student)}>
                              تحميل الشهادة
                            </button>
                          )}
                          {student.certificate_status === "failed" && (
                            <button
                              className={styles.btnPrimary}
                              style={{ backgroundColor: "#DC2626" }}
                              disabled={isDisabled}
                              onClick={() => handleGenerate(student)}
                            >
                              {generatingId === student.id ? "جاري التنفيذ..." : "إعادة المحاولة"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
                      {loading ? "جاري البحث..." : "لا يوجد طلاب مطابقين للبحث"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      </div>
    </AdminAuthGuard >
  );
}