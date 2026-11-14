import React, { useState, useMemo, useEffect } from 'react';
import { Search, Phone, Eye, Check, ChevronDown, Filter, X } from 'lucide-react';
import Pagination from '@/components/Pagination';
import admissionsData from '@/data/admissionsSampleData.json';
import crmStaffData from '@/data/crmStaffSampleData.json';
import StudentDetailsModal from './StudentDetailsModal';
import LogCallModal from './LogCallModal';

export interface AdmissionContact {
    id: string;
    student_name: string;
    badge?: string;
    enquiry_id: string;
    qualification: string;
    phone_number: string;
    parent_phone: string;
    city: string;
    area: string;
    target_course: string;
    institution: string;
    assigned_to: string;
    assigned_role?: string;
    status: string;
    categories?: string[];
}

export interface AdmissionsContactsTableProps {
    activeCategory?: string; // 'total_contacts' | 'assigned' | 'follow_ups' | 'interested' | 'all'
    categoryTitle?: string;
    onResetCategory?: () => void;
    onClose?: () => void;
    showCardFilterTag?: boolean;
    className?: string;
    showRoleFilter?: boolean;
}

const statusBadgeClasses: Record<string, string> = {
    contacted: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    interested: 'bg-[#dcfce7] text-[#16a34a] dark:bg-green-950/40 dark:text-green-400',
    applied: 'bg-[#dbeafe] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-400',
    admitted: 'bg-[#d1fae5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400',
    new: 'bg-[#fef3c7] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400',
    'not interested': 'bg-[#fee2e2] text-[#dc2626] dark:bg-red-950/40 dark:text-red-400',
};

