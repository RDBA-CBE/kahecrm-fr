import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';
import IconLoader from '@/components/Icon/IconLoader';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import { ROLE } from '@/utils/constant.utils';
import Models from '@/imports/models.import';
import { loginValidation } from '@/utils/validation.utils';

interface PortalConfig {
    id: 'admin' | 'telecaller' | 'counsellor';
    title: string;
    subtitle: string;
    staffName: string;
    staffEmail: string;
    initials: string;
    contactsCount: string;
}

const PORTALS: PortalConfig[] = [
    {
        id: 'admin',
        title: 'Admin',
        subtitle: 'All Enquiries',
        staffName: 'Prof. R. Natarajan',
        staffEmail: 'admissions.director@karpagam.edu.in',
        initials: 'PR',
        contactsCount: '0 contacts',
    },
    {
        id: 'telecaller',
        title: 'Telecaller',
        subtitle: 'Personal Desk',
        staffName: 'Telecaller Executive',
        staffEmail: 'telecaller@karpagam.edu.in',
        initials: 'TE',
        contactsCount: '0 contacts',
    },
    {
        id: 'counsellor',
        title: 'Counsellor',
        subtitle: 'Academic Desk',
        staffName: 'Academic Counsellor',
        staffEmail: 'counsellor@karpagam.edu.in',
        initials: 'AC',
        contactsCount: '0 contacts',
    },
];

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const [state, setState] = useSetState({
        loading: false,
        error: {},
        email: '',
        password: '',
        showPassword: false,
        portal: 'admin',
        rememberSession: true,
    });

    useEffect(() => {
        dispatch(setPageTitle('Login - Karpagam Institutions'));
        const savedEmail = localStorage.getItem('crmRememberedEmail');
        if (savedEmail) {
            setState({ email: savedEmail });
        }
    }, [dispatch]);

    const activePortal = PORTALS.find((p) => p.id === state.portal) || PORTALS[0];

    const handleSelectPortal = (portalId: 'admin' | 'telecaller' | 'counsellor') => {
        const portal = PORTALS.find((p) => p.id === portalId);
        setState({
            portal: portalId,
            ...(portal ? { email: portal.staffEmail } : {}),
        });
    };

    const handleSelectStaff = (email: string) => {
        setState({ email });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            [e.target.name]: e.target.value,
            error: { ...state.error, [e.target.name]: '' },
        });
    };

    const submitForm = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setState({ loading: true, error: {} });

            const trimmedEmail = (state.email || '').trim();
            const trimmedPassword = (state.password || '').trim();

            const body = {
                email: trimmedEmail,
                password: trimmedPassword,
            };

            await loginValidation.validate(body, { abortEarly: false });

            const res: any = await Models.auth.login(body);

            const token = res?.access || res?.data?.access;
            const refreshToken = res?.refresh || res?.data?.refresh;
            const user = res?.user || res?.data?.user;

            if (token) {
                localStorage.setItem('kaheToken', token);
            }
            if (refreshToken) {
                localStorage.setItem('kaheRefreshToken', refreshToken);
            }
            if (user) {
                localStorage.setItem('crmUser', JSON.stringify(user));
            }

            if (state.rememberSession) {
                localStorage.setItem('crmRememberedEmail', trimmedEmail);
            } else {
                localStorage.removeItem('crmRememberedEmail');
            }

            setState({ loading: false, error: {} });

            if (user?.group === ROLE.ADMIN) {
                router.replace('/own_dashboard');
            } else {
                router.replace('/dashboard');
            }
            Success('Login Successfully');
        } catch (error: any) {
            console.error('Login error:', error);
            if (error?.inner && Array.isArray(error.inner)) {
                const validationErrors: Record<string, string> = {};
                error.inner.forEach((err: any) => {
                    if (err.path) {
                        validationErrors[err.path] = err.message;
                    }
                });
                setState({ error: validationErrors, loading: false });
                if (error.inner[0]?.message) {
                    Failure(capitalizeFLetter(error.inner[0].message));
                }
            } else {
                if (error?.response?.data?.detail) {
                    Failure(capitalizeFLetter(error.response.data.detail));
                } else if (error?.response?.data?.error) {
                    Failure(capitalizeFLetter(error.response.data.error));
                } else if (typeof error === 'string') {
                    Failure(capitalizeFLetter(error));
                } else if (error?.message) {
                    Failure(error.message);
                } else {
                    Failure('Authentication failed. Please verify credentials.');
                }
                setState({ loading: false });
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-white text-gray-800 antialiased flex flex-col justify-center items-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-[480px] flex flex-col items-center">
                {/* Logo Container */}



                {/* Form Card */}
                <div className="w-full flex items-center justify-center flex-col rounded-2xl border border-gray-200/90 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-7">

                    <div className="mb-4 flex h-[130px] w-[330px] items-center justify-center  p-3">
                        {/* LOGO: You can update the src attribute to your custom logo image */}
                        <img
                            src="/assets/images/logo.png"
                            alt="Karpagam Institutions Logo"
                            className="max-h-full max-w-full object-contain"
                            onError={(e: any) => {
                                // Fallback in case custom logo isn't at the path
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                            }}
                        />

                    </div>
                    <form onSubmit={submitForm} className="space-y-4 w-full">
                        {/* Access Portal Selector */}


                        {/* Select Staff Account */}


                        {/* Institutional Email ID */}
                        <div>
                            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                                Email ID
                            </label>
                            <div className={`flex items-center rounded-lg border bg-white px-3 py-2.5 transition focus-within:border-[#39854a] focus-within:ring-1 focus-within:ring-[#39854a] ${state.error?.email ? 'border-red-500' : 'border-gray-200'}`}>
                                <span className="mr-2.5 shrink-0 text-gray-400">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder="Enter your email"
                                    className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none border-0 p-0 focus:ring-0"
                                    value={state.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {state.error?.email && <div className="mt-1 text-xs font-medium text-red-500">{state.error.email}</div>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setState({ showPassword: !state.showPassword })}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#39854a] hover:text-[#2f6f3e] transition cursor-pointer select-none"
                                >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {state.showPassword ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </>
                                        ) : (
                                            <>
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            </>
                                        )}
                                    </svg>
                                    <span>{state.showPassword ? 'Hide' : 'Show'}</span>
                                </button>
                            </div>
                            <div className={`flex items-center rounded-lg border bg-white px-3 py-2.5 transition focus-within:border-[#39854a] focus-within:ring-1 focus-within:ring-[#39854a] ${state.error?.password ? 'border-red-500' : 'border-gray-200'}`}>
                                <span className="mr-2.5 shrink-0 text-gray-400">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={state.showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none border-0 p-0 focus:ring-0"
                                    value={state.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {state.error?.password && <div className="mt-1 text-xs font-medium text-red-500">{state.error.password}</div>}
                        </div>

                        {/* Remember session & Support */}
                        <div className="flex items-center justify-end pt-1">
                            {/* <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={state.rememberSession}
                                    onChange={(e) => setState({ rememberSession: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-[#39854a] focus:ring-[#39854a] accent-[#39854a]"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Remember session</span>
                            </label> */}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert('For portal access or password reset support, please contact Kahe IT Helpdesk.');
                                }}
                                className="text-xs sm:text-sm font-semibold text-[#39854a] hover:underline"
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={state.loading}
                                className="btn-brand w-full !rounded-xl !py-3 text-lg font-bold tracking-wide text-white transition-all shadow-[0_4px_14px_rgba(57,133,74,0.35)] hover:shadow-[0_6px_20px_rgba(57,133,74,0.45)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {state.loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <IconLoader className="h-4 w-4 animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign in
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>


                </div>
            </div>
        </div>
    );
};

LoginBoxed.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default LoginBoxed;
