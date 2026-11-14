import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Search,
    Clock,
    Calendar,
    Send,
    UserPlus,
    UploadCloud,
    ArrowRight,
    MessageCircle,
    ArrowLeftRight,
    CheckCircle2,
    Check,
    AlertCircle,
    Building2,
    CalendarClock,
    FileText,
    Eye,
} from 'lucide-react';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';
import TextInput from '@/components/TextInput';
import TextArea from '@/components/TextArea';
import CustomSelect from '@/components/Select';
import StudentDetailsModal from '@/components/KAHE/StudentDetailsModal';
import { AdmissionContact } from '@/components/KAHE/AdmissionsContactsTable';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface QueueItem {
    id: string;
    enquiry_id: string;
    student_name: string;
    mobile: string;
    city: string;
    qualification: string;
    target_programme: string;
    institution: string;
    referred_by: string;
    referred_by_role?: string;
    referral_date: string;
    referral_reason: string;
    priority: string;
    status: string;
    tab: string;
    marks?: string;
    campus?: string;
    current_stage?: string;
    notes?: string;
    session_outcome?: string | null;
}

export default function CounsellorQueue() {
    const router = useRouter();

    const [state, setState] = useSetState({
        loading: true,
        activeTab: 'pending', // 'pending' | 'in_progress' | 'completed' | 'direct'
        queueItems: [] as QueueItem[],
        totalItems: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        searchQuery: '',
        priorityFilter: 'all',

        // Tab counts
        counts: {
            pending: 1,
            in_progress: 1,
            completed: 0,
            direct: 1,
        },

        // Modal 1: Counselling Review Modal (Image 4)
        isReviewModalOpen: false,
        selectedCandidate: null as QueueItem | null,
        reviewOutcome: 'Campus Visit Scheduled',
        admissionStage: 'Applied',
        consultationNotes: '',
        reviewSubmitting: false,
        reviewErrors: {} as Record<string, string>,

        // Full Student Profile Drawer State
        isProfileDrawerOpen: false,
        profileDrawerContact: null as AdmissionContact | null,

        // Modal 2: Request Assignment to Telecaller (Image 5)
        isTransferModalOpen: false,
        transferCandidate: null as QueueItem | null,
        selectedTelecaller: 'P. Malathi',
        transferReason: '',
        transferSubmitting: false,
        transferErrors: {} as Record<string, string>,

        // Modal 3: Schedule Consultation Follow-up (Image 6)
        isScheduleModalOpen: false,
        scheduleCandidate: null as QueueItem | null,
        scheduleDate: '2026-05-09',
        scheduleTime: '11:00 AM',
        scheduleAgenda: '',
        scheduleSubmitting: false,
        scheduleErrors: {} as Record<string, string>,

        // Modal 4: Add Contact Modal
        isAddModalOpen: false,
        addForm: {
            student_name: '',
            mobile: '',
            city: 'Coimbatore',
            qualification: '12th Standard',
            target_programme: 'Computer Science & Engineering',
            marks: '',
            priority: 'Normal',
            notes: '',
        },
        addErrors: {} as Record<string, string>,
        addSubmitting: false,

        successAlert: '',
    });

    const debouncedSearch = useDebounce(state.searchQuery, 300);

    const loadQueueData = async () => {
        try {
            setState({ loading: true });
            const params = {
                tab: state.activeTab,
                search: debouncedSearch,
                priority: state.priorityFilter,
                page: state.page,
                page_size: state.pageSize,
            };

            const res: any = await (Models.contact as any).counsellor.queue(params);
            if (res?.success) {
                setState({
                    queueItems: res.results || [],
                    totalItems: res.total || 0,
                    totalPages: res.total_pages || 1,
                    counts: res.counts || state.counts,
                    loading: false,
                });
            } else {
                setState({ loading: false });
            }
        } catch (error) {
            console.error('Failed to load counselling queue', error);
            setState({ loading: false });
        }
    };

    useEffect(() => {
        loadQueueData();
    }, [state.activeTab, debouncedSearch, state.priorityFilter, state.page, state.pageSize]);

    // Switch Tab
    const handleTabChange = (tab: string) => {
        setState({
            activeTab: tab,
            page: 1,
        });
    };

    // Open Review Modal (Image 4)
    const openReviewModal = (item: QueueItem) => {
        setState({
            selectedCandidate: item,
            isReviewModalOpen: true,
            reviewOutcome: item.session_outcome || 'Campus Visit Scheduled',
            admissionStage: item.current_stage || 'Applied',
            consultationNotes: item.notes || '',
            reviewErrors: {},
        });
    };

    // Open Full Student Profile Drawer using existing StudentDetailsModal component
    const handleOpenFullProfile = (item: QueueItem | null) => {
        if (!item) return;
        const mappedContact: AdmissionContact = {
            id: item.enquiry_id || item.id,
            enquiry_id: item.enquiry_id || item.id,
            student_name: item.student_name,
            phone_number: item.mobile || '+91 98421 98210',
            parent_phone: '+91 98420 11990',
            city: item.city || 'Coimbatore',
            area: 'Eachanari',
            qualification: item.qualification || '12th Standard',
            target_course: item.target_programme || 'Computer Science & Engineering',
            institution: item.institution || 'KAHE',
            assigned_to: 'Dr. K. Swaminathan',
            assigned_role: 'Senior Counsellor',
            status: item.current_stage || item.status || 'Counselling',
        };

        setState({
            profileDrawerContact: mappedContact,
            isProfileDrawerOpen: true,
        });
    };

    // Finalize Review Modal Submit
    const handleFinalizeReview = async () => {
        const errors: Record<string, string> = {};
        if (!state.reviewOutcome) {
            errors.reviewOutcome = 'Please select a session outcome decision';
        }
        if (!state.consultationNotes || state.consultationNotes.trim().length < 5) {
            errors.consultationNotes = 'Senior counsellor consultation notes are required (min 5 chars)';
        }

        if (Object.keys(errors).length > 0) {
            setState({ reviewErrors: errors });
            return;
        }

        try {
            setState({ reviewSubmitting: true });
            const candidateId = state.selectedCandidate?.enquiry_id || state.selectedCandidate?.id;
            await (Models.contact as any).counsellor.update_session(candidateId, {
                session_outcome: state.reviewOutcome,
                stage: state.admissionStage,
                notes: state.consultationNotes,
            });

            setState({
                isReviewModalOpen: false,
                reviewSubmitting: false,
                selectedCandidate: null,
                successAlert: 'Counselling review finalized successfully!',
            });
            setTimeout(() => setState({ successAlert: '' }), 4000);
            await loadQueueData();
        } catch (error) {
            console.error('Error finalizing review:', error);
            setState({ reviewSubmitting: false });
        }
    };

    // Open Transfer Modal (Image 5)
    const openTransferModal = (item: QueueItem) => {
        setState({
            transferCandidate: item,
            isTransferModalOpen: true,
            selectedTelecaller: 'P. Malathi',
            transferReason: '',
            transferErrors: {},
        });
    };

    // Submit Request Assignment to Admin (Image 5)
    const handleSubmitTransfer = async () => {
        const errors: Record<string, string> = {};
        if (!state.transferReason.trim()) {
            errors.transferReason = 'Reason for assignment request is required';
        }

        if (Object.keys(errors).length > 0) {
            setState({ transferErrors: errors });
            return;
        }

        try {
            setState({ transferSubmitting: true });
            const candidateId = state.transferCandidate?.enquiry_id || state.transferCandidate?.id;
            await (Models.contact as any).counsellor.request_assignment(candidateId, {
                telecaller: state.selectedTelecaller,
                reason: state.transferReason,
            });

            setState({
                isTransferModalOpen: false,
                transferSubmitting: false,
                transferCandidate: null,
                successAlert: 'Request submitted to central Admin queue for telecaller assignment!',
            });
            setTimeout(() => setState({ successAlert: '' }), 4000);
            await loadQueueData();
        } catch (error) {
            console.error('Error requesting assignment:', error);
            setState({ transferSubmitting: false });
        }
    };

    // Open Schedule Follow-up Modal (Image 6)
    const openScheduleModal = (item: QueueItem) => {
        setState({
            scheduleCandidate: item,
            isScheduleModalOpen: true,
            scheduleDate: '2026-05-09',
            scheduleTime: '11:00 AM',
            scheduleAgenda: item.referral_reason || '',
            scheduleErrors: {},
        });
    };

    // Submit Schedule Follow-up (Image 6)
    const handleSubmitSchedule = async () => {
        const errors: Record<string, string> = {};
        if (!state.scheduleDate) errors.scheduleDate = 'Follow-up date is required';
        if (!state.scheduleTime) errors.scheduleTime = 'Scheduled time is required';
        if (!state.scheduleAgenda.trim()) errors.scheduleAgenda = 'Agenda / consultation notes are required';

        if (Object.keys(errors).length > 0) {
            setState({ scheduleErrors: errors });
            return;
        }

        try {
            setState({ scheduleSubmitting: true });
            const candidateId = state.scheduleCandidate?.enquiry_id || state.scheduleCandidate?.id;
            await (Models.contact as any).counsellor.schedule_followup(candidateId, {
                followup_date: state.scheduleDate,
                followup_time: state.scheduleTime,
                agenda_notes: state.scheduleAgenda,
                student_name: state.scheduleCandidate?.student_name,
                target_programme: state.scheduleCandidate?.target_programme,
            });

            setState({
                isScheduleModalOpen: false,
                scheduleSubmitting: false,
                scheduleCandidate: null,
                successAlert: 'Follow-up consultation confirmed & added to campus visits!',
            });
            setTimeout(() => setState({ successAlert: '' }), 4000);
            await loadQueueData();
        } catch (error) {
            console.error('Error scheduling follow-up:', error);
            setState({ scheduleSubmitting: false });
        }
    };

    // Open WhatsApp
    const handleWhatsApp = (item: QueueItem) => {
        const cleanNumber = item.mobile.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(
            `Hello ${item.student_name}, greetings from Karpagam Academy of Higher Education (KAHE). We are following up regarding your academic counselling for ${item.target_programme}.`
        );
        window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    };

    // Submit Add Contact
    const handleAddContactSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!state.addForm.student_name.trim()) errors.student_name = 'Student Name is required';
        if (!state.addForm.mobile.trim()) {
            errors.mobile = 'Mobile number is required';
        } else if (!/^\+?[0-9\s-]{10,14}$/.test(state.addForm.mobile.trim())) {
            errors.mobile = 'Enter a valid 10-digit mobile number';
        }

        if (Object.keys(errors).length > 0) {
            setState({ addErrors: errors });
            return;
        }

        try {
            setState({ addSubmitting: true });
            await (Models.contact as any).counsellor.add_contact(state.addForm);
            setState({
                isAddModalOpen: false,
                addSubmitting: false,
                addForm: {
                    student_name: '',
                    mobile: '',
                    city: 'Coimbatore',
                    qualification: '12th Standard',
                    target_programme: 'Computer Science & Engineering',
                    marks: '',
                    priority: 'Normal',
                    notes: '',
                },
                addErrors: {},
                successAlert: 'Direct enquiry added to counselling queue!',
            });
            setTimeout(() => setState({ successAlert: '' }), 4000);
            await loadQueueData();
        } catch (error) {
            console.error('Error adding contact:', error);
            setState({ addSubmitting: false });
        }
    };

    const sessionOutcomeOptions = [
        { value: 'Campus Visit Scheduled', label: 'Campus Visit Scheduled' },
        { value: 'Spot Provisional Admission Offered', label: 'Spot Provisional Admission Offered' },
        { value: 'Document Verification Pending', label: 'Document Verification Pending' },
        { value: 'Transferred to Telecaller for Routine Follow-up', label: 'Transferred to Telecaller for Routine Follow-up' },
        { value: 'Student Seeking Other Courses', label: 'Student Seeking Other Courses' },
        { value: 'Declined / Enrolled Elsewhere', label: 'Declined / Enrolled Elsewhere' },
    ];

    const telecallerOptions = [
        { value: 'P. Malathi', label: 'P. Malathi (Senior Telecaller)' },
        { value: 'K. Kavitha', label: 'K. Kavitha (Admissions Counsellor)' },
        { value: 'R. Suresh', label: 'R. Suresh (Outreach Caller)' },
        { value: 'Any Available', label: 'Central Admin Pool (Auto Assign)' },
    ];

    const targetProgrammeOptions = [
        { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (KAHE)' },
        { value: 'B.Sc Nursing', label: 'B.Sc Nursing (KAHE)' },
        { value: 'Bachelor of Pharmacy', label: 'Bachelor of Pharmacy (KAHE)' },
        { value: 'Artificial Intelligence & Data Science', label: 'Artificial Intelligence & Data Science (KAHE)' },
        { value: 'Information Technology', label: 'Information Technology (KAHE)' },
        { value: 'MCA / MBA', label: 'MCA / MBA (KAHE)' },
    ];

    const priorityOptions = [
        { value: 'High', label: 'High' },
        { value: 'Urgent', label: 'Urgent' },
        { value: 'Normal', label: 'Normal' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060818] p-4 lg:p-6 space-y-5">
            <Head>
                <title>Senior Academic Counselling Queue · KAHE Admissions</title>
            </Head>

            {/* Success Alert Banner */}
            {state.successAlert && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#39854a] rounded-xl flex items-center justify-between shadow-sm animate-fade-in text-sm font-semibold">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{state.successAlert}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setState({ successAlert: '' })}
                        className="text-[#39854a] hover:opacity-75"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Header Section (Using Common CSS: page-title, page-subtitle, btn-action-solid, btn-action-outline) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Senior Academic Counselling Queue
                    </h1>
                    <p className="page-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Conduct high-level academic consultations, verify eligibility cut-offs, and authorize spot provisional admissions.
                    </p>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/counsellor/bulk_import"
                        className="btn-action-outline"
                    >
                        <UploadCloud className="w-4 h-4 text-[#39854a]" />
                        <span>Import Contacts</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setState({ isAddModalOpen: true })}
                        className="btn-action-solid"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add Contact</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs Bar (Using overview-panel) */}
            <div className="overview-panel p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
                {[
                    { id: 'pending', label: 'Pending Enquiries', count: state.counts.pending },
                    { id: 'in_progress', label: 'In Progress Enquiries', count: state.counts.in_progress },
                    { id: 'completed', label: 'Completed Enquiries', count: state.counts.completed },
                    { id: 'direct', label: 'Direct Enquiries', count: state.counts.direct },
                ].map((tab) => {
                    const isActive = state.activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-[0.98] ${isActive
                                ? 'bg-[#39854a] text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`px-2 py-0.5 text-xs rounded-full font-bold ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search and Secondary Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search student name, programme, city, enquiry ID..."
                        value={state.searchQuery}
                        onChange={(e) => setState({ searchQuery: e.target.value, page: 1 })}
                        className="form-input !pl-9"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Priority:</span>
                    <select
                        value={state.priorityFilter}
                        onChange={(e) => setState({ priorityFilter: e.target.value, page: 1 })}
                        className="form-select !w-auto text-xs font-semibold"
                    >
                        <option value="all">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent Priority</option>
                        <option value="Normal">Normal Priority</option>
                    </select>
                </div>
            </div>

            {/* Table Card (Using Common CSS: overview-panel, table-heading, badge-soft-*) */}
            <div className="overview-panel p-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50/75 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 uppercase text-[11px] font-extrabold tracking-wider border-b border-gray-200/80 dark:border-gray-800">
                            <tr>
                                <th scope="col" className="table-heading px-5 py-3.5">
                                    Student Name
                                </th>
                                <th scope="col" className="table-heading px-5 py-3.5">
                                    Target Programme
                                </th>
                                <th scope="col" className="table-heading px-5 py-3.5">
                                    {state.activeTab === 'direct' ? 'Enquiry Source' : 'Referred By'}
                                </th>
                                <th scope="col" className="table-heading px-5 py-3.5">
                                    {state.activeTab === 'direct' ? 'Current Stage' : 'Referral Reason'}
                                </th>
                                <th scope="col" className="table-heading px-5 py-3.5">
                                    Priority
                                </th>
                                <th scope="col" className="table-heading px-5 py-3.5">
                                    Status
                                </th>
                                <th scope="col" className="table-heading px-5 py-3.5 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                            {state.loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                                        Loading academic counselling queue...
                                    </td>
                                </tr>
                            ) : state.queueItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                                        No enquiries found in this queue tab.
                                    </td>
                                </tr>
                            ) : (
                                state.queueItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                                    >
                                        {/* Student Name */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                                                        {item.student_name}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                        {item.enquiry_id}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-400 dark:text-gray-500">
                                                    {item.mobile} · {item.city} · {item.qualification}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Target Programme */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                <span className="font-bold text-gray-900 dark:text-gray-100 block">
                                                    {item.target_programme}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-semibold">
                                                    {item.institution}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Referred By */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                <span className="font-bold text-gray-800 dark:text-gray-200 block">
                                                    {item.referred_by}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-mono">
                                                    {item.referral_date}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Referral Reason */}
                                        <td className="px-5 py-4 max-w-xs">
                                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {item.referral_reason}
                                            </p>
                                        </td>

                                        {/* Priority (Using Common CSS badge-soft-*) */}
                                        <td className="px-5 py-4">
                                            {item.priority === 'High' && (
                                                <span className="badge-soft-warning font-bold">
                                                    High
                                                </span>
                                            )}
                                            {item.priority === 'Urgent' && (
                                                <span className="badge-soft-danger font-bold">
                                                    Urgent
                                                </span>
                                            )}
                                            {item.priority !== 'High' && item.priority !== 'Urgent' && (
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                                                    {item.priority || 'Normal'}
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            {item.status === 'Pending' && (
                                                <span className="badge-soft-warning font-bold">
                                                    Pending
                                                </span>
                                            )}
                                            {item.status === 'In Progress' && (
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                                                    In Progress
                                                </span>
                                            )}
                                            {item.status === 'Completed' && (
                                                <span className="badge-soft-success font-bold">
                                                    Completed
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions (WhatsApp, Clock, Transfer, Counselling ->) */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Action 1: WhatsApp */}
                                                <button
                                                    type="button"
                                                    title="Chat on WhatsApp"
                                                    onClick={() => handleWhatsApp(item)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition active:scale-95"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>

                                                {/* Action 2: Schedule Follow-up (Clock) */}
                                                <button
                                                    type="button"
                                                    title="Schedule Consultation Follow-up"
                                                    onClick={() => openScheduleModal(item)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition active:scale-95"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>

                                                {/* Action 3: Request Assignment to Telecaller (Transfer) */}
                                                <button
                                                    type="button"
                                                    title="Request Assignment to Telecaller"
                                                    onClick={() => openTransferModal(item)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition active:scale-95"
                                                >
                                                    <ArrowLeftRight className="w-4 h-4" />
                                                </button>

                                                {/* Action 4: Counselling -> Solid Green Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => openReviewModal(item)}
                                                    className="btn-action-solid !py-1.5 !px-3 !text-xs flex items-center gap-1 active:scale-95"
                                                >
                                                    <span>Counselling</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <div>
                        Showing {(state.page - 1) * state.pageSize + 1} to{' '}
                        {Math.min(state.page * state.pageSize, state.totalItems)} of {state.totalItems} entries
                    </div>
                    <Pagination
                        totalRecords={state.totalItems}
                        currentPage={state.page}
                        recordsPerPage={state.pageSize}
                        onPageChange={(p: number) => setState({ page: p })}
                        hasNext={state.page < state.totalPages}
                        hasPrevious={state.page > 1}
                    />
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: COUNSELLING REVIEW MODAL (Matching Image 4, using CustomSelect, TextArea) */}
            {/* ========================================================================= */}
            <Modal
                show={state.isReviewModalOpen}
                setShow={(val: boolean) => setState({ isReviewModalOpen: val })}
                title=""
                maxWidth="max-w-2xl"
                addHeader={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-sm text-[#39854a]">
                            {state.selectedCandidate?.student_name?.slice(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {state.selectedCandidate?.student_name}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 font-mono">
                                    {state.selectedCandidate?.enquiry_id || 'ENQ-2026-0101'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {state.selectedCandidate?.city || 'Coimbatore'} · Preferred:{' '}
                                <span className="text-[#39854a] font-semibold">
                                    {state.selectedCandidate?.target_programme || 'Computer Science & Engineering'}
                                </span>
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 pt-1">
                    {/* Candidate Details Card */}
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Qualification</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {state.selectedCandidate?.qualification || '12th Standard'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Marks / Cutoff</span>
                            <span className="font-semibold text-[#39854a]">
                                {state.selectedCandidate?.marks || '570 / 600 (95.0%)'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Target Course</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {state.selectedCandidate?.target_programme || 'Computer Science & Engineering'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Campus</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {state.selectedCandidate?.campus || 'KAHE - Main Campus, Eachanari'}
                            </span>
                        </div>
                    </div>

                    {/* Referral Box */}
                    <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                            <span>
                                Referral from Telecaller {state.selectedCandidate?.referred_by || 'P. Malathi'}
                            </span>
                            <span className="badge-soft-warning text-[10px]">
                                Priority: {state.selectedCandidate?.priority || 'High'}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                            &quot;{state.selectedCandidate?.referral_reason}&quot;
                        </p>
                    </div>

                    {/* Form Field 1: Session Outcome Decision using CustomSelect component */}
                    <div>
                        <CustomSelect
                            title="Session Outcome Decision"
                            required
                            options={sessionOutcomeOptions}
                            value={
                                state.reviewOutcome
                                    ? { value: state.reviewOutcome, label: state.reviewOutcome }
                                    : null
                            }
                            onChange={(opt: any) => setState({ reviewOutcome: opt?.value || '' })}
                            error={state.reviewErrors.reviewOutcome}
                        />
                    </div>

                    {/* Form Field 2: Update Candidate Admission Stage Pills */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            Update Candidate Admission Stage
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Counselling', 'Applied', 'Admitted', 'Not Interested'].map((stage) => {
                                const isSelected = state.admissionStage === stage;
                                return (
                                    <button
                                        key={stage}
                                        type="button"
                                        onClick={() => setState({ admissionStage: stage })}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${isSelected
                                            ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {stage}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form Field 3: Senior Counsellor Consultation Notes using TextArea */}
                    <div>
                        <TextArea
                            title="Senior Counsellor Consultation Notes"
                            required
                            rows={3}
                            value={state.consultationNotes}
                            onChange={(val: string) => setState({ consultationNotes: val })}
                            placeholder="Enter detailed remarks on eligibility evaluation, fee concession agreed, parent interaction, next steps..."
                            error={state.reviewErrors.consultationNotes}
                        />
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => handleOpenFullProfile(state.selectedCandidate)}
                            className="text-xs font-bold text-[#39854a] hover:underline flex items-center gap-1.5"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Student Profile →</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setState({ isReviewModalOpen: false })}
                                className="btn-action-outline !py-2 !px-4 !text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={state.reviewSubmitting}
                                onClick={handleFinalizeReview}
                                className="btn-action-solid !py-2 !px-4 !text-xs disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{state.reviewSubmitting ? 'Finalizing...' : 'Finalize Counselling Session'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 2: REQUEST ASSIGNMENT TO TELECALLER (Matching Image 5, using CustomSelect, TextArea) */}
            {/* ========================================================================= */}
            <Modal
                show={state.isTransferModalOpen}
                setShow={(val: boolean) => setState({ isTransferModalOpen: val })}
                title="Request Assignment to Telecaller"
            >
                <div className="space-y-4 pt-2">
                    {/* Explanation */}
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Send this enquiry to the central Admin queue to assign to a dedicated telecaller for documentation and status updates.
                    </p>

                    {/* Candidate Info Box */}
                    <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
                            <span>Candidate: {state.transferCandidate?.student_name}</span>
                            <span className="font-mono text-[11px]">{state.transferCandidate?.enquiry_id}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            Current Desk: Senior Academic Counselling · Target: {state.transferCandidate?.target_programme}
                        </div>
                    </div>

                    {/* Dropdown: Preferred Telecaller using CustomSelect */}
                    <div>
                        <CustomSelect
                            title="Preferred Telecaller (Optional)"
                            options={telecallerOptions}
                            value={{
                                value: state.selectedTelecaller,
                                label: state.selectedTelecaller,
                            }}
                            onChange={(opt: any) => setState({ selectedTelecaller: opt?.value || 'P. Malathi' })}
                        />
                    </div>

                    {/* Reason Textarea using TextArea */}
                    <div>
                        <TextArea
                            title="Reason for Assignment Request"
                            required
                            rows={3}
                            value={state.transferReason}
                            onChange={(val: string) => setState({ transferReason: val })}
                            placeholder="Specify reasons for assigning back (e.g., student requires document collection assistance, routine payment follow-up, out of state documentation)..."
                            error={state.transferErrors.transferReason}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setState({ isTransferModalOpen: false })}
                            className="btn-action-outline !py-2 !px-4 !text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={state.transferSubmitting}
                            onClick={handleSubmitTransfer}
                            className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition disabled:opacity-50"
                        >
                            {state.transferSubmitting ? 'Submitting...' : 'Submit Request to Admin'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 3: SCHEDULE CONSULTATION FOLLOW-UP (Matching Image 6, using TextInput, TextArea) */}
            {/* ========================================================================= */}
            <Modal
                show={state.isScheduleModalOpen}
                setShow={(val: boolean) => setState({ isScheduleModalOpen: val })}
                title={`Schedule Consultation Follow-up: ${state.scheduleCandidate?.student_name || ''}`}
            >
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextInput
                            title="Follow-up Date"
                            required
                            type="date"
                            value={state.scheduleDate}
                            onChange={(val: string) => setState({ scheduleDate: val })}
                            error={state.scheduleErrors.scheduleDate}
                        />

                        <TextInput
                            title="Scheduled Time"
                            required
                            placeholder="11:00 AM"
                            value={state.scheduleTime}
                            onChange={(val: string) => setState({ scheduleTime: val })}
                            error={state.scheduleErrors.scheduleTime}
                        />
                    </div>

                    <div>
                        <TextArea
                            title="Agenda / Consultation Notes"
                            required
                            rows={3}
                            value={state.scheduleAgenda}
                            onChange={(val: string) => setState({ scheduleAgenda: val })}
                            placeholder="e.g., Campus visit scheduled with parents at Eachanari admissions cell to verify original certificates..."
                            error={state.scheduleErrors.scheduleAgenda}
                        />
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setState({ isScheduleModalOpen: false })}
                            className="btn-action-outline !py-2 !px-4 !text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={state.scheduleSubmitting}
                            onClick={handleSubmitSchedule}
                            className="btn-action-solid !py-2 !px-4 !text-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{state.scheduleSubmitting ? 'Confirming...' : 'Confirm Follow-up'}</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 4: ADD CONTACT MODAL (Using TextInput, TextArea, CustomSelect) */}
            {/* ========================================================================= */}
            <Modal
                show={state.isAddModalOpen}
                setShow={(val: boolean) => setState({ isAddModalOpen: val })}
                title="Add New Enquiry to Counselling Desk"
            >
                <div className="space-y-4 pt-2">
                    <TextInput
                        title="Student Full Name"
                        required
                        placeholder="e.g. S. Gokul"
                        value={state.addForm.student_name}
                        onChange={(val: string) =>
                            setState({ addForm: { ...state.addForm, student_name: val } })
                        }
                        error={state.addErrors.student_name}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextInput
                            title="Student Mobile"
                            required
                            placeholder="+91 98421 XXXXX"
                            value={state.addForm.mobile}
                            onChange={(val: string) =>
                                setState({ addForm: { ...state.addForm, mobile: val } })
                            }
                            error={state.addErrors.mobile}
                        />

                        <TextInput
                            title="City / Location"
                            placeholder="Coimbatore"
                            value={state.addForm.city}
                            onChange={(val: string) =>
                                setState({ addForm: { ...state.addForm, city: val } })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomSelect
                            title="Target Programme"
                            options={targetProgrammeOptions}
                            value={{
                                value: state.addForm.target_programme,
                                label: state.addForm.target_programme,
                            }}
                            onChange={(opt: any) =>
                                setState({
                                    addForm: { ...state.addForm, target_programme: opt?.value },
                                })
                            }
                        />

                        <CustomSelect
                            title="Priority Level"
                            options={priorityOptions}
                            value={{
                                value: state.addForm.priority,
                                label: state.addForm.priority,
                            }}
                            onChange={(opt: any) =>
                                setState({
                                    addForm: { ...state.addForm, priority: opt?.value },
                                })
                            }
                        />
                    </div>

                    <TextArea
                        title="Consultation Remarks"
                        rows={2}
                        placeholder="Direct student interest, cutoff marks, concession requests..."
                        value={state.addForm.notes}
                        onChange={(val: string) =>
                            setState({ addForm: { ...state.addForm, notes: val } })
                        }
                    />

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setState({ isAddModalOpen: false })}
                            className="btn-action-outline !py-2 !px-4 !text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={state.addSubmitting}
                            onClick={handleAddContactSubmit}
                            className="btn-action-solid !py-2 !px-4 !text-xs disabled:opacity-50"
                        >
                            {state.addSubmitting ? 'Saving...' : 'Add to Counselling Queue'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* FULL STUDENT PROFILE DRAWER (Reusing existing StudentDetailsModal component) */}
            {/* ========================================================================= */}
            {state.isProfileDrawerOpen && state.profileDrawerContact && (
                <StudentDetailsModal
                    isOpen={state.isProfileDrawerOpen}
                    contact={state.profileDrawerContact}
                    onClose={() => setState({ isProfileDrawerOpen: false, profileDrawerContact: null })}
                    onLogCall={() => { }}
                    onWhatsApp={() => { }}
                />
            )}
        </div>
    );
}
