"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import Toast from "@/components/Toast";
import styles from "../AdminDiplomaCourses.module.css";
import "@/styles/toast.css";
import apiClient from "@/utils/apiClient";
import { getDownloadUrl } from "@/utils/certificateService";

type CertificateStatus = "not_generated" | "processing" | "generated";

interface AdminDiplomaStudent {
  id: number;
  name: string;
  email: string;
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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await apiClient.get(`/admin/diplomas/${diplomaId}/students`, { cacheTTL: 10 });
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
      fetchStudents();
    } else {
      setError("معرف دبلومة غير صالح");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diplomaId]);

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
    return <span style={{ ...common, background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}>غير مولّدة</span>;
  };

  if (loading) {
    return <div className={styles.loading}>جاري التحميل...</div>;
  }
  if (error) {
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
          <h2 className={styles.sectionTitle}>قائمة الطلاب</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>التقدم</th>
                  <th>حالة الشهادة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const isDisabled = !s.is_eligible || s.progress < 100 || generatingId === s.id;
                  const progressPct = Math.max(0, Math.min(100, Number(s.progress || 0)));
                  return (
                    <tr key={String(s.id)}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong>{s.name || "—"}</strong>
                          <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>{s.email || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "220px" }}>
                          <div style={{ width: "100%", height: 8, background: "#e9ecef", borderRadius: 4, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${progressPct}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #019EBB, #0288A3)",
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 6 }}>{progressPct}%</div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={s.certificate_status} />
                      </td>
                      <td className={styles.actionsCell}>
                        {(!s.is_eligible || s.progress < 100) && (
                          <button className={styles.btnAction} disabled>غير مكتمل</button>
                        )}
                        {s.is_eligible && s.progress === 100 && s.certificate_status === "not_generated" && (
                          <button
                            className={styles.btnPrimary}
                            disabled={isDisabled}
                            onClick={() => handleGenerate(s)}
                          >
                            {generatingId === s.id ? "جاري التنفيذ..." : "توليد الشهادة"}
                          </button>
                        )}
                        {s.certificate_status === "processing" && (
                          <button className={styles.btnAction} disabled>
                            جارِ التجهيز...
                          </button>
                        )}
                        {s.certificate_status === "generated" && (
                          <button className={styles.btnPrimary} onClick={() => handleDownload(s)}>
                            تحميل الشهادة
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>لا يوجد طلاب مسجلون</td>
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
    </AdminAuthGuard>
  );
}