'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    PiCertificate,
    PiGraduationCap,
    PiUsers,
    PiLightbulb,
    PiBooks,
    PiMicrophone,
    PiRocket,
    PiHouse,
    PiCaretDown,
    PiCaretLeft,
    PiChalkboardTeacher,
    PiHandshake,
    PiChartLine,
    PiPhone,
    PiUsersThree,
    PiHeadset,
    PiNewspaper,
    PiMosque,
    PiMegaphone,
    PiBriefcase,
    PiHeart,
    PiCode,
    PiBrain,
    PiHandHeart,
    PiVideo,
    PiChatCircle,
    PiCalendarCheck,
    PiQuestion,
    PiLightning,
    PiTrophy,
    PiScroll,
    PiWrench,
    PiRobot,
    PiBookOpen,
    PiFile,
    PiFileAudio,
    PiMagnifyingGlass,
    PiCurrencyDollar,
    PiDevices,
    PiBuilding,
    PiStorefront,
    PiGlobe,
    PiFlask,
    PiHandCoins
} from 'react-icons/pi';
import styles from './MegaMenu.module.css';

// Define menu structure types
interface SubMenuItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    comingSoon?: boolean;
}

interface NestedMenuItem extends SubMenuItem {
    children?: SubMenuItem[];
}

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    hasDropdown: boolean;
    comingSoon?: boolean;
    children?: NestedMenuItem[];
}

// Existing pages that work (keep href as is)
// /, /about, /diploms, /community, /verify-certificate

// Navigation Data
const menuData: MenuItem[] = [
    {
        label: 'الرئيسية',
        href: '/',
        icon: <PiHouse />,
        hasDropdown: true,
        children: [
            { label: 'من نحن', href: '/about', icon: <PiUsersThree /> },
            { label: 'رواد المنصة حول العالم', href: '#', icon: <PiGlobe />, comingSoon: true },
            { label: 'الإحصائيات', href: '#', icon: <PiChartLine />, comingSoon: true },
            { label: 'بيانات التواصل', href: '#', icon: <PiPhone />, comingSoon: true },
            { label: 'عداد المسجلين', href: '#', icon: <PiUsers />, comingSoon: true },
            { label: 'شؤون الطلاب', href: '#', icon: <PiGraduationCap />, comingSoon: true },
            { label: 'الدعم الفني', href: '#', icon: <PiHeadset />, comingSoon: true },
            { label: 'الصفحات في الوسائط', href: '#', icon: <PiNewspaper />, comingSoon: true },
        ]
    },
    {
        label: 'الدبلومات',
        href: '/diploms',
        icon: <PiGraduationCap />,
        hasDropdown: true,
        children: [
            { label: 'التربوية', href: '/diploms?category=educational', icon: <PiChalkboardTeacher /> },
            { label: 'الدعوية', href: '/diploms?category=dawah', icon: <PiMosque /> },
            { label: 'الإعلامية', href: '/diploms?category=media', icon: <PiMegaphone /> },
            { label: 'الإدارية', href: '/diploms?category=management', icon: <PiBriefcase /> },
            { label: 'الشرعية', href: '/diploms?category=sharia', icon: <PiScroll /> },
            { label: 'تطوير الذات', href: '/diploms?category=self-development', icon: <PiHeart /> },
            { label: 'التقنية', href: '/diploms?category=tech', icon: <PiCode /> },
            { label: 'السلوكية', href: '/diploms?category=behavioral', icon: <PiBrain /> },
            { label: 'المهنية', href: '/diploms?category=professional', icon: <PiWrench /> },
            { label: 'خدمة المجتمع', href: '/diploms?category=community-service', icon: <PiHandHeart /> },
        ]
    },
    {
        label: 'مجتمع أفق',
        href: '/community',
        icon: <PiUsers />,
        hasDropdown: true,
        children: [
            { label: 'اللقاءات الإثرائية', href: '#', icon: <PiCalendarCheck />, comingSoon: true },
            { label: 'المنتدى التفاعلي', href: '#', icon: <PiChatCircle />, comingSoon: true },
            { label: 'الإعلانات', href: '#', icon: <PiMegaphone />, comingSoon: true },
            { label: 'أخبار المنصة', href: '#', icon: <PiNewspaper />, comingSoon: true },
            { label: 'صفحة الخبراء', href: '#', icon: <PiChalkboardTeacher />, comingSoon: true },
            { label: 'شات الحوار بين الرواد', href: '#', icon: <PiChatCircle />, comingSoon: true },
            { label: 'الاستشارات', href: '#', icon: <PiQuestion />, comingSoon: true },
        ]
    },
    {
        label: 'نادي الابتكار',
        href: '#',
        icon: <PiLightbulb />,
        hasDropdown: true,
        comingSoon: true,
        children: [
            { label: 'كورسات الابتكار', href: '#', icon: <PiGraduationCap />, comingSoon: true },
            { label: 'ابتكارات الرواد', href: '#', icon: <PiLightning />, comingSoon: true },
            { label: 'براءات الاختراع', href: '#', icon: <PiTrophy />, comingSoon: true },
            { label: 'ورش عمل صناعة الأفكار', href: '#', icon: <PiWrench />, comingSoon: true },
            { label: 'الذكاء الاصطناعي', href: '#', icon: <PiRobot />, comingSoon: true },
            {
                label: 'كتابي',
                href: '#',
                icon: <PiBookOpen />,
                comingSoon: true,
                children: [
                    { label: 'تلخيص', href: '#', icon: <PiFile />, comingSoon: true },
                    { label: 'صوتي', href: '#', icon: <PiFileAudio />, comingSoon: true },
                    { label: 'بودكاست', href: '#', icon: <PiMicrophone />, comingSoon: true },
                    { label: 'تشجير', href: '#', icon: <PiBrain />, comingSoon: true },
                    { label: 'رسم بياني', href: '#', icon: <PiChartLine />, comingSoon: true },
                    { label: 'أصل الكتاب', href: '#', icon: <PiBookOpen />, comingSoon: true },
                    { label: 'اختبار وشهادة', href: '#', icon: <PiCertificate />, comingSoon: true },
                ]
            },
        ]
    },
    {
        label: 'المعرض',
        href: '#',
        icon: <PiBooks />,
        hasDropdown: true,
        comingSoon: true,
        children: [
            { label: 'الكتب والمقررات', href: '#', icon: <PiBookOpen />, comingSoon: true },
            { label: 'الأدلة والوثائق', href: '#', icon: <PiFile />, comingSoon: true },
            { label: 'الملخصات', href: '#', icon: <PiFile />, comingSoon: true },
            { label: 'الكورسات', href: '#', icon: <PiGraduationCap />, comingSoon: true },
            { label: 'الفيديوهات', href: '#', icon: <PiVideo />, comingSoon: true },
            { label: 'الملفات الصوتية', href: '#', icon: <PiFileAudio />, comingSoon: true },
            { label: 'البحوث والدراسات', href: '#', icon: <PiFlask />, comingSoon: true },
            { label: 'اكسب معنا', href: '#', icon: <PiCurrencyDollar />, comingSoon: true },
        ]
    },
    {
        label: 'زاد المحاضر والخطيب',
        href: '#',
        icon: <PiMicrophone />,
        hasDropdown: false,
        comingSoon: true,
    },
    {
        label: 'فضاء أفق',
        href: '#',
        icon: <PiRocket />,
        hasDropdown: true,
        comingSoon: true,
        children: [
            { label: 'التطبيقات', href: '#', icon: <PiDevices />, comingSoon: true },
            { label: 'الأكاديميات', href: '#', icon: <PiBuilding />, comingSoon: true },
            { label: 'المتجر', href: '#', icon: <PiStorefront />, comingSoon: true },
            { label: 'الخدمات الرقمية', href: '#', icon: <PiGlobe />, comingSoon: true },
            { label: 'الخدمات البحثية', href: '#', icon: <PiMagnifyingGlass />, comingSoon: true },
            { label: 'التوكيلات', href: '#', icon: <PiHandCoins />, comingSoon: true },
        ]
    },
];

