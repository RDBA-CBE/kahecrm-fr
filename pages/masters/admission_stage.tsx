import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface AdmissionStageItem {
    id: string;
    name: string;
    code: string;
    category: string;
    sequence: number;
    contacts_count: number;
    badge_color: string;
    status: string;
}

const AdmissionStagePage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as AdmissionStageItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Desks',
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
        code: '',
        category: 'Telecalling Desk',
        sequence: 9,
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
        if (state.categoryFilter && state.categoryFilter !== 'All Desks') {
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
            const res: any = await Models.masters.admission_stage.list(body);
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

    // Validation Handler
    const validateForm = () => {
        const errs: Record<string, string> = {};
        if (!state.name || !state.name.trim()) {
            errs.name = 'Please enter admission stage name';
        }
        if (!state.code || !state.code.trim()) {
            errs.code = 'Please enter stage code (e.g. DOC_VERIF)';
        }
        if (!state.category) {
            errs.category = 'Please select a desk / phase';
        }
        if (!state.sequence || Number(state.sequence) <= 0) {
            errs.sequence = 'Sequence must be a positive number';
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
            code: '',
            category: 'Telecalling Desk',
            sequence: 9,
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: AdmissionStageItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            name: item.name,
            code: item.code,
            category: item.category,
            sequence: item.sequence,
            errors: {},
        });
    };

    // Form Submit Handler (calls Master Model Add/Update API)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setState({ isSubmitting: true });

            if (state.isEditMode && state.editingId) {
                await Models.masters.admission_stage.update(state.editingId, {
                    name: state.name.trim(),
                    code: state.code.trim().toUpperCase(),
                    category: state.category,
                    sequence: Number(state.sequence),
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: AdmissionStageItem = {
                    id: `STG-${randomNum}`,
                    name: state.name.trim(),
                    code: state.code.trim().toUpperCase(),
                    category: state.category,
                    sequence: Number(state.sequence),
                    contacts_count: 0,
                    badge_color: 'bg-teal-100 text-teal-700',
                    status: 'Active',
                };

                await Models.masters.admission_stage.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                name: '',
                code: '',
                category: 'Telecalling Desk',
                sequence: 9,
                errors: {},
                currentPage: 1,
            });
            getData();
        } catch (error) {
            console.log('error', error);
            setState({ isSubmitting: false });
        }
    };

    // Toggle Active/Inactive Status (calls Master Model active_deactive API)
    const handleToggleStatus = async (id: string, item: AdmissionStageItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.admission_stage.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.admission_stage.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.admission_stage.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Desks',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Desks' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<AdmissionStageItem>[] = [
        {
            key: 'name',
            label: 'Stage Name & Code',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {item.code}
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Seq: {item.sequence} · ID: {item.id}
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Desk / Pipeline Phase',
            render: (item) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {item.category}
                </span>
            ),
        },
        {
            key: 'badge_color',
            label: 'Stage Badge Preview',
            render: (item) => (
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${item.badge_color}`}>
                    {item.name}
                </span>
            ),
        },
        {
            key: 'contacts_count',
            label: 'Active Contacts',
            align: 'center',
            render: (item) => (
                <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2 py-0.5 rounded-md dark:bg-green-950/40">
                    {item.contacts_count} Enquiries
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<AdmissionStageItem>
            pageTitle="Admission Stage Master"
            pageSubtitle="Configure admission lifecycle stages, pipeline desks, and progression workflow."
            addButtonLabel="+ Add Stage"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search stage name, code, or desk..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Desks"
            categoryOptions={[
                'Inbound Queue',
                'Telecalling Desk',
                'On-Campus Desk',
                'Senior Counselling Desk',
                'Application Processing',
                'Admissions Finalized',
                'Closed / Disqualified',
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
                addHeader={state.isEditMode ? 'Edit Admission Stage' : 'Add New Admission Stage'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="space-y-4 p-5 sm:p-6" noValidate>
                        {/* Stage Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Stage Name <span className="text-red-500">*</span>
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
                                placeholder="e.g. Document Verification"
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

                        {/* Stage Code */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Stage Code (Unique Key) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.code}
                                onChange={(e) => {
                                    setState({ code: e.target.value });
                                    if (state.errors.code) {
                                        const updated = { ...state.errors };
                                        delete updated.code;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. DOC_VERIF"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.code
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.code && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.code}
                                </p>
                            )}
                        </div>

                        {/* Desk / Category */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Target Desk / Pipeline Phase <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.category}
                                onChange={(e) => {
                                    setState({ category: e.target.value });
                                    if (state.errors.category) {
                                        const updated = { ...state.errors };
                                        delete updated.category;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.category
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Inbound Queue">Inbound Queue</option>
                                <option value="Telecalling Desk">Telecalling Desk</option>
                                <option value="On-Campus Desk">On-Campus Desk</option>
                                <option value="Senior Counselling Desk">Senior Counselling Desk</option>
                                <option value="Application Processing">Application Processing</option>
                                <option value="Admissions Finalized">Admissions Finalized</option>
                                <option value="Closed / Disqualified">Closed / Disqualified</option>
                            </select>
                            {state.errors.category && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.category}
                                </p>
                            )}
                        </div>

                        {/* Sequence Number */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Display Sequence Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={state.sequence}
                                onChange={(e) => {
                                    setState({ sequence: e.target.value });
                                    if (state.errors.sequence) {
                                        const updated = { ...state.errors };
                                        delete updated.sequence;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="9"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.sequence
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.sequence && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.sequence}
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
                                    ? 'Update Stage'
                                    : 'Add Stage'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default AdmissionStagePage;
