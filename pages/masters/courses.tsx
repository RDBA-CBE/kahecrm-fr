import React, { useEffect } from 'react';
import MasterManagementLayout, { MasterColumn } from '@/components/KAHE/MasterManagementLayout';
import Modal from '@/common_component/modal';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface CourseItem {
    id: string;
    name: string;
    code: string;
    degree_level: string;
    institution: string;
    duration: string;
    total_intake: number;
    status: string;
}

const CoursesPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState (from functions.utils)
    // =========================================================================
    const [state, setState] = useSetState({
        data: [] as CourseItem[],
        totalRecords: 0,
        isLoading: false,
        searchQuery: '',
        categoryFilter: 'All Degree Levels',
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
        degree_level: 'Undergraduate (UG)',
        institution: 'KAHE',
        duration: '4 Years',
        total_intake: 60,
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
        if (state.categoryFilter && state.categoryFilter !== 'All Degree Levels') {
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
            const res: any = await Models.masters.courses.list(body);
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
            errs.name = 'Please enter course title';
        }
        if (!state.code || !state.code.trim()) {
            errs.code = 'Please enter course code (e.g. BE-CSE)';
        }
        if (!state.degree_level) {
            errs.degree_level = 'Please select degree level';
        }
        if (!state.institution) {
            errs.institution = 'Please select offering college';
        }
        if (!state.duration || !state.duration.trim()) {
            errs.duration = 'Please enter duration (e.g. 4 Years)';
        }
        if (!state.total_intake || Number(state.total_intake) <= 0) {
            errs.total_intake = 'Approved intake must be at least 1';
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
            degree_level: 'Undergraduate (UG)',
            institution: 'KAHE',
            duration: '4 Years',
            total_intake: 60,
            errors: {},
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (item: CourseItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            name: item.name,
            code: item.code,
            degree_level: item.degree_level,
            institution: item.institution,
            duration: item.duration,
            total_intake: item.total_intake,
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
                await Models.masters.courses.update(state.editingId, {
                    name: state.name.trim(),
                    code: state.code.trim().toUpperCase(),
                    degree_level: state.degree_level,
                    institution: state.institution,
                    duration: state.duration.trim(),
                    total_intake: Number(state.total_intake),
                });
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: CourseItem = {
                    id: `CRS-${randomNum}`,
                    name: state.name.trim(),
                    code: state.code.trim().toUpperCase(),
                    degree_level: state.degree_level,
                    institution: state.institution,
                    duration: state.duration.trim(),
                    total_intake: Number(state.total_intake),
                    status: 'Active',
                };

                await Models.masters.courses.add(payload);
            }

            setState({
                isOpenModal: false,
                isSubmitting: false,
                isEditMode: false,
                editingId: null,
                name: '',
                code: '',
                degree_level: 'Undergraduate (UG)',
                institution: 'KAHE',
                duration: '4 Years',
                total_intake: 60,
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
    const handleToggleStatus = async (id: string, item: CourseItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.masters.courses.active_deactive(id, nextStatus);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Delete Record (calls Master Model delete API)
    const handleDelete = async (id: string) => {
        try {
            await Models.masters.courses.delete(id);
            getData();
        } catch (error) {
            console.log('error', error);
        }
    };

    // Get Record Detail (calls Master Model get API)
    const handleGetDetail = async (id: string) => {
        try {
            const res: any = await Models.masters.courses.get(id);
            return res?.data;
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            categoryFilter: 'All Degree Levels',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    const hasActiveFilters =
        state.searchQuery !== '' || state.categoryFilter !== 'All Degree Levels' || state.statusFilter !== 'All Status';

    const columns: MasterColumn<CourseItem>[] = [
        {
            key: 'name',
            label: 'Course & Degree Title',
            render: (item) => (
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {item.code}
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Course Code: {item.id} · Duration: {item.duration}
                    </div>
                </div>
            ),
        },
        {
            key: 'degree_level',
            label: 'Degree Level',
            render: (item) => (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {item.degree_level}
                </span>
            ),
        },
        {
            key: 'institution',
            label: 'Offering College',
            render: (item) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {item.institution}
                </span>
            ),
        },
        {
            key: 'total_intake',
            label: 'Approved Intake',
            align: 'center',
            render: (item) => (
                <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2.5 py-1 rounded-md dark:bg-green-950/40">
                    {item.total_intake} Seats
                </span>
            ),
        },
    ];

    return (
        <MasterManagementLayout<CourseItem>
            pageTitle="Courses & Degrees Master"
            pageSubtitle="Configure academic degrees, specializations, duration, and approved intake capacity."
            addButtonLabel="+ Add Course"
            onAddClick={handleOpenAdd}
            searchPlaceholder="Search course title, code, or offering college..."
            searchQuery={state.searchQuery}
            onSearchChange={(q) => setState({ searchQuery: q, currentPage: 1 })}
            categoryFilterLabel="All Degree Levels"
            categoryOptions={[
                'Undergraduate (UG)',
                'Postgraduate (PG)',
                'Doctoral (Ph.D)',
                'Diploma (Polytechnic)',
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
                addHeader={state.isEditMode ? 'Edit Academic Course' : 'Add New Academic Course'}
                renderComponent={() => (
                    <form onSubmit={handleFormSubmit} className="space-y-4 p-5 sm:p-6" noValidate>
                        {/* Course Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Course & Degree Title <span className="text-red-500">*</span>
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
                                placeholder="e.g. B.E. Computer Science & Engineering"
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

                        {/* Course Code */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                Course Short Code <span className="text-red-500">*</span>
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
                                placeholder="e.g. BE-CSE"
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
                            {/* Degree Level */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Degree Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={state.degree_level}
                                    onChange={(e) => {
                                        setState({ degree_level: e.target.value });
                                        if (state.errors.degree_level) {
                                            const updated = { ...state.errors };
                                            delete updated.degree_level;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.degree_level
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                >
                                    <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                                    <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                                    <option value="Doctoral (Ph.D)">Doctoral (Ph.D)</option>
                                    <option value="Diploma (Polytechnic)">Diploma (Polytechnic)</option>
                                </select>
                                {state.errors.degree_level && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.degree_level}
                                    </p>
                                )}
                            </div>

                            {/* Offering College */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Offering College <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={state.institution}
                                    onChange={(e) => {
                                        setState({ institution: e.target.value });
                                        if (state.errors.institution) {
                                            const updated = { ...state.errors };
                                            delete updated.institution;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.institution
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                >
                                    <option value="KAHE">KAHE (Deemed Univ)</option>
                                    <option value="KCE">KCE (Engineering)</option>
                                    <option value="KIT">KIT (Technology)</option>
                                    <option value="KCP">KCP (Pharmacy)</option>
                                    <option value="KMCH">KMCH (Medical)</option>
                                    <option value="KCN">KCN (Nursing)</option>
                                </select>
                                {state.errors.institution && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.institution}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Course Duration <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={state.duration}
                                    onChange={(e) => {
                                        setState({ duration: e.target.value });
                                        if (state.errors.duration) {
                                            const updated = { ...state.errors };
                                            delete updated.duration;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    placeholder="e.g. 4 Years"
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.duration
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                />
                                {state.errors.duration && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.duration}
                                    </p>
                                )}
                            </div>

                            {/* Intake Seats */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Approved Intake <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={state.total_intake}
                                    onChange={(e) => {
                                        setState({ total_intake: e.target.value });
                                        if (state.errors.total_intake) {
                                            const updated = { ...state.errors };
                                            delete updated.total_intake;
                                            setState({ errors: updated });
                                        }
                                    }}
                                    placeholder="60"
                                    className={`w-full rounded-xl border p-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-[#121e32] dark:text-white ${
                                        state.errors.total_intake
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                />
                                {state.errors.total_intake && (
                                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                        <span>⚠</span> {state.errors.total_intake}
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
                                    ? 'Update Course'
                                    : 'Add Course'}
                            </button>
                        </div>
                    </form>
                )}
            />
        </MasterManagementLayout>
    );
};

export default CoursesPage;