// MegaMenu Component
const MegaMenu = () => {
    const pathname = usePathname();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
                setActiveSubmenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMouseEnter = (label: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setActiveDropdown(label);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
            setActiveSubmenu(null);
        }, 150);
    };

    const handleSubmenuEnter = (label: string) => {
        setActiveSubmenu(label);
    };

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname?.startsWith(href);
    };

    return (
        <nav className={styles.megaMenu} ref={dropdownRef}>
            <ul className={styles.menuList}>
                {menuData.map((item) => (
                    <li
                        key={item.label}
                        className={styles.menuItem}
                        onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.label)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Link
                            href={item.href}
                            className={clsx(
                                styles.menuLink,
                                isActive(item.href) && styles.active
                            )}
                        >
                            <span className={styles.menuIcon}>{item.icon}</span>
                            <span className={styles.menuLabel}>{item.label}</span>
                            {item.hasDropdown && (
                                <PiCaretDown className={clsx(
                                    styles.dropdownArrow,
                                    activeDropdown === item.label && styles.rotated
                                )} />
                            )}
                        </Link>

                        {/* Dropdown Panel */}
                        {item.hasDropdown && item.children && activeDropdown === item.label && (
                            <div
                                className={styles.dropdownPanel}
                                onMouseEnter={() => handleMouseEnter(item.label)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className={styles.dropdownGrid}>
                                    {item.children.map((child) => (
                                        <div
                                            key={child.label}
                                            className={clsx(
                                                styles.dropdownItem,
                                                child.children && styles.hasSubmenu,
                                                child.comingSoon && styles.comingSoon
                                            )}
                                            onMouseEnter={() => child.children && handleSubmenuEnter(child.label)}
                                        >
                                            {child.comingSoon ? (
                                                <span className={clsx(styles.dropdownLink, styles.disabledLink)}>
                                                    <span className={styles.dropdownIcon}>{child.icon}</span>
                                                    <span>{child.label}</span>
                                                    <span className={styles.comingSoonBadge}>قريباً</span>
                                                </span>
                                            ) : (
                                                <Link href={child.href} className={styles.dropdownLink}>
                                                    <span className={styles.dropdownIcon}>{child.icon}</span>
                                                    <span>{child.label}</span>
                                                    {child.children && <PiCaretLeft className={styles.submenuArrow} />}
                                                </Link>
                                            )}

                                            {/* Nested Submenu (for كتابي) */}
                                            {child.children && activeSubmenu === child.label && (
                                                <div className={styles.submenuPanel}>
                                                    {child.children.map((subChild) => (
                                                        subChild.comingSoon ? (
                                                            <span
                                                                key={subChild.label}
                                                                className={clsx(styles.submenuLink, styles.disabledLink)}
                                                            >
                                                                <span className={styles.submenuIcon}>{subChild.icon}</span>
                                                                <span>{subChild.label}</span>
                                                                <span className={styles.comingSoonBadge}>قريباً</span>
                                                            </span>
                                                        ) : (
                                                            <Link
                                                                key={subChild.label}
                                                                href={subChild.href}
                                                                className={styles.submenuLink}
                                                            >
                                                                <span className={styles.submenuIcon}>{subChild.icon}</span>
                                                                <span>{subChild.label}</span>
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default MegaMenu;
