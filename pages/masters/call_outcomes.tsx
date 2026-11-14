import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface CallOutcomeItem {
    id: string;
    outcome_name: string;
    sentiment: string;
    suggested_next_action: string;
    requires_callback: boolean;
    priority: string;
    status: string;
}

const CallOutcomesPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as CallOutcomeItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Sentiments',
        statusFilter: 'All Status',
        currentPage: 1,
        recordsPerPage: 5,
        isOpenModal: false,
        isSubmitting: false,
        errors: {} as Record<string, string>,
        isEditMode: false,
        editingId: null as string | null,

        // Form Fields
        outcome_name: '',
        sentiment: 'Positive',
        suggested_next_action: '',
        priority: 'Normal',
        requires_callback: true,
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
        if (state.categoryFilter && state.categoryFilter !== 'All Sentiments') {
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
            const res: any = await Models.masters.call_outcomes.list(body);
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
        if (!state.outcome_name || !state.outcome_name.trim()) {
            errs.outcome_name = 'Please enter call disposition outcome name';
        }
        if (!state.sentiment) {
            errs.sentiment = 'Please select disposition sentiment';
        }
        if (!state.suggested_next_action || !state.suggested_next_action.trim()) {
            errs.suggested_next_action = 'Please enter automated next action rule';
        }
        if (!state.priority) {
            errs.priority = 'Please select priority level';
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
            outcome_name: '',
            sentiment: 'Positive',
            suggested_next_action: '',
            priority: 'Normal',
            requires_callback: true,
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: CallOutcomeItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            outcome_name: item.outcome_name,
            sentiment: item.sentiment,
            suggested_next_action: item.suggested_next_action,
            priority: item.priority,
            requires_callback: item.requires_callback,
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
                await Models.masters.call_outcomes.update(state.editingId, {
                    outcome_name: state.outcome_name.trim(),
                    sentiment: state.sentiment,
                    suggested_next_action: state.suggested_next_action.trim(),
                    requires_callback: Boolean(state.requires_callback),
                    priority: state.priority,
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: CallOutcomeItem = {
                    id: `OUT-${randomNum}`,
                    outcome_name: state.outcome_name.trim(),
                    sentiment: state.sentiment,
                    suggested_next_action: state.suggested_next_action.trim(),
                    requires_callback: Boolean(state.requires_callback),
                    priority: state.priority,
                    status: 'Active',
                };

                await Models.masters.call_outcomes.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                outcome_name: '',
                sentiment: 'Positive',
                suggested_next_action: '',
                priority: 'Normal',
                requires_callback: true,
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
    const handleToggleStatus = async (id: string, item: CallOutcomeItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.call_outcomes.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.call_outcomes.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.call_outcomes.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Sentiments',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Sentiments' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<CallOutcomeItem>[] = [
        {
            key: 'outcome_name',
            label: 'Call Disposition & Outcome',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                        {item.outcome_name}
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Outcome Code: {item.id} · Priority: {item.priority}
                    </div>
                </div>
            ),
        },
        {
            key: 'sentiment',
            label: 'Disposition Sentiment',
            render: (item) => {
                let badgeClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                if (item.sentiment === 'Positive') badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
                if (item.sentiment === 'Follow-up') badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
                if (item.sentiment === 'Disqualified') badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';

                return (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}`}>
                        {item.sentiment}
                    </span>
                );
            },
        },
        {
            key: 'suggested_next_action',
            label: 'Automated Next Action Rule',
            render: (item) => (
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {item.suggested_next_action}
                </span>
            ),
        },
        {
            key: 'requires_callback',
            label: 'Requires Follow-up',
            align: 'center',
            render: (item) => (
                <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        item.requires_callback
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                    }`}
                >
                    {item.requires_callback ? 'Yes (Mandatory)' : 'No'}
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<CallOutcomeItem>
            pageTitle="Call Dispositions & Outcomes Master"
            pageSubtitle="Configure telecalling response tags, next-action rules, and callback schedules."
            addButtonLabel="+ Add Outcome"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search call outcome, sentiment, or next action rule..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Sentiments"
            categoryOptions={['Positive', 'Follow-up', 'Neutral', 'Disqualified']}
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
                addHeader={state.isEditMode ? 'Edit Call Outcome' : 'Add New Call Outcome'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="p-5 space-y-4" noValidate>
                        {/* Outcome Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Call Outcome Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.outcome_name}
                                onChange={(e) => {
                                    setState({ outcome_name: e.target.value });
                                    if (state.errors.outcome_name) {
                                        const updated = { ...state.errors };
                                        delete updated.outcome_name;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. Interested - Scholarship Test Enrollment"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.outcome_name
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.outcome_name && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.outcome_name}
                                </p>
                            )}
                        </div>

                        {/* Sentiment */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Disposition Sentiment <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.sentiment}
                                onChange={(e) => {
                                    setState({ sentiment: e.target.value });
                                    if (state.errors.sentiment) {
                                        const updated = { ...state.errors };
                                        delete updated.sentiment;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.sentiment
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Positive">Positive</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Disqualified">Disqualified</option>
                            </select>
                            {state.errors.sentiment && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.sentiment}
                                </p>
                            )}
                        </div>

                        {/* Suggested Next Action */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Suggested Next Action Rule <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.suggested_next_action}
                                onChange={(e) => {
                                    setState({ suggested_next_action: e.target.value });
                                    if (state.errors.suggested_next_action) {
                                        const updated = { ...state.errors };
                                        delete updated.suggested_next_action;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. Schedule online scholarship test link"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.suggested_next_action
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.suggested_next_action && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.suggested_next_action}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={state.priority}
                                    onChange={(e) => {
                                        setState({ priority: e.target.value });
                                        if (state.errors.priority) {
                                            const updated = { ...state.errors };
                                            delete updated.priority;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.priority
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Low">Low</option>
                                </select>
                                {state.errors.priority && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.priority}
                                    </p>
                                )}
                            </div>

                            {/* Callback Required */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Requires Follow-up <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={state.requires_callback ? 'true' : 'false'}
                                    onChange={(e) => setState({ requires_callback: e.target.value === 'true' })}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-white"
                                >
                                    <option value="true">Yes (Mandatory)</option>
                                    <option value="false">No (Not Required)</option>
                                </select>
                            </div>
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
                                    ? 'Update Outcome'
                                    : 'Add Outcome'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default CallOutcomesPage;
