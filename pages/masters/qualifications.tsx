import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface QualificationItem {
    id: string;
    name: string;
    stream_type: string;
    target_level: string;
    min_eligibility: string;
    students_registered: number;
    status: string;
}

const QualificationsPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as QualificationItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Levels',
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
        stream_type: '',
        target_level: 'Undergraduate (UG)',
        min_eligibility: '50% Aggregate',
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
        if (state.categoryFilter && state.categoryFilter !== 'All Levels') {
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
            const res: any = await Models.masters.qualifications.list(body);
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
            errs.name = 'Please enter qualification title';
        }
        if (!state.stream_type || !state.stream_type.trim()) {
            errs.stream_type = 'Please enter stream / examination board';
        }
        if (!state.target_level) {
            errs.target_level = 'Please select eligible degree level';
        }
        if (!state.min_eligibility || !state.min_eligibility.trim()) {
            errs.min_eligibility = 'Please enter minimum eligibility criteria';
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
            stream_type: '',
            target_level: 'Undergraduate (UG)',
            min_eligibility: '50% Aggregate',
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: QualificationItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            name: item.name,
            stream_type: item.stream_type,
            target_level: item.target_level,
            min_eligibility: item.min_eligibility,
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
                await Models.masters.qualifications.update(state.editingId, {
                    name: state.name.trim(),
                    stream_type: state.stream_type.trim(),
                    target_level: state.target_level,
                    min_eligibility: state.min_eligibility.trim(),
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: QualificationItem = {
                    id: `QLF-${randomNum}`,
                    name: state.name.trim(),
                    stream_type: state.stream_type.trim(),
                    target_level: state.target_level,
                    min_eligibility: state.min_eligibility.trim(),
                    students_registered: 0,
                    status: 'Active',
                };

                await Models.masters.qualifications.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                name: '',
                stream_type: '',
                target_level: 'Undergraduate (UG)',
                min_eligibility: '50% Aggregate',
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
    const handleToggleStatus = async (id: string, item: QualificationItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.qualifications.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.qualifications.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.qualifications.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Levels',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Levels' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<QualificationItem>[] = [
        {
            key: 'name',
            label: 'Prior Qualification Name',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                        {item.name}
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Qualification ID: {item.id} · {item.stream_type}
                    </div>
                </div>
            ),
        },
        {
            key: 'target_level',
            label: 'Eligible Degree Level',
            render: (item) => (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {item.target_level}
                </span>
            ),
        },
        {
            key: 'min_eligibility',
            label: 'Min. Criteria',
            render: (item) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {item.min_eligibility}
                </span>
            ),
        },
        {
            key: 'students_registered',
            label: 'Enquiries Registered',
            align: 'center',
            render: (item) => (
                <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2.5 py-1 rounded-md dark:bg-green-950/40">
                    {item.students_registered} Students
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<QualificationItem>
            pageTitle="Prior Qualifications Master"
            pageSubtitle="Define qualifying entrance boards, schooling levels, and minimum eligibility criteria."
            addButtonLabel="+ Add Qualification"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search qualification title or board..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Levels"
            categoryOptions={[
                'Undergraduate (UG)',
                'Postgraduate (PG / MBA)',
                'Direct 2nd Year B.E. (Lateral)',
                'Polytechnic / Higher Secondary',
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
            {/* PAGE-CONTROLLED MODAL WITH FORM FIELDS & VALIDATION */}
            <Modal
                open={state.isOpenModal}
                close={() => setState({ isOpenModal: false, errors: {} })}
                addHeader={state.isEditMode ? 'Edit Prior Qualification' : 'Add New Prior Qualification'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="p-5 space-y-4" noValidate>
                        {/* Qualification Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Qualification Title <span className="text-red-500">*</span>
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
                                placeholder="e.g. B.Sc Computer Science (For MCA/MBA)"
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

                        {/* Stream / Board */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Stream / Examination Board <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.stream_type}
                                onChange={(e) => {
                                    setState({ stream_type: e.target.value });
                                    if (state.errors.stream_type) {
                                        const updated = { ...state.errors };
                                        delete updated.stream_type;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. Recognized University Degree / State Board"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.stream_type
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.stream_type && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.stream_type}
                                </p>
                            )}
                        </div>

                        {/* Target Level */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Eligible Degree Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.target_level}
                                onChange={(e) => {
                                    setState({ target_level: e.target.value });
                                    if (state.errors.target_level) {
                                        const updated = { ...state.errors };
                                        delete updated.target_level;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.target_level
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                                <option value="Postgraduate (PG / MBA)">Postgraduate (PG / MBA)</option>
                                <option value="Direct 2nd Year B.E. (Lateral)">Direct 2nd Year B.E. (Lateral)</option>
                                <option value="Polytechnic / Higher Secondary">Polytechnic / Higher Secondary</option>
                                <option value="Doctoral (Ph.D)">Doctoral (Ph.D)</option>
                            </select>
                            {state.errors.target_level && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.target_level}
                                </p>
                            )}
                        </div>

                        {/* Min Eligibility */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Minimum Eligibility Criteria <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.min_eligibility}
                                onChange={(e) => {
                                    setState({ min_eligibility: e.target.value });
                                    if (state.errors.min_eligibility) {
                                        const updated = { ...state.errors };
                                        delete updated.min_eligibility;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. 50% Marks in Aggregate"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.min_eligibility
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.min_eligibility && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.min_eligibility}
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
                                    ? 'Update Qualification'
                                    : 'Add Qualification'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default QualificationsPage;
