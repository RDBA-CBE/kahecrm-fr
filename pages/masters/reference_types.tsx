import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface ReferenceTypeItem {
    id: string;
    source_name: string;
    channel: string;
    tracking_tag: string;
    cost_per_lead: string;
    total_leads: number;
    status: string;
}

const ReferenceTypesPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as ReferenceTypeItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Channels',
        statusFilter: 'All Status',
        currentPage: 1,
        recordsPerPage: 5,
        isOpenModal: false,
        isSubmitting: false,
        errors: {} as Record<string, string>,
        isEditMode: false,
        editingId: null as string | null,

        // Form Fields
        source_name: '',
        channel: 'Digital / Organic',
        tracking_tag: '',
        cost_per_lead: '₹0 (Organic)',
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
        if (state.categoryFilter && state.categoryFilter !== 'All Channels') {
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
            const res: any = await Models.masters.reference_types.list(body);
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
        if (!state.source_name || !state.source_name.trim()) {
            errs.source_name = 'Please enter lead source name';
        }
        if (!state.channel) {
            errs.channel = 'Please select marketing channel';
        }
        if (!state.tracking_tag || !state.tracking_tag.trim()) {
            errs.tracking_tag = 'Please enter UTM tracking tag (e.g. yt_campustour)';
        }
        if (!state.cost_per_lead || !state.cost_per_lead.trim()) {
            errs.cost_per_lead = 'Please enter cost per lead (or ₹0 for organic)';
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
            source_name: '',
            channel: 'Digital / Organic',
            tracking_tag: '',
            cost_per_lead: '₹0 (Organic)',
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: ReferenceTypeItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            source_name: item.source_name,
            channel: item.channel,
            tracking_tag: item.tracking_tag,
            cost_per_lead: item.cost_per_lead,
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
                await Models.masters.reference_types.update(state.editingId, {
                    source_name: state.source_name.trim(),
                    channel: state.channel,
                    tracking_tag: state.tracking_tag.trim().toLowerCase(),
                    cost_per_lead: state.cost_per_lead.trim(),
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: ReferenceTypeItem = {
                    id: `REF-${randomNum}`,
                    source_name: state.source_name.trim(),
                    channel: state.channel,
                    tracking_tag: state.tracking_tag.trim().toLowerCase(),
                    cost_per_lead: state.cost_per_lead.trim(),
                    total_leads: 0,
                    status: 'Active',
                };

                await Models.masters.reference_types.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                source_name: '',
                channel: 'Digital / Organic',
                tracking_tag: '',
                cost_per_lead: '₹0 (Organic)',
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
    const handleToggleStatus = async (id: string, item: ReferenceTypeItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.reference_types.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.reference_types.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.reference_types.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Channels',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Channels' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<ReferenceTypeItem>[] = [
        {
            key: 'source_name',
            label: 'Reference / Lead Source',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                        {item.source_name}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400">
                        Tag: {item.tracking_tag} · ID: {item.id}
                    </div>
                </div>
            ),
        },
        {
            key: 'channel',
            label: 'Marketing Channel',
            render: (item) => (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eaf4ec] text-[#2d6a3b] dark:bg-green-950/40 dark:text-green-300">
                    {item.channel}
                </span>
            ),
        },
        {
            key: 'cost_per_lead',
            label: 'Acquisition Cost',
            render: (item) => (
                <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                    {item.cost_per_lead}
                </span>
            ),
        },
        {
            key: 'total_leads',
            label: 'Total Enquiries',
            align: 'center',
            render: (item) => (
                <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2.5 py-1 rounded-md dark:bg-green-950/40">
                    {item.total_leads} Enquiries
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<ReferenceTypeItem>
            pageTitle="Reference Types & Lead Sources Master"
            pageSubtitle="Track enquiry acquisition channels, offline expo drives, referral schemes, and digital campaigns."
            addButtonLabel="+ Add Reference Type"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search lead source name, channel, or UTM tracking tag..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Channels"
            categoryOptions={[
                'Digital / Organic',
                'Event / On-Ground',
                'Paid Digital Campaign',
                'Referral Program',
                'Institutional Outreach',
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
                addHeader={state.isEditMode ? 'Edit Reference / Lead Source' : 'Add New Reference / Lead Source'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="p-5 space-y-4" noValidate>
                        {/* Source Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Reference / Source Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.source_name}
                                onChange={(e) => {
                                    setState({ source_name: e.target.value });
                                    if (state.errors.source_name) {
                                        const updated = { ...state.errors };
                                        delete updated.source_name;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. YouTube Campus Tour Video Ad"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.source_name
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.source_name && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.source_name}
                                </p>
                            )}
                        </div>

                        {/* Channel */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Marketing Channel <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.channel}
                                onChange={(e) => {
                                    setState({ channel: e.target.value });
                                    if (state.errors.channel) {
                                        const updated = { ...state.errors };
                                        delete updated.channel;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.channel
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Digital / Organic">Digital / Organic</option>
                                <option value="Event / On-Ground">Event / On-Ground</option>
                                <option value="Paid Digital Campaign">Paid Digital Campaign</option>
                                <option value="Referral Program">Referral Program</option>
                                <option value="Institutional Outreach">Institutional Outreach</option>
                            </select>
                            {state.errors.channel && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.channel}
                                </p>
                            )}
                        </div>

                        {/* Tracking Tag */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                UTM Tracking Tag <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.tracking_tag}
                                onChange={(e) => {
                                    setState({ tracking_tag: e.target.value });
                                    if (state.errors.tracking_tag) {
                                        const updated = { ...state.errors };
                                        delete updated.tracking_tag;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. yt_campustour_2026"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.tracking_tag
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.tracking_tag && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.tracking_tag}
                                </p>
                            )}
                        </div>

                        {/* Cost per lead */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Cost Per Lead (CPL) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.cost_per_lead}
                                onChange={(e) => {
                                    setState({ cost_per_lead: e.target.value });
                                    if (state.errors.cost_per_lead) {
                                        const updated = { ...state.errors };
                                        delete updated.cost_per_lead;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. ₹200 / Lead or ₹0 (Organic)"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.cost_per_lead
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.cost_per_lead && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.cost_per_lead}
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
                                    ? 'Update Reference'
                                    : 'Add Reference'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default ReferenceTypesPage;
