import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { UserPlus, CloudUpload, Users, X, Check, ArrowLeft } from 'lucide-react';
import AdmissionsContactsTable from '@/components/KAHE/AdmissionsContactsTable';

const TeamContactsPage = () => {
    const router = useRouter();
    const [isOpenAddContact, setIsOpenAddContact] = useState(false);

    // Form state for new contact
    const [formData, setFormData] = useState({
        student_name: '',
        phone_number: '',
        parent_phone: '',
        city: 'Coimbatore',
        area: '',
        qualification: '12th Standard',
        target_course: 'Computer Science & Engineering',
        institution: 'KAHE',
        assigned_to: 'P. Malathi',
    });

    const handleAddContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Contact "${formData.student_name}" created successfully!`);
        setIsOpenAddContact(false);
        setFormData({
            student_name: '',
            phone_number: '',
            parent_phone: '',
            city: 'Coimbatore',
            area: '',
            qualification: '12th Standard',
            target_course: 'Computer Science & Engineering',
            institution: 'KAHE',
            assigned_to: 'P. Malathi',
        });
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen">
            <Head>
                <title>Team Contacts Directory - KAHE CRM</title>
            </Head>

            {/* ============================================================== */}
            {/* PAGE HEADER: TITLE, SUBTITLE & ACTION BUTTONS */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Team Contacts Directory
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Displaying enquiry contacts assigned across Telecalling & Counselling teams for Academic Year 2026–27
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* + Add Contact Button (Solid Karpagam Green) */}
                    <button
                        type="button"
                        onClick={() => setIsOpenAddContact(true)}
                        className="btn-action-solid flex items-center gap-2"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Contact</span>
                    </button>

                    {/* Import Contacts Button (Outline with Green Icon) */}
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/bulk_import')}
                        className="btn-action-outline flex items-center gap-2"
                    >
                        <CloudUpload className="h-4 w-4 text-[#39854a]" />
                        <span>Import Contacts</span>
                    </button>

                    {/* Assign Contacts Button (Soft Green Tint) */}
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/assign_contact')}
                        className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/50 px-4 py-2.5 text-xs font-bold text-[#39854a] shadow-sm transition hover:bg-green-100 sm:text-sm dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400"
                    >
                        <Users className="h-4 w-4 text-[#39854a]" />
                        <span>Assign Contacts</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* TABLE & FILTER COMPONENT WITH ROLE & DEPENDENT USER DROPDOWNS */}
            {/* ============================================================== */}
            <AdmissionsContactsTable
                activeCategory="all"
                categoryTitle="Team Contacts"
                showRoleFilter={true}
                showCardFilterTag={false}
            />

            {/* ============================================================== */}
            {/* ADD CONTACT MODAL */}
            {/* ============================================================== */}
            {isOpenAddContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setIsOpenAddContact(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Add New Enquiry Contact
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Academic Year 2026–27 · Karpagam Group
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAddContactSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Student Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.student_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, student_name: e.target.value })
                                    }
                                    placeholder="e.g. K. Vignesh"
                                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Student Mobile *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone_number}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone_number: e.target.value })
                                        }
                                        placeholder="+91 98421 98210"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Parent Mobile
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.parent_phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, parent_phone: e.target.value })
                                        }
                                        placeholder="+91 98421 44552"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        City / District *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={(e) =>
                                            setFormData({ ...formData, city: e.target.value })
                                        }
                                        placeholder="Coimbatore"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Area / Locality
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.area}
                                        onChange={(e) =>
                                            setFormData({ ...formData, area: e.target.value })
                                        }
                                        placeholder="Gandhipuram"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Target Course & Specialization *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.target_course}
                                    onChange={(e) =>
                                        setFormData({ ...formData, target_course: e.target.value })
                                    }
                                    placeholder="Computer Science & Engineering"
                                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Institution
                                    </label>
                                    <select
                                        value={formData.institution}
                                        onChange={(e) =>
                                            setFormData({ ...formData, institution: e.target.value })
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="KAHE">KAHE</option>
                                        <option value="KCE">KCE</option>
                                        <option value="KIT">KIT</option>
                                        <option value="Karpagam College of Pharmacy">Karpagam College of Pharmacy</option>
                                        <option value="Karpagam Nursing College">Karpagam Nursing College</option>
                                        <option value="Karpagam Faculty of Medical Sciences">Karpagam Faculty of Medical Sciences</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Assigned Telecaller
                                    </label>
                                    <select
                                        value={formData.assigned_to}
                                        onChange={(e) =>
                                            setFormData({ ...formData, assigned_to: e.target.value })
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="P. Malathi">P. Malathi</option>
                                        <option value="S. Ramesh Kumar">S. Ramesh Kumar</option>
                                        <option value="K. Kavitha">K. Kavitha</option>
                                        <option value="Unassigned">Unassigned</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsOpenAddContact(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-action-solid px-4 py-2 text-xs font-bold"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamContactsPage;
