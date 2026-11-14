import React, { useState } from 'react';
import { Phone, X, Calendar, Clock, Send, GraduationCap, Check } from 'lucide-react';
import { AdmissionContact } from './AdmissionsContactsTable';

export interface LogCallModalProps {
    contact: AdmissionContact | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveCall?: (callData: any) => void;
}

const outcomeActions: Record<string, string> = {
    Interested: 'Save admission interest & follow-up',
    'Call Later': 'Schedule callback at student requested time',
    'No Answer': 'Retry call in afternoon slot',
    Busy: 'Schedule callback in evening slot',
    'Not Interested': 'Archive enquiry & update pipeline',
    'Wrong Number': 'Flag number for verification with master lead list',
    'Counselling Needed': 'Escalate to Senior Academic Counsellor',
};

const LogCallModal: React.FC<LogCallModalProps> = ({
    contact,
    isOpen,
    onClose,
    onSaveCall,
}) => {
    if (!isOpen || !contact) return null;

    const [outcome, setOutcome] = useState('Interested');
    const [notes, setNotes] = useState(
        'Student enquired about B.Tech CSE fee concessions and AI lab facilities. Parents willing to visit campus this Saturday.'
    );
    const [scheduleFollowUp, setScheduleFollowUp] = useState(true);
    const [callbackDate, setCallbackDate] = useState('2026-05-08');
    const [callbackTime, setCallbackTime] = useState('11:00 AM');
    const [referCounsellor, setReferCounsellor] = useState(true);
    const [priority, setPriority] = useState<'Medium' | 'High' | 'Urgent'>('High');
    const [referralReason, setReferralReason] = useState(
        'Student waiting for 12th PCM results. Father enquired about 50% merit scholarship cutoff.'
    );

    const outcomes = [
        'Interested',
        'Call Later',
        'No Answer',
        'Busy',
        'Not Interested',
        'Wrong Number',
        'Counselling Needed',
    ];

    const handleSave = () => {
        const payload = {
            contactId: contact.id,
            outcome,
            notes,
            scheduleFollowUp,
            callbackDate: scheduleFollowUp ? callbackDate : null,
            callbackTime: scheduleFollowUp ? callbackTime : null,
            referCounsellor,
            priority: referCounsellor ? priority : null,
            referralReason: referCounsellor ? referralReason : null,
        };
        if (onSaveCall) {
            onSaveCall(payload);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 my-8">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Call Update: {contact.student_name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {contact.phone_number} · {contact.city} · {contact.target_course}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
                    {/* Call Outcome */}
                    <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Call Outcome <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {outcomes.map((item) => {
                                const isSelected = outcome === item;
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setOutcome(item)}
                                        className={`rounded-xl border py-2 px-3 text-xs font-semibold transition text-center ${
                                            isSelected
                                                ? 'border-[#39854a] bg-[#39854a] text-white shadow-sm font-bold'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Action Banner */}
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-gray-800/50 text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Next Action:</span>
                        <span className="font-bold text-[#39854a]">
                            {outcomeActions[outcome] || 'Follow-up as required'}
                        </span>
                    </div>

                    {/* Call Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                            Call Notes / Student Feedback <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Student enquired about B.Tech CSE fee concessions and hostel facilities. Parents willing to visit campus this Saturday."
                            className="w-full rounded-xl border border-gray-200 p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {/* Follow-up Section */}
                    <div className="rounded-xl border border-gray-200 p-3.5 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-900 dark:text-white">
                                <input
                                    type="checkbox"
                                    checked={scheduleFollowUp}
                                    onChange={(e) => setScheduleFollowUp(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                />
                                <span>Schedule Next Follow-up Callback</span>
                            </label>
                            {scheduleFollowUp && (
                                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#39854a] dark:bg-green-950/40">
                                    Callback Required
                                </span>
                            )}
                        </div>

                        {scheduleFollowUp && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Callback Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={callbackDate}
                                            onChange={(e) => setCallbackDate(e.target.value)}
                                            placeholder="DD/MM/YYYY"
                                            className="w-full rounded-xl border border-gray-200 py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Callback Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={callbackTime}
                                            onChange={(e) => setCallbackTime(e.target.value)}
                                            placeholder="HH:MM AM/PM"
                                            className="w-full rounded-xl border border-gray-200 py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <Clock className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Refer to Senior Counsellor Section */}
                    <div className="rounded-xl border border-gray-200 p-3.5 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-900 dark:text-white">
                                <input
                                    type="checkbox"
                                    checked={referCounsellor}
                                    onChange={(e) => setReferCounsellor(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                />
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4 text-[#39854a]" />
                                    Refer to Senior Academic Counsellor
                                </span>
                            </label>
                            {referCounsellor && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40">
                                    Escalation
                                </span>
                            )}
                        </div>

                        {referCounsellor && (
                            <div className="space-y-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                        Referral Priority
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {(['Medium', 'High', 'Urgent'] as const).map((p) => {
                                            const isSelected = priority === p;
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPriority(p)}
                                                    className={`rounded-lg px-3 py-1 text-xs font-semibold border transition ${
                                                        isSelected
                                                            ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900 font-bold'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Specific Reason for Referral
                                    </label>
                                    <input
                                        type="text"
                                        value={referralReason}
                                        onChange={(e) => setReferralReason(e.target.value)}
                                        placeholder="e.g. Student enquired about 50% merit scholarship cutoff..."
                                        className="w-full rounded-xl border border-gray-200 py-1.5 px-3 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121e32]/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn-action-solid flex items-center gap-1.5 px-4 py-2 text-xs"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span>Save Call & Update CRM</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogCallModal;

