import React, { useEffect } from 'react';
import Head from 'next/head';
import { UserPlus, Search, ChevronDown, X, RotateCcw, Edit, Power, PowerOff } from 'lucide-react';
import Pagination from '@/components/Pagination';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface StaffMember {
    id: string;
    name: string;
    role: string;
    mobile: string;
    email: string;
    workload: number;
    calls_today: number;
    status: string;
}

const CRMUsersPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        staffList: [] as StaffMember[],
        totalRecords: 0,
        isLoading: false,
        isOpenAddStaff: false,
        searchQuery: '',
        roleFilter: 'All Roles',
        statusFilter: 'All Status',
        currentPage: 1,
        recordsPerPage: 5,
        isSubmitting: false,
        errors: {} as Record<string, string>,
        isEditMode: false,
        editingId: null as string | null,

        // Modal Form State
        fullName: '',
        assignedRole: 'Telecaller',
        mobileNumber: '',
        institutionalEmail: '',
    });

    const search = useDebounce(state.searchQuery, 500);

    // Build API query params / body containing all active keys with values
    const body_data = () => {
        const body: Record<string, any> = {
            page: state.currentPage,
            page_size: state.recordsPerPage,
        };
        if (search && search.trim()) {
            body.search = search.trim();
        }
        if (state.roleFilter && state.roleFilter !== 'All Roles') {
            body.role = state.roleFilter;
        }
        if (state.statusFilter && state.statusFilter !== 'All Status') {
            body.status = state.statusFilter;
        }
        return body;
    };

    // Fetch data from Master Model Sample API (zero frontend filtering)
    const getData = async () => {
        try {
            setState({ isLoading: true });
            const body = body_data();
            const res: any = await Models.masters.crm_users.list(body);
            setState({
                staffList: res.data || [],
                totalRecords: res.total_records || res.count || 0,
                isLoading: false,
            });
        } catch (error) {
            console.log('error', error);
            setState({ isLoading: false });
        }
    };

    useEffect(() => {
        getData();
    }, [search, state.currentPage, state.recordsPerPage, state.roleFilter, state.statusFilter]);

    // Toggle staff status (calls Master Model active_deactive API)
    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.crm_users.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Form Validation
    const validateForm = () => {
        const errs: Record<string, string> = {};

        if (!state.fullName || !state.fullName.trim()) {
            errs.fullName = 'Please enter staff full name';
        }

        if (!state.assignedRole) {
            errs.assignedRole = 'Please select assigned role';
        }

        if (!state.mobileNumber || !state.mobileNumber.trim()) {
            errs.mobileNumber = 'Please enter mobile number';
        } else {
            const cleanMobile = state.mobileNumber.replace(/[^0-9]/g, '');
            if (cleanMobile.length < 10) {
                errs.mobileNumber = 'Please enter a valid 10-digit mobile number';
            }
        }

        if (!state.institutionalEmail || !state.institutionalEmail.trim()) {
            errs.institutionalEmail = 'Please enter institutional email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.institutionalEmail.trim())) {
            errs.institutionalEmail = 'Please enter a valid email format';
        }

        setState({ errors: errs });
        return Object.keys(errs).length === 0;
    };

    // Open Edit Staff Modal
    const handleEditStaff = (staff: StaffMember) => {
        const roleNormalized =
            staff.role.toUpperCase() === 'ADMIN'
                ? 'Admin'
                : staff.role.toUpperCase() === 'COUNSELLOR'
                ? 'Counsellor'
                : 'Telecaller';

        setState({
            isEditMode: true,
            editingId: staff.id,
            fullName: staff.name,
            assignedRole: roleNormalized,
            mobileNumber: staff.mobile.replace(/^\+91\s*/, ''),
            institutionalEmail: staff.email,
            errors: {},
            isOpenAddStaff: true,
        });
    };

    // Handle add/update staff (calls Master Model Add/Update API)
    const handleAddStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setState({ isSubmitting: true });

            const formattedMobile = state.mobileNumber.trim().startsWith('+91')
                ? state.mobileNumber.trim()
                : `+91 ${state.mobileNumber.trim()}`;

            if (state.isEditMode && state.editingId) {
                const updatedStaff = {
                    name: state.fullName.trim(),
                    role: state.assignedRole.toUpperCase(),
                    mobile: formattedMobile,
                    email: state.institutionalEmail.trim().toLowerCase(),
                };

                await Models.masters.crm_users.update(state.editingId, updatedStaff);
            } else {
                const rolePrefix =
                    state.assignedRole.toLowerCase() === 'admin'
                        ? 'USR-ADM'
                        : state.assignedRole.toLowerCase() === 'counsellor'
                        ? 'USR-CNS'
                        : 'USR-TC';
                const randomNum = Math.floor(100 + Math.random() * 900);
                const newId = `${rolePrefix}-${randomNum}`;

                const newStaff: StaffMember = {
                    id: newId,
                    name: state.fullName.trim(),
                    role: state.assignedRole.toUpperCase(),
                    mobile: formattedMobile,
                    email: state.institutionalEmail.trim().toLowerCase(),
                    workload: 0,
                    calls_today: 0,
                    status: 'Active',
                };

                await Models.masters.crm_users.add(newStaff);
            }

            setState({
                isOpenAddStaff: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                currentPage: 1,
                fullName: '',
                assignedRole: 'Telecaller',
                mobileNumber: '',
                institutionalEmail: '',
                errors: {},
            });
            getData();
        } catch (error) {
            console.log('error', error);
            setState({ isSubmitting: false });
        }
    };

    // Reset all filters
    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            roleFilter: 'All Roles',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.roleFilter !== 'All Roles' || state.statusFilter !== 'All Status';

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    // Helper for role pill styling
    const getRoleBadgeClass = (role: string) => {
        const normalized = role.toUpperCase();
        if (normalized === 'ADMIN') {
            return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300';
        }
        if (normalized === 'COUNSELLOR') {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300';
        }
        return 'bg-green-100 text-[#16a34a] dark:bg-green-950/50 dark:text-green-400';
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>CRM Staff & User Roles - KAHE Admissions</title>
            </Head>

            {/* ============================================================== */}
            {/* PAGE HEADER: TITLE, SUBTITLE & ADD STAFF BUTTON */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        CRM Staff & User Roles
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Manage authorized admission staff across Admin, Inbound Telecalling, and Senior Counselling desks.
                    </p>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() =>
                            setState({
                                isOpenAddStaff: true,
                                isEditMode: false,
                                editingId: null,
                                fullName: '',
                                assignedRole: 'Telecaller',
                                mobileNumber: '',
                                institutionalEmail: '',
                                errors: {},
                            })
                        }
                        className="btn-action-solid flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Staff Member</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* SEARCH & FILTERS BAR */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.searchQuery}
                            onChange={(e) => {
                                setState({ searchQuery: e.target.value, currentPage: 1 });
                            }}
                            placeholder="Search staff name, ID, email, or mobile..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-white dark:placeholder-gray-500"
                        />
                        {state.searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setState({ searchQuery: '', currentPage: 1 });
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Role-wise Filter */}
                        <div className="relative min-w-[150px] sm:min-w-[170px]">
                            <select
                                value={state.roleFilter}
                                onChange={(e) => {
                                    setState({ roleFilter: e.target.value, currentPage: 1 });
                                }}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                <option value="All Roles">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="TELECALLER">Telecaller</option>
                                <option value="COUNSELLOR">Counsellor</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[130px] sm:min-w-[150px]">
                            <select
                                value={state.statusFilter}
                                onChange={(e) => {
                                    setState({ statusFilter: e.target.value, currentPage: 1 });
                                }}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                <option value="All Status">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Reset Filters */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:border-[#39854a] hover:text-[#39854a] dark:border-gray-700 dark:text-gray-400"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* DATA TABLE CONTAINER */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-[#121e32]/40">
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                    Staff Name
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                    Contact Details
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">
                                    Active Workload
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">
                                    Calls Today
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {state.staffList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                                                No staff members found
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Try adjusting your search query or role filter
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                state.staffList.map((staff: StaffMember) => {
                                    const initial = staff.name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').charAt(0) || 'U';

                                    return (
                                        <tr
                                            key={staff.id}
                                            className="transition hover:bg-gray-50/70 dark:hover:bg-[#121e32]/50"
                                        >
                                            {/* Staff Name & ID */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-[#39854a] border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {staff.name}
                                                        </div>
                                                        <div className="text-xs font-semibold text-gray-400">
                                                            {staff.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Pill */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getRoleBadgeClass(
                                                        staff.role
                                                    )}`}
                                                >
                                                    {staff.role}
                                                </span>
                                            </td>

                                            {/* Contact Details */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-700 dark:text-gray-200">
                                                    {staff.mobile}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {staff.email}
                                                </div>
                                            </td>

                                            {/* Active Workload */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {staff.workload}
                                                </span>{' '}
                                                <span className="text-xs text-gray-400">contacts</span>
                                            </td>

                                            {/* Calls Today */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="font-bold text-[#39854a]">
                                                    {staff.calls_today}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        staff.status === 'Active'
                                                            ? 'bg-emerald-50 text-[#39854a] border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                                                            : 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {staff.status}
                                                </span>
                                            </td>

                                            {/* Action Icons */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditStaff(staff)}
                                                        title="Edit Staff Member"
                                                        className="p-1.5 rounded-lg border border-transparent text-gray-500 hover:border-gray-200 hover:text-[#39854a] hover:bg-emerald-50 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-green-400 dark:hover:bg-gray-800 transition cursor-pointer"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(staff.id, staff.status)}
                                                        title={staff.status === 'Active' ? 'Deactivate Staff' : 'Activate Staff'}
                                                        className={`p-1.5 rounded-lg border border-transparent transition cursor-pointer ${
                                                            staff.status === 'Active'
                                                                ? 'text-emerald-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:text-emerald-400 dark:hover:border-red-800 dark:hover:text-red-400 dark:hover:bg-gray-800'
                                                                : 'text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-500 dark:hover:border-emerald-800 dark:hover:text-emerald-400 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {staff.status === 'Active' ? (
                                                            <Power className="h-4 w-4" />
                                                        ) : (
                                                            <PowerOff className="h-4 w-4" />
                                                        )}
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

                {/* ============================================================== */}
                {/* TABLE FOOTER & PAGINATION */}
                {/* ============================================================== */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                            Showing{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {state.totalRecords === 0 ? 0 : startIndex + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {Math.min(startIndex + state.recordsPerPage, state.totalRecords)}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">{state.totalRecords}</span> staff members
                        </span>

                        {/* Records per page selector */}
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[11px] text-gray-400">Rows:</span>
                            <select
                                value={state.recordsPerPage}
                                onChange={(e) => {
                                    setState({ recordsPerPage: Number(e.target.value), currentPage: 1 });
                                }}
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>

                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.totalRecords}
                        recordsPerPage={state.recordsPerPage}
                        onPageChange={(page) => setState({ currentPage: page })}
                        hasNext={state.currentPage < totalPages}
                        hasPrevious={state.currentPage > 1}
                    />
                </div>
            </div>

            {/* ============================================================== */}
            {/* ADD NEW CRM STAFF MEMBER MODAL VIA common_component/modal */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenAddStaff}
                close={() => setState({ isOpenAddStaff: false, errors: {} })}
                addHeader={state.isEditMode ? 'Edit Staff Member' : 'Add New CRM Staff Member'}
                renderComponent={() => (
                    <form onSubmit={handleAddStaffSubmit} className="p-5 space-y-4" noValidate>
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.fullName}
                                onChange={(e) => {
                                    setState({ fullName: e.target.value });
                                    if (state.errors.fullName) {
                                        const updated = { ...state.errors };
                                        delete updated.fullName;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. S. Saravanan"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.fullName
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.fullName && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Assigned Role */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Assigned Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.assignedRole}
                                onChange={(e) => {
                                    setState({ assignedRole: e.target.value });
                                    if (state.errors.assignedRole) {
                                        const updated = { ...state.errors };
                                        delete updated.assignedRole;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.assignedRole
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Telecaller">Telecaller</option>
                                <option value="Admin">Admin</option>
                                <option value="Counsellor">Counsellor</option>
                            </select>
                            {state.errors.assignedRole && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.assignedRole}
                                </p>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={state.mobileNumber}
                                onChange={(e) => {
                                    setState({ mobileNumber: e.target.value });
                                    if (state.errors.mobileNumber) {
                                        const updated = { ...state.errors };
                                        delete updated.mobileNumber;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="+91 9842X XXXXX"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.mobileNumber
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.mobileNumber && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.mobileNumber}
                                </p>
                            )}
                        </div>

                        {/* Institutional Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Institutional Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={state.institutionalEmail}
                                onChange={(e) => {
                                    setState({ institutionalEmail: e.target.value });
                                    if (state.errors.institutionalEmail) {
                                        const updated = { ...state.errors };
                                        delete updated.institutionalEmail;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="saravanan.s@karpagam.edu.in"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.institutionalEmail
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.institutionalEmail && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.institutionalEmail}
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setState({ isOpenAddStaff: false, errors: {} })}
                                className="text-sm sm:text-base font-bold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer px-4 py-2.5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={state.isSubmitting}
                                className="rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white font-bold text-sm sm:text-base px-6 py-2.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                                {state.isSubmitting
                                    ? 'Saving...'
                                    : state.isEditMode
                                    ? 'Update Staff Member'
                                    : 'Add Staff Member'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </div>
    );
};

export default CRMUsersPage;
