import React, { useState } from 'react';
import {
    Phone,
    MessageCircle,
    X,
    Edit3,
    GraduationCap,
    Clock,
    Calendar,
    Send,
    Check,
    ChevronRight,
    User,
    BookOpen,
    Heart,
    FileText,
} from 'lucide-react';
import { AdmissionContact } from './AdmissionsContactsTable';

export interface StudentDetailsModalProps {
    contact: AdmissionContact | null;
    isOpen: boolean;
    onClose: () => void;
    onLogCall: (contact: AdmissionContact) => void;
    onWhatsApp?: (contact: AdmissionContact) => void;
}

type TabType = 'personal' | 'academic' | 'preferences' | 'activity';

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
    contact,
    isOpen,
    onClose,
    onLogCall,
    onWhatsApp,
}) => {
    if (!isOpen || !contact) return null;

    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [currentStage, setCurrentStage] = useState(contact.status || 'Contacted');
    const [isEditing, setIsEditing] = useState(false);

    // Dynamic initials
    const initials = contact.student_name
        .split(' ')
        .map((w) => w.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const stages = [
        'New',
        'Contacted',
        'Interested',
        'Counselling',
        'Applied',
        'Admitted',
        'Not Interested',
    ];

    const handleWhatsAppClick = () => {
        if (onWhatsApp) {
            onWhatsApp(contact);
        } else {
            const cleanPhone = contact.phone_number.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        }
    };

    // Helper for degree type
    const getDegreeType = (course: string) => {
        const lower = course.toLowerCase();
        if (lower.includes('pharmacy')) return 'B.Pharm';
        if (lower.includes('nursing')) return 'B.Sc';
        if (lower.includes('business') || lower.includes('bba')) return 'BBA';
        if (lower.includes('medicine') || lower.includes('mbbs')) return 'MBBS';
        return 'B.Tech';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 my-6">
                {/* ============================================================== */}
                {/* MODAL HEADER */}
                {/* ============================================================== */}
                <div className="flex flex-col gap-4 p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            {/* Avatar Initials Circle */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0f4f1] text-[#39854a] font-bold text-sm tracking-wider dark:bg-green-950/40">
                                {initials}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {contact.student_name}
                                    </h2>
                                    <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-mono font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        {contact.enquiry_id}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    {contact.city}, {contact.area} · Preferred:{' '}
                                    <span className="font-semibold text-[#39854a]">
                                        {contact.target_course}
                                    </span>{' '}
                                    · AY 2026–27
                                </p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onLogCall(contact)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#39854a] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2e6d3c]"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                <span>Log Call</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleWhatsAppClick}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#39854a]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#39854a] shadow-sm transition hover:bg-[#39854a]/10 dark:bg-gray-800"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Admission Stage Selector Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                Admission Stage:
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {stages.map((st) => {
                                    const isActive = currentStage.toLowerCase() === st.toLowerCase();
                                    return (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setCurrentStage(st)}
                                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                                isActive
                                                    ? 'bg-[#39854a] text-white font-bold shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Assigned Telecaller Box */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 font-medium">Assigned Telecaller:</span>
                            <span className="rounded-lg border border-gray-200 bg-white px-3 py-1 font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm">
                                {contact.assigned_to}
                            </span>
                        </div>
                    </div>

                    {/* Summary Info Strip */}
                    <div className="rounded-2xl border border-gray-200 bg-[#fbfdfb] p-3.5 dark:border-gray-800 dark:bg-[#121e32]/60">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                            {/* Last Contacted */}
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    LAST CONTACTED
                                </span>
                                <span className="font-bold text-gray-800 dark:text-gray-200 mt-1 inline-block">
                                    2026-05-02
                                </span>
                            </div>

                            {/* Last Outcome */}
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    LAST OUTCOME
                                </span>
                                <span className="inline-block mt-1 rounded bg-[#dcfce7] px-2 py-0.5 text-[11px] font-bold text-[#16a34a] dark:bg-green-950/40">
                                    Interested
                                </span>
                            </div>

                            {/* Next Action */}
                            <div className="col-span-2 sm:col-span-1">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    NEXT ACTION
                                </span>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                    Confirm lab visit slot and calculate provisional merit concession
                                </p>
                            </div>

                            {/* Follow-up Time */}
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    FOLLOW-UP TIME
                                </span>
                                <span className="font-bold text-gray-800 dark:text-gray-200 mt-1 inline-block">
                                    2026-05-05 @ 10:30 hrs
                                </span>
                            </div>

                            {/* Assigned Telecaller */}
                            <div className="col-span-2 sm:col-span-1">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                    ASSIGNED TELECALLER:
                                </span>
                                <span className="inline-block rounded-lg border border-gray-200 bg-white px-2.5 py-0.5 font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                    {contact.assigned_to}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================== */}
                {/* NAVIGATION TABS */}
                {/* ============================================================== */}
                <div className="flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-6 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('personal')}
                            className={`py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                                activeTab === 'personal'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            Personal & Family
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('academic')}
                            className={`py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                                activeTab === 'academic'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            Academic Qualifications
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preferences')}
                            className={`py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                                activeTab === 'preferences'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            Admission Preferences
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('activity')}
                            className={`py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                                activeTab === 'activity'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            Activity & History (3)
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                    </button>
                </div>

                {/* ============================================================== */}
                {/* TAB CONTENTS */}
                {/* ============================================================== */}
                <div className="p-6 max-h-[50vh] overflow-y-auto custom-scroll">
                    {/* TAB 1: PERSONAL & FAMILY */}
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            {/* Full Name */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    {contact.student_name}
                                </div>
                            </div>

                            {/* Date of Birth & Age */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Date of Birth (Age: 18 yrs)
                                </label>
                                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    <span>2008-04-12</span>
                                    <span className="text-gray-500 text-xs">18 years old</span>
                                </div>
                            </div>

                            {/* Student Mobile */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Student Mobile
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    {contact.phone_number}
                                </div>
                            </div>

                            {/* City / District */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    City / District
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    {contact.city}
                                </div>
                            </div>

                            {/* Area / Locality */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Area / Locality
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    {contact.area}
                                </div>
                            </div>

                            {/* Parent / Guardian Mobile */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Parent / Guardian Mobile
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    {contact.parent_phone && contact.parent_phone !== '-'
                                        ? contact.parent_phone
                                        : 'Not provided'}
                                </div>
                            </div>

                            {/* Father's Name */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Father's Name
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    —
                                </div>
                            </div>

                            {/* Mother's Name */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Mother's Name
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm">
                                    —
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ACADEMIC QUALIFICATIONS */}
                    {activeTab === 'academic' && (
                        <div className="space-y-4 text-xs">
                            {/* Current Qualification Box */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                                    Current Qualification
                                </label>
                                <p className="text-sm font-bold text-[#39854a]">
                                    {contact.qualification}
                                </p>
                            </div>

                            {/* School & Higher Secondary Details */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                                    School & Higher Secondary Details
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            School Name & Town
                                        </span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Suburban Higher Secondary School, Ramnagar
                                        </p>
                                    </div>

                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            10th Standard (SSLC) Marks / %
                                        </span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            445 / 500 (89.0%)
                                        </p>
                                    </div>

                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            12th Subject Group
                                        </span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Maths, Physics, Chemistry, Computer Science
                                        </p>
                                    </div>

                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            12th Board Result Status
                                        </span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Result Pending
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ADMISSION PREFERENCES */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-4 text-xs">
                            {/* Karpagam Institution & Course Preference */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                    Karpagam Institution & Course Preference
                                </h4>

                                <div>
                                    <label className="block text-gray-500 dark:text-gray-400 mb-1">
                                        Preferred Institution
                                    </label>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                        {contact.institution.length > 5
                                            ? contact.institution
                                            : `Karpagam Academy of Higher Education (${contact.institution})`}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            Degree Type
                                        </span>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {getDegreeType(contact.target_course)}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            Course & Specialization
                                        </span>
                                        <p className="font-bold text-[#39854a]">
                                            {contact.target_course}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                            Student Interest Level
                                        </span>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            High
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reference Details */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        Reference Details
                                    </h4>
                                    <span className="text-[11px] text-gray-400">
                                        Lead attribution source
                                    </span>
                                </div>
                                <div className="pt-1">
                                    <span className="block text-gray-500 dark:text-gray-400 mb-1">
                                        Reference Type
                                    </span>
                                    <p className="font-bold text-[#39854a]">
                                        Coimbatore Education Fair Direct Lead
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ACTIVITY & HISTORY (3) */}
                    {activeTab === 'activity' && (
                        <div className="space-y-4 text-xs">
                            {/* Card 1: Senior Counsellor Referral (High Priority) */}
                            <div className="rounded-2xl border border-emerald-200 bg-[#f0fdf4] p-4 dark:border-emerald-900/60 dark:bg-green-950/20 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                        <GraduationCap className="h-4 w-4 text-[#39854a]" />
                                        <span>Senior Counsellor Referral (High Priority)</span>
                                    </div>
                                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-bold text-[#16a34a] dark:bg-green-900/60 dark:text-green-300">
                                        Status: Pending
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    <span className="font-bold">Reason:</span> Student waiting for 12th PCM results. Father enquired about 50% merit scholarship and AI Lab facilities.
                                </p>
                            </div>

                            {/* Card 2: Scheduled Follow-up */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span>Scheduled Follow-up: 2026-05-05 at 10:30</span>
                                    </div>
                                    <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300">
                                        Scheduled
                                    </span>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Father enquired about 50% merit scholarship cutoff and AI lab visit. Scheduled callback today morning.
                                    </p>
                                </div>
                            </div>

                            {/* Section 3: Interaction & Calling Log */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                    Interaction & Calling Log
                                </h4>

                                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-green-200 dark:before:bg-green-900">
                                    {/* Item 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-[#39854a] ring-4 ring-green-100 dark:ring-green-950" />
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                Assigned to Telecaller {contact.assigned_to}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                2026-05-01 10:15
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                                            Enquiry imported from Coimbatore Education Fair lead sheet.
                                        </p>
                                        <span className="text-[11px] text-gray-400 mt-1 block">
                                            By: Admin (ADMIN)
                                        </span>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-[#39854a] ring-4 ring-green-100 dark:ring-green-950" />
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                Initial Discovery Call
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                2026-05-02 11:40
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                                            Connected with student {contact.student_name}. Highly interested in {contact.target_course}. Cutoff is declared (91.3%).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================== */}
                {/* MODAL FOOTER */}
                {/* ============================================================== */}
                <div className="flex items-center justify-between p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121e32]/50 rounded-b-3xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Enquiry Registered for AY 2026–27
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailsModal;

