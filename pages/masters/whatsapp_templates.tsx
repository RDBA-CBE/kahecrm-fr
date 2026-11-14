import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface WhatsAppTemplateItem {
    id: string;
    title: string;
    code: string;
    category: string;
    trigger_stage: string;
    language: string;
    usage_count: number;
    status: string;
}

const WhatsAppTemplatesPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as WhatsAppTemplateItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Categories',
        statusFilter: 'All Status',
        currentPage: 1,
        recordsPerPage: 5,
        isOpenModal: false,
        isSubmitting: false,
        errors: {} as Record<string, string>,
        isEditMode: false,
        editingId: null as string | null,

        // Form Fields
        title: '',
        code: '',
        category: 'Inbound Lead',
        trigger_stage: 'New Enquiry',
        language: 'English',
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
        if (state.categoryFilter && state.categoryFilter !== 'All Categories') {
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
            const res: any = await Models.masters.whatsapp_templates.list(body);
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
        if (!state.title || !state.title.trim()) {
            errs.title = 'Please enter template title';
        }
        if (!state.code || !state.code.trim()) {
            errs.code = 'Please enter Meta WhatsApp template code (e.g. tpl_...)';
        }
        if (!state.category) {
            errs.category = 'Please select category';
        }
        if (!state.trigger_stage) {
            errs.trigger_stage = 'Please select trigger admission stage';
        }
        if (!state.language) {
            errs.language = 'Please select template language';
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
            title: '',
            code: '',
            category: 'Inbound Lead',
            trigger_stage: 'New Enquiry',
            language: 'English',
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: WhatsAppTemplateItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            title: item.title,
            code: item.code,
            category: item.category,
            trigger_stage: item.trigger_stage,
            language: item.language,
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
                await Models.masters.whatsapp_templates.update(state.editingId, {
                    title: state.title.trim(),
                    code: state.code.trim().toLowerCase(),
                    category: state.category,
                    trigger_stage: state.trigger_stage,
                    language: state.language,
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: WhatsAppTemplateItem = {
                    id: `WTP-${randomNum}`,
                    title: state.title.trim(),
                    code: state.code.trim().toLowerCase(),
                    category: state.category,
                    trigger_stage: state.trigger_stage,
                    language: state.language,
                    usage_count: 0,
                    status: 'Active',
                };

                await Models.masters.whatsapp_templates.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                title: '',
                code: '',
                category: 'Inbound Lead',
                trigger_stage: 'New Enquiry',
                language: 'English',
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
    const handleToggleStatus = async (id: string, item: WhatsAppTemplateItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.whatsapp_templates.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.whatsapp_templates.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.whatsapp_templates.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Categories',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Categories' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<WhatsAppTemplateItem>[] = [
        {
            key: 'title',
            label: 'Template Title & ID',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-400">
                        {item.code} · ID: {item.id}
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Workflow Category',
            render: (item) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {item.category}
                </span>
            ),
        },
        {
            key: 'trigger_stage',
            label: 'Trigger Admission Stage',
            render: (item) => (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eaf4ec] text-[#2d6a3b] dark:bg-green-950/40 dark:text-green-300">
                    {item.trigger_stage}
                </span>
            ),
        },
        {
            key: 'language',
            label: 'Language',
            render: (item) => (
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {item.language}
                </span>
            ),
        },
        {
            key: 'usage_count',
            label: 'Times Dispatched',
            align: 'center',
            render: (item) => (
                <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2 py-0.5 rounded-md dark:bg-green-950/40">
                    {item.usage_count} Sent
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<WhatsAppTemplateItem>
            pageTitle="WhatsApp Templates Master"
            pageSubtitle="Configure Meta WhatsApp Business verified message templates, automation triggers, and stage links."
            addButtonLabel="+ Add Template"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search template title, API code, or trigger stage..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Categories"
            categoryOptions={[
                'Inbound Lead',
                'Campus Experience',
                'Counselling',
                'Admissions',
                'Telecalling',
                'Onboarding',
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
                addHeader={state.isEditMode ? 'Edit WhatsApp Template' : 'Add New WhatsApp Template'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="space-y-4 p-5 sm:p-6" noValidate>
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Template Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.title}
                                onChange={(e) => {
                                    setState({ title: e.target.value });
                                    if (state.errors.title) {
                                        const updated = { ...state.errors };
                                        delete updated.title;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. Inbound Enquiry - Welcome & Brochure Link"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.title
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.title && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.title}
                                </p>
                            )}
                        </div>

                        {/* Code */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Meta Template Code (API Key) <span className="text-red-500">*</span>
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
                                placeholder="e.g. kahe_welcome_brochure_v1"
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

                        <div className="grid grid-cols-2 gap-3">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Workflow Category <span className="text-red-500">*</span>
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
                                    <option value="Inbound Lead">Inbound Lead</option>
                                    <option value="Campus Experience">Campus Experience</option>
                                    <option value="Counselling">Counselling</option>
                                    <option value="Admissions">Admissions</option>
                                    <option value="Telecalling">Telecalling</option>
                                    <option value="Onboarding">Onboarding</option>
                                </select>
                                {state.errors.category && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Trigger Stage */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Trigger Stage <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={state.trigger_stage}
                                    onChange={(e) => {
                                        setState({ trigger_stage: e.target.value });
                                        if (state.errors.trigger_stage) {
                                            const updated = { ...state.errors };
                                            delete updated.trigger_stage;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.trigger_stage
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                >
                                    <option value="New Enquiry">New Enquiry</option>
                                    <option value="Telecaller Contacted">Telecaller Contacted</option>
                                    <option value="Campus Tour Booked">Campus Tour Booked</option>
                                    <option value="Counselling Scheduled">Counselling Scheduled</option>
                                    <option value="Application Initiated">Application Initiated</option>
                                    <option value="Seat Reserved">Seat Reserved</option>
                                </select>
                                {state.errors.trigger_stage && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.trigger_stage}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Language <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.language}
                                onChange={(e) => {
                                    setState({ language: e.target.value });
                                    if (state.errors.language) {
                                        const updated = { ...state.errors };
                                        delete updated.language;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.language
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="English">English</option>
                                <option value="Tamil">Tamil (தமிழ்)</option>
                                <option value="Malayalam">Malayalam (മലയാളം)</option>
                                <option value="Hindi">Hindi (हिंदी)</option>
                            </select>
                            {state.errors.language && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.language}
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
                                    ? 'Update Template'
                                    : 'Add Template'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default WhatsAppTemplatesPage;