const AdmissionsContactsTable: React.FC<AdmissionsContactsTableProps> = ({
    activeCategory = 'total_contacts',
    categoryTitle = 'Total Contacts',
    onResetCategory,
    onClose,
    showCardFilterTag,
    className = '',
    showRoleFilter = false,
}) => {
    // Search and filter states
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('All Cities');
    const [institutionFilter, setInstitutionFilter] = useState('All Institutions');
    const [qualificationFilter, setQualificationFilter] = useState('All Qualifications');
    const [telecallerFilter, setTelecallerFilter] = useState('All Telecallers');
    const [roleFilter, setRoleFilter] = useState('All Roles'); // 'All Roles' | 'Telecaller' | 'Counsellor'
    const [userFilter, setUserFilter] = useState('All Users');
    const [stageFilter, setStageFilter] = useState('All Stages');

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // View Modal & Call Modal states
    const [viewingContact, setViewingContact] = useState<AdmissionContact | null>(null);
    const [callingContact, setCallingContact] = useState<AdmissionContact | null>(null);

    // Reset pagination on category change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    // Extract dynamic dropdown options from the dataset
    const cities = useMemo(() => ['All Cities', ...Array.from(new Set(admissionsData.map((item) => item.city)))], []);
    const institutions = useMemo(() => ['All Institutions', ...Array.from(new Set(admissionsData.map((item) => item.institution)))], []);
    const qualifications = useMemo(() => ['All Qualifications', ...Array.from(new Set(admissionsData.map((item) => item.qualification)))], []);
    const telecallers = useMemo(() => ['All Telecallers', ...Array.from(new Set(admissionsData.map((item) => item.assigned_to)))], []);
    const stages = useMemo(() => ['All Stages', 'Contacted', 'Interested', 'Applied', 'Admitted', 'New'], []);

    // Staff role lists for extra 2 dropdowns (Role & Dependent User List)
    const telecallerList = useMemo(() => {
        const staffTC = crmStaffData
            .filter((s) => s.role === 'TELECALLER')
            .map((s) => s.name);
        const fromData = (admissionsData as any[])
            .filter((d) => d.assigned_role === 'Telecaller')
            .map((d) => d.assigned_to);
        return Array.from(new Set([...staffTC, ...fromData])).filter(Boolean);
    }, []);

    const counsellorList = useMemo(() => {
        const staffCns = crmStaffData
            .filter((s) => s.role === 'COUNSELLOR')
            .map((s) => s.name);
        const fromData = (admissionsData as any[])
            .filter((d) => d.assigned_role === 'Counsellor')
            .map((d) => d.assigned_to);
        return Array.from(new Set([...staffCns, ...fromData])).filter(Boolean);
    }, []);

    const allTeamUsers = useMemo(() => {
        return Array.from(new Set([...telecallerList, ...counsellorList]));
    }, [telecallerList, counsellorList]);

    // Dependent user list based on selected roleFilter
    const userOptions = useMemo(() => {
        if (roleFilter === 'Telecaller') {
            return ['All Telecallers', ...telecallerList];
        }
        if (roleFilter === 'Counsellor') {
            return ['All Counsellors', ...counsellorList];
        }
        return ['All Users', ...allTeamUsers];
    }, [roleFilter, telecallerList, counsellorList, allTeamUsers]);

    // Filter data based on activeCategory, search, and dropdown filters
    const filteredData = useMemo(() => {
        return (admissionsData as AdmissionContact[]).filter((item) => {
            // Category filter from OverviewStatCards
            if (activeCategory && activeCategory !== 'all') {
                if (activeCategory === 'total_contacts') {
                    // All contacts
                } else if (activeCategory === 'assigned') {
                    if (item.assigned_to === 'Unassigned') return false;
                } else if (activeCategory === 'follow_ups') {
                    if (!item.categories?.includes('follow_ups')) return false;
                } else if (activeCategory === 'interested') {
                    if (!item.categories?.includes('interested')) return false;
                }
            }

            // Text search
            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const match =
                    item.student_name.toLowerCase().includes(q) ||
                    item.enquiry_id.toLowerCase().includes(q) ||
                    item.phone_number.includes(q) ||
                    item.parent_phone.includes(q) ||
                    item.city.toLowerCase().includes(q) ||
                    item.area.toLowerCase().includes(q) ||
                    item.target_course.toLowerCase().includes(q) ||
                    item.institution.toLowerCase().includes(q) ||
                    item.assigned_to.toLowerCase().includes(q);
                if (!match) return false;
            }

            // Standard Dropdown filters
            if (cityFilter !== 'All Cities' && item.city !== cityFilter) return false;
            if (institutionFilter !== 'All Institutions' && item.institution !== institutionFilter) return false;
            if (qualificationFilter !== 'All Qualifications' && item.qualification !== qualificationFilter) return false;

            // Extra 2 Dropdowns (Role and dependent User list) when showRoleFilter is true
            if (showRoleFilter) {
                // 1. Role Filter
                if (roleFilter !== 'All Roles') {
                    const isTelecaller =
                        item.assigned_role === 'Telecaller' || telecallerList.includes(item.assigned_to);
                    const isCounsellor =
                        item.assigned_role === 'Counsellor' || counsellorList.includes(item.assigned_to);

                    if (roleFilter === 'Telecaller' && !isTelecaller) return false;
                    if (roleFilter === 'Counsellor' && !isCounsellor) return false;
                }

                // 2. User List Filter (Dependent on Role)
                if (
                    userFilter !== 'All Users' &&
                    userFilter !== 'All Telecallers' &&
                    userFilter !== 'All Counsellors'
                ) {
                    if (item.assigned_to !== userFilter) return false;
                }
            } else {
                // Legacy Single Telecaller filter
                if (telecallerFilter !== 'All Telecallers' && item.assigned_to !== telecallerFilter) return false;
            }

            if (stageFilter !== 'All Stages' && item.status.toLowerCase() !== stageFilter.toLowerCase()) return false;

            return true;
        });
    }, [
        activeCategory,
        search,
        cityFilter,
        institutionFilter,
        qualificationFilter,
        telecallerFilter,
        roleFilter,
        userFilter,
        stageFilter,
        showRoleFilter,
        telecallerList,
        counsellorList,
    ]);

    // Paginated slice
    const totalRecords = filteredData.length;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedRecords = filteredData.slice(startIndex, startIndex + recordsPerPage);

    // Selection handlers
    const isAllSelected = paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id));
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !paginatedRecords.some((r) => r.id === id)));
        } else {
            const pageIds = paginatedRecords.map((r) => r.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Top Search Bar & Filters Container */}
            <div className="overview-panel space-y-4">
                {/* Search Bar */}
                <div className="relative flex items-center">
                    <Search className="absolute left-4 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search student name, phone number, enquiry ID, city, or course..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-white dark:placeholder-gray-500"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns Row */}
                <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${showRoleFilter ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
                    {/* City / Area */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            CITY / AREA
                        </label>
                        <div className="relative">
                            <select
                                value={cityFilter}
                                onChange={(e) => {
                                    setCityFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Institution / College */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            INSTITUTION / COLLEGE
                        </label>
                        <div className="relative">
                            <select
                                value={institutionFilter}
                                onChange={(e) => {
                                    setInstitutionFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                {institutions.map((inst) => (
                                    <option key={inst} value={inst}>
                                        {inst}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Qualification */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            QUALIFICATION
                        </label>
                        <div className="relative">
                            <select
                                value={qualificationFilter}
                                onChange={(e) => {
                                    setQualificationFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                {qualifications.map((q) => (
                                    <option key={q} value={q}>
                                        {q}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Standard Telecaller Dropdown (When showRoleFilter is false) */}
                    {!showRoleFilter && (
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                TELECALLER
                            </label>
                            <div className="relative">
                                <select
                                    value={telecallerFilter}
                                    onChange={(e) => {
                                        setTelecallerFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                                >
                                    {telecallers.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* Extra 2 Dropdowns (When showRoleFilter is true) */}
                    {showRoleFilter && (
                        <>
                            {/* Extra Dropdown 1: Role (Telecaller, Counsellor) */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                    ROLE
                                </label>
                                <div className="relative">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => {
                                            const selectedRole = e.target.value;
                                            setRoleFilter(selectedRole);
                                            if (selectedRole === 'Telecaller') {
                                                setUserFilter('All Telecallers');
                                            } else if (selectedRole === 'Counsellor') {
                                                setUserFilter('All Counsellors');
                                            } else {
                                                setUserFilter('All Users');
                                            }
                                            setCurrentPage(1);
                                        }}
                                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                                    >
                                        <option value="All Roles">All Roles</option>
                                        <option value="Telecaller">Telecaller</option>
                                        <option value="Counsellor">Counsellor</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                </div>
                            </div>

                            {/* Extra Dropdown 2: User List (Dependent on selected Role) */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                    {roleFilter === 'Telecaller'
                                        ? 'TELECALLER'
                                        : roleFilter === 'Counsellor'
                                        ? 'COUNSELLOR'
                                        : 'USER LIST'}
                                </label>
                                <div className="relative">
                                    <select
                                        value={userFilter}
                                        onChange={(e) => {
                                            setUserFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                                    >
                                        {userOptions.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Admission Stage */}
                    <div className={showRoleFilter ? '' : 'col-span-2 sm:col-span-1'}>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            ADMISSION STAGE
                        </label>
                        <div className="relative">
                            <select
                                value={stageFilter}
                                onChange={(e) => {
                                    setStageFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                {stages.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Active Category Filter Tag / Close Table Header (Shown only when activeCategory is filtered or onClose is supplied) */}
                {(showCardFilterTag ?? Boolean(onClose || (activeCategory && activeCategory !== 'all' && activeCategory !== 'total_contacts'))) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500">Filtered By:</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] text-[#39854a] font-bold px-3 py-1 text-xs">
                                {categoryTitle || activeCategory} · {totalRecords} Records
                            </span>
                            {onResetCategory && activeCategory && (
                                <button
                                    type="button"
                                    onClick={onResetCategory}
                                    className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
                                >
                                    Show All
                                </button>
                            )}
                        </div>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <X className="h-3.5 w-3.5 text-red-500" />
                                <span>Close Table</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table Panel */}
            <div className="overview-panel p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-[#fafafa] dark:border-gray-800 dark:bg-[#101b2e] text-sm font-bold text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                    />
                                </th>
                                <th className="py-3.5 px-4 font-bold">Student Name</th>
                                <th className="py-3.5 px-4 font-bold">Mobile & Parent</th>
                                <th className="py-3.5 px-4 font-bold">City / Area</th>
                                <th className="py-3.5 px-4 font-bold">Target Course</th>
                                <th className="py-3.5 px-4 font-bold">Assigned To</th>
                                <th className="py-3.5 px-4 text-center font-bold">Status</th>
                                <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
                            {paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-400">
                                        No contacts found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    const statusLower = item.status.toLowerCase();
                                    const badgeClass = statusBadgeClasses[statusLower] || 'bg-gray-100 text-gray-700';

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40 ${
                                                isSelected ? 'bg-green-50/40 dark:bg-green-950/20' : ''
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(item.id)}
                                                    className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                                />
                                            </td>

                                            {/* Student Name */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            {item.student_name}
                                                        </span>
                                                        {item.badge && (
                                                            <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#16a34a]">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 mt-0.5">
                                                        {item.enquiry_id} · {item.qualification}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Mobile & Parent */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {item.phone_number}
                                                    </span>
                                                    <span className="text-xs text-gray-400 mt-0.5">
                                                        P: {item.parent_phone}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* City / Area */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {item.city}
                                                    </span>
                                                    <span className="text-xs text-gray-400 mt-0.5">
                                                        {item.area}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Target Course */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col max-w-[220px]">
                                                    <span className="font-bold text-gray-900 dark:text-white truncate">
                                                        {item.target_course}
                                                    </span>
                                                    <span className="text-xs text-gray-400 mt-0.5 truncate">
                                                        {item.institution}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Assigned To */}
                                            <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                                                <div>{item.assigned_to}</div>
                                                {item.assigned_role && (
                                                    <span
                                                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                                                            item.assigned_role === 'Counsellor'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                                                : 'bg-emerald-100 text-[#39854a] dark:bg-emerald-950/50 dark:text-emerald-300'
                                                        }`}
                                                    >
                                                        {item.assigned_role}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${badgeClass}`}>
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCallingContact(item)}
                                                        className="p-1.5 rounded-lg border border-gray-200 text-[#39854a] hover:bg-green-50 transition dark:border-gray-700 dark:hover:bg-gray-800"
                                                        title="Call Student"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingContact(item)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>View</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Row */}
                <div className="flex flex-col gap-3 p-4 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                    <span className="text-xs text-gray-500">
                        Showing {totalRecords === 0 ? 0 : startIndex + 1} to{' '}
                        {Math.min(startIndex + recordsPerPage, totalRecords)} of {totalRecords} entries
                    </span>
                    <div className="self-center sm:self-auto">
                        <Pagination
                            currentPage={currentPage}
                            totalRecords={totalRecords}
                            onPageChange={(page) => setCurrentPage(page)}
                            hasNext={startIndex + recordsPerPage < totalRecords}
                            hasPrevious={currentPage > 1}
                            recordsPerPage={recordsPerPage}
                        />
                    </div>
                </div>
            </div>

            {/* Comprehensive Student Details Modal (4 Tabs matching reference images) */}
            <StudentDetailsModal
                contact={viewingContact}
                isOpen={Boolean(viewingContact)}
                onClose={() => setViewingContact(null)}
                onLogCall={(contact) => {
                    setCallingContact(contact);
                }}
            />

            {/* Log Call Modal (Matching reference Image 5) */}
            <LogCallModal
                contact={callingContact}
                isOpen={Boolean(callingContact)}
                onClose={() => setCallingContact(null)}
                onSaveCall={(callData) => {
                    console.log('Call logged successfully:', callData);
                }}
            />
        </div>
    );
};

export default AdmissionsContactsTable;
