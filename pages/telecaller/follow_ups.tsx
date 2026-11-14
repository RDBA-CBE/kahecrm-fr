import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Clock,
    Calendar,
    Phone,
    PhoneCall,
    Search,
    CheckCircle2,
    Share2,
    CalendarClock,
    User,
    UserCheck,
    Send,
    Edit,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface FollowUpRecord {
    id: string;
    contact_id: string;
    student_name: string;
    enquiry_id: string;
    city: string;
    contact_number: string;
    last_call_notes: string;
    outcome: string;
    scheduled_date_time: string;
    scheduled_date: string;
    scheduled_time: string;
    assigned_telecaller: string;
    status: string; // 'today' | 'upcoming' | 'overdue'
}

const CALL_OUTCOMES = [
    { label: 'Interested', value: 'Interested' },
    { label: 'Call Later', value: 'Call Later' },
    { label: 'No Answer', value: 'No Answer' },
    { label: 'Busy', value: 'Busy' },
    { label: 'Not Interested', value: 'Not Interested' },
    { label: 'Wrong Number', value: 'Wrong Number' },
    { label: 'Counselling Needed', value: 'Counselling Needed' },
];

const FollowUpsPage = () => {
    const router = useRouter();

    const [state, setState] = useSetState({
        followupsList: [] as FollowUpRecord[],
        totalRecords: 0,
        isLoading: false,
        activeTab: 'today', // 'today' | 'upcoming' | 'overdue'
        searchQuery: '',
        currentPage: 1,
        recordsPerPage: 5,
        counts: {
            today: 2,
            upcoming: 0,
            overdue: 2,
        },

        // Call & Update Modal
        isOpenCallUpdate: false,
        selectedFollowUp: null as FollowUpRecord | null,
        callOutcome: 'Interested',
        callNotes: '',
        scheduleCallback: false,
        callbackDate: '2026-05-06',
        callbackTime: '11:00 AM',
        referToCounsellor: false,
        updateErrors: {} as Record<string, string>,
        isSubmittingUpdate: false,

        // Reschedule Modal (Image 3)
        isOpenReschedule: false,
        rescheduleFollowUp: null as FollowUpRecord | null,
        newDate: '2026-05-06',
        newTime: '11:30 AM',
        rescheduleReason: '',
        isSubmittingReschedule: false,

        // Transfer Callback Modal
        isOpenTransfer: false,
        transferFollowUp: null as FollowUpRecord | null,
        transferToStaff: 'S. Saravanan (Senior Counsellor)',
        transferReason: 'Candidate requested in-depth scholarship counselling.',
        isSubmittingTransfer: false,

        // Complete Modal
        isOpenComplete: false,
        completeFollowUp: null as FollowUpRecord | null,
    });

    const search = useDebounce(state.searchQuery, 400);

    // Build API query params / body containing all active keys with values (zero frontend filtering)
    const body_data = () => {
        const body: Record<string, any> = {
            page: state.currentPage,
            page_size: state.recordsPerPage,
            tab: state.activeTab,
        };
        if (search && search.trim()) {
            body.search = search.trim();
        }
        return body;
    };

    // Fetch Follow-up Data from Contact Model Telecaller API
    const getData = async () => {
        try {
            setState({ isLoading: true });
            const body = body_data();
            const res: any = await Models.contact.telecaller.followups(body);
            setState({
                followupsList: res?.data || [],
                totalRecords: res?.total_records || 0,
                counts: res?.counts || state.counts,
                isLoading: false,
            });
        } catch (error) {
            console.error('Telecaller followups error:', error);
            setState({ isLoading: false });
        }
    };

    useEffect(() => {
        getData();
    }, [search, state.activeTab, state.currentPage, state.recordsPerPage]);

    // Open Call & Update Modal
    const handleOpenCallUpdate = (item: FollowUpRecord) => {
        setState({
            selectedFollowUp: item,
            callOutcome: item.outcome || 'Interested',
            callNotes: item.last_call_notes || '',
            scheduleCallback: false,
            callbackDate: '2026-05-06',
            callbackTime: '11:00 AM',
            referToCounsellor: false,
            updateErrors: {},
            isOpenCallUpdate: true,
        });
    };

    // Submit Call & Update
    const handleSubmitCallUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.selectedFollowUp) return;

        if (!state.callNotes || !state.callNotes.trim()) {
            setState({ updateErrors: { notes: 'Please enter conversation notes' } });
            return;
        }

        try {
            setState({ isSubmittingUpdate: true });
            const payload = {
                outcome: state.callOutcome,
                notes: state.callNotes.trim(),
                next_action: `Follow-up commitment for ${state.callOutcome}`,
                schedule_callback: state.scheduleCallback,
                callback_date: state.scheduleCallback ? state.callbackDate : null,
                callback_time: state.scheduleCallback ? state.callbackTime : null,
                refer_to_counsellor: state.referToCounsellor,
            };

            await Models.contact.telecaller.update_call(state.selectedFollowUp.contact_id, payload);
            setState({ isOpenCallUpdate: false, isSubmittingUpdate: false, selectedFollowUp: null });
            getData();
        } catch (error) {
            console.error('Call update error:', error);
            setState({ isSubmittingUpdate: false });
        }
    };

    // Open Reschedule Modal
    const handleOpenReschedule = (item: FollowUpRecord) => {
        setState({
            rescheduleFollowUp: item,
            newDate: item.scheduled_date || '2026-05-06',
            newTime: item.scheduled_time || '11:30 AM',
            rescheduleReason: item.last_call_notes || '',
            isOpenReschedule: true,
        });
    };

    // Submit Reschedule
    const handleSubmitReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.rescheduleFollowUp) return;

        try {
            setState({ isSubmittingReschedule: true });
            const payload = {
                date: state.newDate,
                time: state.newTime,
                reason: state.rescheduleReason.trim(),
            };

            await Models.contact.telecaller.reschedule_call(state.rescheduleFollowUp.id, payload);
            setState({ isOpenReschedule: false, isSubmittingReschedule: false, rescheduleFollowUp: null });
            getData();
        } catch (error) {
            console.error('Reschedule error:', error);
            setState({ isSubmittingReschedule: false });
        }
    };

    // Handle Complete Callback
    const handleConfirmComplete = async () => {
        if (!state.completeFollowUp) return;
        try {
            await Models.contact.telecaller.complete_callback(state.completeFollowUp.id);
            setState({ isOpenComplete: false, completeFollowUp: null });
            getData();
        } catch (error) {
            console.error('Complete error:', error);
        }
    };

    // Submit Transfer Callback
    const handleSubmitTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.transferFollowUp) return;

        try {
            setState({ isSubmittingTransfer: true });
            const payload = {
                assigned_to: state.transferToStaff,
                reason: state.transferReason.trim(),
            };

            await Models.contact.telecaller.transfer_callback(state.transferFollowUp.id, payload);
            setState({ isOpenTransfer: false, isSubmittingTransfer: false, transferFollowUp: null });
            getData();
        } catch (error) {
            console.error('Transfer error:', error);
            setState({ isSubmittingTransfer: false });
        }
    };

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>Follow-ups & Scheduled Callbacks - Telecaller Desk</title>
            </Head>

            {/* ============================================================== */}
            {/* PAGE HEADER (Matching Image 6) */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Follow-ups & Scheduled Callbacks
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Maintain callback commitments and request administrative transfers when unavailable.
                    </p>
                </div>


            </div>

            {/* ============================================================== */}
            {/* FILTER TABS & SEARCH BAR (Matching Image 6) */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setState({ activeTab: 'today', currentPage: 1 })}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${state.activeTab === 'today'
                                ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <span>Today's Callbacks</span>
                            <span
                                className={`inline-block px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${state.activeTab === 'today'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {state.counts.today}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setState({ activeTab: 'upcoming', currentPage: 1 })}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${state.activeTab === 'upcoming'
                                ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <span>Upcoming Schedule</span>
                            <span className="inline-block px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {state.counts.upcoming}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setState({ activeTab: 'overdue', currentPage: 1 })}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${state.activeTab === 'overdue'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50/50 dark:bg-gray-800 dark:border-rose-900/40 dark:text-rose-400'
                                }`}
                        >
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Overdue</span>
                            <span
                                className={`inline-block px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${state.activeTab === 'overdue'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                    }`}
                            >
                                {state.counts.overdue}
                            </span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative min-w-[260px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.searchQuery}
                            onChange={(e) => setState({ searchQuery: e.target.value, currentPage: 1 })}
                            placeholder="Search student name or notes..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#39854a] focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* CALLBACKS TABLE (Matching Image 6) */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30 text-xs font-bold text-gray-600 dark:text-gray-300">
                                <th className="py-4 px-6">Student Name</th>
                                <th className="py-4 px-6">Contact Number</th>
                                <th className="py-4 px-6">Last Call Notes</th>
                                <th className="py-4 px-6">Scheduled Date & Time</th>
                                <th className="py-4 px-6 text-center">Assigned Telecaller</th>
                                <th className="py-4 px-6 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
                            {state.isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                                            <span className="text-sm font-semibold">Loading callback records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : state.followupsList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        <p className="font-semibold text-gray-600 dark:text-gray-300">
                                            No callbacks scheduled
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            All callback commitments have been fulfilled for this tab.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                state.followupsList.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                                    >
                                        {/* Student Name */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                                {item.student_name}
                                            </div>
                                            <div className="text-[11px] font-medium text-gray-400 mt-0.5">
                                                {item.enquiry_id} · {item.city}
                                            </div>
                                        </td>

                                        {/* Contact Number */}
                                        <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            {item.contact_number}
                                        </td>

                                        {/* Last Call Notes */}
                                        <td className="py-4 px-6 max-w-sm">
                                            <div className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2">
                                                {item.last_call_notes}
                                            </div>
                                            <div className="mt-1">
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#39854a] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
                                                    Outcome: {item.outcome}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Scheduled Date & Time */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                                                <Calendar className="h-3.5 w-3.5 text-[#39854a]" />
                                                <span>{item.scheduled_date_time}</span>
                                            </div>
                                        </td>

                                        {/* Assigned Telecaller */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                                                {item.assigned_telecaller}
                                            </span>
                                        </td>

                                        {/* 4 Action Buttons (Matching Image 6) */}
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                {/* Call & Update (Green Solid) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCallUpdate(item)}
                                                    className="px-3 py-1.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                                                >
                                                    Call & Update
                                                </button>

                                                {/* Reschedule (White / Outline) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenReschedule(item)}
                                                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                                                >
                                                    Reschedule
                                                </button>

                                                {/* Complete (Green Outline) */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setState({ completeFollowUp: item, isOpenComplete: true })
                                                    }
                                                    className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                >
                                                    Complete
                                                </button>

                                                {/* Transfer (Orange Outline) */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setState({ transferFollowUp: item, isOpenTransfer: true })
                                                    }
                                                    className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-100 text-xs font-bold transition cursor-pointer dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                                                >
                                                    Transfer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer & Pagination */}
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
                            <span className="font-bold text-gray-800 dark:text-gray-200">{state.totalRecords}</span>{' '}
                            callbacks
                        </span>

                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[11px] text-gray-400">Rows:</span>
                            <select
                                value={state.recordsPerPage}
                                onChange={(e) =>
                                    setState({ recordsPerPage: Number(e.target.value), currentPage: 1 })
                                }
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
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
            {/* CALL & UPDATE MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenCallUpdate}
                close={() => setState({ isOpenCallUpdate: false, selectedFollowUp: null })}
                addHeader={
                    state.selectedFollowUp
                        ? `Call Update: ${state.selectedFollowUp.student_name}`
                        : 'Call Update'
                }
                renderComponent={() =>
                    state.selectedFollowUp && (
                        <form onSubmit={handleSubmitCallUpdate} className="p-5 space-y-4" noValidate>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                <Phone className="h-4 w-4 text-[#39854a]" />
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.selectedFollowUp.contact_number}
                                </span>
                                <span>·</span>
                                <span>{state.selectedFollowUp.city}</span>
                            </div>

                            {/* Outcome Pills */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                                    Call Outcome <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CALL_OUTCOMES.map((oc) => (
                                        <button
                                            key={oc.value}
                                            type="button"
                                            onClick={() => setState({ callOutcome: oc.value })}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${state.callOutcome === oc.value
                                                ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                                }`}
                                        >
                                            {oc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Call Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Call Notes / Conversation Feedback <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={state.callNotes}
                                    onChange={(e) => setState({ callNotes: e.target.value })}
                                    placeholder="Enter call outcome summary, parent requirements, campus visit schedules..."
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                {state.updateErrors.notes && (
                                    <p className="text-red-500 text-xs mt-1 font-semibold">
                                        ⚠ {state.updateErrors.notes}
                                    </p>
                                )}
                            </div>

                            {/* Checkbox: Schedule Another Callback */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:bg-gray-800/40">
                                    <input
                                        type="checkbox"
                                        checked={state.scheduleCallback}
                                        onChange={(e) => setState({ scheduleCallback: e.target.checked })}
                                        className="h-4 w-4 rounded accent-[#39854a]"
                                    />
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        Keep Callback Active for Further Follow-up
                                    </span>
                                </label>

                                {state.scheduleCallback && (
                                    <div className="grid grid-cols-2 gap-3 pl-6 pt-1">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                                New Callback Date
                                            </label>
                                            <input
                                                type="date"
                                                value={state.callbackDate}
                                                onChange={(e) => setState({ callbackDate: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                                New Callback Time
                                            </label>
                                            <input
                                                type="text"
                                                value={state.callbackTime}
                                                onChange={(e) => setState({ callbackTime: e.target.value })}
                                                placeholder="11:00 AM"
                                                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenCallUpdate: false, selectedFollowUp: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingUpdate}
                                    className="px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    {state.isSubmittingUpdate ? 'Saving...' : 'Save & Close'}
                                </button>
                            </div>
                        </form>
                    )
                }
            />

            {/* ============================================================== */}
            {/* RESCHEDULE MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenReschedule}
                close={() => setState({ isOpenReschedule: false, rescheduleFollowUp: null })}
                addHeader={
                    state.rescheduleFollowUp
                        ? `Reschedule Callback: ${state.rescheduleFollowUp.student_name}`
                        : 'Reschedule Callback'
                }
                renderComponent={() =>
                    state.rescheduleFollowUp && (
                        <form onSubmit={handleSubmitReschedule} className="p-5 space-y-4" noValidate>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                        New Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={state.newDate}
                                        onChange={(e) => setState({ newDate: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                        New Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={state.newTime}
                                        onChange={(e) => setState({ newTime: e.target.value })}
                                        placeholder="11:30 AM"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Reason / Note
                                </label>
                                <textarea
                                    rows={3}
                                    value={state.rescheduleReason}
                                    onChange={(e) => setState({ rescheduleReason: e.target.value })}
                                    placeholder="Enter reason for rescheduling callback..."
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenReschedule: false, rescheduleFollowUp: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingReschedule}
                                    className="px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    {state.isSubmittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                                </button>
                            </div>
                        </form>
                    )
                }
            />

            {/* ============================================================== */}
            {/* TRANSFER CALLBACK MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenTransfer}
                close={() => setState({ isOpenTransfer: false, transferFollowUp: null })}
                addHeader={
                    state.transferFollowUp
                        ? `Transfer Lead: ${state.transferFollowUp.student_name}`
                        : 'Transfer Lead'
                }
                renderComponent={() =>
                    state.transferFollowUp && (
                        <form onSubmit={handleSubmitTransfer} className="p-5 space-y-4" noValidate>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Transfer To Staff / Counsellor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={state.transferToStaff}
                                    onChange={(e) => setState({ transferToStaff: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                >
                                    <option value="S. Saravanan (Senior Counsellor)">
                                        S. Saravanan (Senior Counsellor)
                                    </option>
                                    <option value="K. Mohan (Telecaller)">K. Mohan (Telecaller)</option>
                                    <option value="R. Natarajan (Admissions Head)">
                                        R. Natarajan (Admissions Head)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Reason for Transfer
                                </label>
                                <textarea
                                    rows={3}
                                    value={state.transferReason}
                                    onChange={(e) => setState({ transferReason: e.target.value })}
                                    placeholder="e.g. Student requested on-campus lab tour and scholarship waiver counselling."
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenTransfer: false, transferFollowUp: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingTransfer}
                                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    {state.isSubmittingTransfer ? 'Transferring...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </form>
                    )
                }
            />

            {/* ============================================================== */}
            {/* COMPLETE CONFIRMATION MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenComplete}
                close={() => setState({ isOpenComplete: false, completeFollowUp: null })}
                addHeader="Mark Callback as Completed"
                renderComponent={() =>
                    state.completeFollowUp && (
                        <div className="p-5 space-y-4">
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                                Are you sure you want to mark the scheduled callback for{' '}
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {state.completeFollowUp.student_name}
                                </span>{' '}
                                as fulfilled and completed?
                            </p>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 dark:bg-gray-800 dark:border-gray-700">
                                <div>Scheduled: {state.completeFollowUp.scheduled_date_time}</div>
                                <div className="mt-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Notes: {state.completeFollowUp.last_call_notes}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenComplete: false, completeFollowUp: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmComplete}
                                    className="px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                                >
                                    Yes, Mark Completed
                                </button>
                            </div>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default FollowUpsPage;

