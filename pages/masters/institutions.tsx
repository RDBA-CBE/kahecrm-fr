import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface InstitutionItem {
    id: string;
    name: string;
    short_code: string;
    type: string;
    campus: string;
    total_programs: number;
    status: string;
}

const InstitutionsPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as InstitutionItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Types',
        statusFilter: 'All Status',
        currentPage: 1,
        recordsPerPage: 5,
        isOpenModal: false,
        isSubmitting: false,
        errors: {} as Record<string, string>,
        isEditMode: false,
        editingId: null as string | null,

        // Form Fields
        name: '',
        short_code: '',
        type: 'Deemed-to-be University',
        campus: '',
        total_programs: 10,
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
        if (state.categoryFilter && state.categoryFilter !== 'All Types') {
            body.category = state.categoryFilter;
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
            const res: any = await Models.masters.institutions.list(body);
            setState({
                data: res.data || [],
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
    }, [search, state.currentPage, state.recordsPerPage, state.categoryFilter, state.statusFilter]);

    // Form Validation
    const validateForm = () => {
        const errs: Record<string, string> = {};
        if (!state.name || !state.name.trim()) {
            errs.name = 'Please enter institution full name';
        }
        if (!state.short_code || !state.short_code.trim()) {
            errs.short_code = 'Please enter institution acronym (e.g. KAHE)';
        }
        if (!state.type) {
            errs.type = 'Please select institution type';
        }
        if (!state.campus || !state.campus.trim()) {
            errs.campus = 'Please enter campus location / locality';
        }
        if (!state.total_programs || Number(state.total_programs) <= 0) {
            errs.total_programs = 'Total programs must be at least 1';
        }

        setState({ errors: errs });
        return Object.keys(errs).length === 0;
    };

    // Open Add Modal
    const handleOpenAdd = () => {
        setState({
            isOpenModal: true,
            isEditMode: false,
            editingId: null,
            name: '',
            short_code: '',
            type: 'Deemed-to-be University',
            campus: '',
            total_programs: 10,
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: InstitutionItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            name: item.name,
            short_code: item.short_code,
            type: item.type,
            campus: item.campus,
            total_programs: item.total_programs,
            errors: {},
        });
    };

    // Form Submit (calls Master Model Add/Update API)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setState({ isSubmitting: true });

            if (state.isEditMode && state.editingId) {
                await Models.masters.institutions.update(state.editingId, {
                    name: state.name.trim(),
                    short_code: state.short_code.trim().toUpperCase(),
                    type: state.type,
                    campus: state.campus.trim(),
                    total_programs: Number(state.total_programs),
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: InstitutionItem = {
                    id: `INST-${randomNum}`,
                    name: state.name.trim(),
                    short_code: state.short_code.trim().toUpperCase(),
                    type: state.type,
                    campus: state.campus.trim(),
                    total_programs: Number(state.total_programs),
                    status: 'Active',
                };

                await Models.masters.institutions.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                name: '',
                short_code: '',
                type: 'Deemed-to-be University',
                campus: '',
                total_programs: 10,
                errors: {},
                currentPage: 1,
            });
            getData();
        } catch (error) {
            console.log('error', error);
            setState({ isSubmitting: false });
        }
    };

    // Toggle Status (calls Master Model active_deactive API)
    const handleToggleStatus = async (id: string, item: InstitutionItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.institutions.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.institutions.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.institutions.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Types',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Types' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<InstitutionItem>[] = [
        {
            key: 'name',
            label: 'Institution Name',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#eaf4ec] text-[#2d6a3b] dark:bg-green-950/40 dark:text-green-300">
                            {item.short_code}
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Campus ID: {item.id}
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Institution Type',
            render: (item) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {item.type}
                </span>
            ),
        },
        {
            key: 'campus',
            label: 'Location / Campus',
            render: (item) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.campus}
                </span>
            ),
        },
        {
            key: 'total_programs',
            label: 'Programs Offered',
            align: 'center',
            render: (item) => (
                <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2.5 py-1 rounded-md dark:bg-green-950/40">
                    {item.total_programs} Courses
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<InstitutionItem>
            pageTitle="Institutions & Colleges Master"
            pageSubtitle="Manage constituent colleges, university faculties, and campus locations under Karpagam Group."
            addButtonLabel="+ Add Institution"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search institution name, short code, or campus location..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Types"
            categoryOptions={[
                'Deemed-to-be University',
                'Autonomous Engineering Institution',
                'Affiliated Engineering College',
                'Pharmacy Education & Research',
                'Nursing & Allied Health',
                'Medical College & Research Institute',
            ]}
            categoryFilter={state.categoryFilter}
            onCategoryFilterChange={(c) => setState({ categoryFilter: c, currentPage: 1 })}
            statusFilter={state.statusFilter}
            onStatusFilterChange={(s) => setState({ statusFilter: s, currentPage: 1 })}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            columns={columns}
            data={state.data}
            isLoading={state.isLoading}
            onToggleStatus={handleToggleStatus}
            onEdit={handleOpenEdit}
            totalRecords={state.totalRecords}
            currentPage={state.currentPage}
            recordsPerPage={state.recordsPerPage}
            onPageChange={(p) => setState({ currentPage: p })}
            onRecordsPerPageChange={(limit) => setState({ recordsPerPage: limit, currentPage: 1 })}
        >
            {/* USING COMMON MODAL COMPONENT */}
            <Modal
                open={state.isOpenModal}
                close={() => setState({ isOpenModal: false, errors: {} })}
                addHeader={state.isEditMode ? 'Edit Institution / College' : 'Add New Institution / College'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="space-y-4 p-5 sm:p-6" noValidate>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Institution Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.name}
                                onChange={(e) => {
                                    setState({ name: e.target.value });
                                    if (state.errors.name) {
                                        const updated = { ...state.errors };
                                        delete updated.name;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. Karpagam Academy of Higher Education"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.name
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.name && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.name}
                                </p>
                            )}
                        </div>

                        {/* Short Code */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Acronym / Short Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.short_code}
                                onChange={(e) => {
                                    setState({ short_code: e.target.value });
                                    if (state.errors.short_code) {
                                        const updated = { ...state.errors };
                                        delete updated.short_code;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. KAHE"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.short_code
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.short_code && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.short_code}
                                </p>
                            )}
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Institution Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.type}
                                onChange={(e) => {
                                    setState({ type: e.target.value });
                                    if (state.errors.type) {
                                        const updated = { ...state.errors };
                                        delete updated.type;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.type
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Deemed-to-be University">Deemed-to-be University</option>
                                <option value="Autonomous Engineering Institution">Autonomous Engineering Institution</option>
                                <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                                <option value="Pharmacy Education & Research">Pharmacy Education & Research</option>
                                <option value="Nursing & Allied Health">Nursing & Allied Health</option>
                                <option value="Medical College & Research Institute">Medical College & Research Institute</option>
                            </select>
                            {state.errors.type && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.type}
                                </p>
                            )}
                        </div>

                        {/* Campus Location */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Campus Location / Road <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.campus}
                                onChange={(e) => {
                                    setState({ campus: e.target.value });
                                    if (state.errors.campus) {
                                        const updated = { ...state.errors };
                                        delete updated.campus;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. Eachanari, Pollachi Main Road, Coimbatore"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.campus
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.campus && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.campus}
                                </p>
                            )}
                        </div>

                        {/* Total Programs */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Total Programs Offered <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={state.total_programs}
                                onChange={(e) => {
                                    setState({ total_programs: e.target.value });
                                    if (state.errors.total_programs) {
                                        const updated = { ...state.errors };
                                        delete updated.total_programs;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="10"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.total_programs
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.total_programs && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.total_programs}
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setState({ isOpenModal: false, errors: {} })}
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
                                    ? 'Update Institution'
                                    : 'Add Institution'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default InstitutionsPage;
