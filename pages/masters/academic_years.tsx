import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface AcademicYearItem {
    id: string;
    year_name: string;
    code: string;
    cycle_status: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    status: string;
}

const AcademicYearsPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as AcademicYearItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Cycles',
        statusFilter: 'All Status',
        currentPage: 1,
        recordsPerPage: 5,
        isOpenModal: false,
        isSubmitting: false,
        errors: {} as Record<string, string>,
        isEditMode: false,
        editingId: null as string | null,

        // Form Fields
        year_name: '',
        code: '',
        cycle_status: 'Upcoming Batch',
        start_date: '2028-04-01',
        end_date: '2029-03-31',
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
        if (state.categoryFilter && state.categoryFilter !== 'All Cycles') {
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
            const res: any = await Models.masters.academic_years.list(body);
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
        if (!state.year_name || !state.year_name.trim()) {
            errs.year_name = 'Please enter academic year title';
        }
        if (!state.code || !state.code.trim()) {
            errs.code = 'Please enter academic year code (e.g. AY-2028-29)';
        }
        if (!state.cycle_status) {
            errs.cycle_status = 'Please select intake cycle status';
        }
        if (!state.start_date) {
            errs.start_date = 'Please select cycle start date';
        }
        if (!state.end_date) {
            errs.end_date = 'Please select cycle end date';
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
            year_name: '',
            code: '',
            cycle_status: 'Upcoming Batch',
            start_date: '2028-04-01',
            end_date: '2029-03-31',
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: AcademicYearItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            year_name: item.year_name,
            code: item.code,
            cycle_status: item.cycle_status,
            start_date: item.start_date,
            end_date: item.end_date,
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
                await Models.masters.academic_years.update(state.editingId, {
                    year_name: state.year_name.trim(),
                    code: state.code.trim().toUpperCase(),
                    cycle_status: state.cycle_status,
                    start_date: state.start_date,
                    end_date: state.end_date,
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: AcademicYearItem = {
                    id: `AY-${randomNum}`,
                    year_name: state.year_name.trim(),
                    code: state.code.trim().toUpperCase(),
                    cycle_status: state.cycle_status,
                    start_date: state.start_date,
                    end_date: state.end_date,
                    is_current: false,
                    status: 'Active',
                };

                await Models.masters.academic_years.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                year_name: '',
                code: '',
                cycle_status: 'Upcoming Batch',
                start_date: '2028-04-01',
                end_date: '2029-03-31',
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
    const handleToggleStatus = async (id: string, item: AcademicYearItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.academic_years.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.academic_years.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.academic_years.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Cycles',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Cycles' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<AcademicYearItem>[] = [
        {
            key: 'year_name',
            label: 'Academic Year',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{item.year_name}</span>
                        {item.is_current && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                Current Active Cycle
                            </span>
                        )}
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Code: {item.code} · ID: {item.id}
                    </div>
                </div>
            ),
        },
        {
            key: 'cycle_status',
            label: 'Admission Intake Phase',
            render: (item) => (
                <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        item.is_current
                            ? 'bg-[#dcfce7] text-[#16a34a] dark:bg-green-950/40'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                    {item.cycle_status}
                </span>
            ),
        },
        {
            key: 'start_date',
            label: 'Tenure Period',
            render: (item) => (
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {item.start_date} <span className="text-gray-400">to</span> {item.end_date}
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<AcademicYearItem>
            pageTitle="Academic Years Master"
            pageSubtitle="Configure admission admission tenures, academic cycles, and active enrollment windows."
            addButtonLabel="+ Add Academic Year"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search academic year name or cycle status..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Cycles"
            categoryOptions={[
                'Current Open Intake',
                'Admissions Closed',
                'Archived Batch',
                'Upcoming Batch',
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
                addHeader={state.isEditMode ? 'Edit Academic Year' : 'Add New Academic Year'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="space-y-4 p-5 sm:p-6" noValidate>
                        {/* Academic Year Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Academic Year Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.year_name}
                                onChange={(e) => {
                                    setState({ year_name: e.target.value });
                                    if (state.errors.year_name) {
                                        const updated = { ...state.errors };
                                        delete updated.year_name;
                                        setState({ errors: updated });
                                    }
                                }}
                                placeholder="e.g. 2028–2029 Admissions Cycle"
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.year_name
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            />
                            {state.errors.year_name && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.year_name}
                                </p>
                            )}
                        </div>

                        {/* Code */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Academic Code <span className="text-red-500">*</span>
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
                                placeholder="e.g. AY-2028-29"
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

                        {/* Intake Phase */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Admission Intake Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state.cycle_status}
                                onChange={(e) => {
                                    setState({ cycle_status: e.target.value });
                                    if (state.errors.cycle_status) {
                                        const updated = { ...state.errors };
                                        delete updated.cycle_status;
                                        setState({ errors: updated });
                                    }
                                }}
                                className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                    state.errors.cycle_status
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                }`}
                            >
                                <option value="Current Open Intake">Current Open Intake</option>
                                <option value="Upcoming Batch">Upcoming Batch</option>
                                <option value="Admissions Closed">Admissions Closed</option>
                                <option value="Archived Batch">Archived Batch</option>
                            </select>
                            {state.errors.cycle_status && (
                                <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                    <span>⚠</span> {state.errors.cycle_status}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Cycle Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={state.start_date}
                                    onChange={(e) => {
                                        setState({ start_date: e.target.value });
                                        if (state.errors.start_date) {
                                            const updated = { ...state.errors };
                                            delete updated.start_date;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.start_date
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                />
                                {state.errors.start_date && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.start_date}
                                    </p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Cycle End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={state.end_date}
                                    onChange={(e) => {
                                        setState({ end_date: e.target.value });
                                        if (state.errors.end_date) {
                                            const updated = { ...state.errors };
                                            delete updated.end_date;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.end_date
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                />
                                {state.errors.end_date && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.end_date}
                                    </p>
                                )}
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
                                    ? 'Update Academic Year'
                                    : 'Add Academic Year'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default AcademicYearsPage;
