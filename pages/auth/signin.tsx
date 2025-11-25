import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleLocale, toggleRTL } from '../../store/themeConfigSlice';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';

import IconMail from '@/components/Icon/IconMail';
import IconLockDots from '@/components/Icon/IconLockDots';

import * as Yup from 'yup';
import { Failure, Success, useSetState } from '@/utils/functions.utils';
import Models from '@/imports/models.import';
import IconLoader from '@/components/Icon/IconLoader';
import IconEye from '@/components/Icon/IconEye';
import axios from 'axios';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login'));
    });
    const router = useRouter();

    const [state, setState] = useSetState({
        data: [],
        loading: false,
        error: {},
        email: '',
        password: '',
        showPassword: false,
    });

    // const submitForm = async (e) => {
    //     try {
    //         e.preventDefault();

    //         setState({ loading: true });
    //         if (state.email == '' && state.password == '') {
    //             Failure('Enter valid email and password');
    //             setState({ loading: false });
    //         } else {
    //             const body = {
    //                 email: state.email,
    //                 password: state.password,
    //             };
    //             await validationSchema.validate(body, { abortEarly: false });
    //             const res: any = await Models.auth.login(body);
    //             localStorage.setItem('crmToken', res.access);
    //             localStorage.setItem('refreshToken', res.refresh);

    //             localStorage.setItem('crmUser', JSON.stringify(res.user));
    //             setState({ loading: false, error: {} });
    //             router.replace('/dashboards');
    //             Success('Login Sucessfully');
    //         }
    //     } catch (error) {
    //         console.log('error: ', error);
    //         Failure(error);
    //         setState({ loading: false });
    //     }
    // };
    const submitForm = (e) => {

        e.preventDefault();
        setState({ loading: true });
        if (state.email == '' && state.password == '') {
            Failure('Enter valid email and password');
            setState({ loading: false });
        } else {
            const body = {
                email: state.email.trim(),
                password: state.password.trim(),
            };

            axios
                .post(`${process.env.NEXT_PUBLIC_BASE_URL}login/`, body)
                .then((res) => {
                    console.log("first",res)
                    localStorage.setItem('crmToken', res.data.access);
                    localStorage.setItem('refreshToken', res.data.refresh);
                    localStorage.setItem('crmUser', JSON.stringify(res.data.user));
                    setState({ loading: false, error: {}, email: '', password: '' });
                    router.replace('/dashboards');
                    Success('Login Sucessfully');
                })
                .catch((error) => {
                    console.log('error: ', error);
                    if (error?.response?.status == 401) {
                        Failure(error.response.data.error);
                    } else {
                        Failure(error.response);
                    }
                    // Failure(error);
                    setState({ loading: false });
                });
        }
    };
    const handleChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 px-6 py-20 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px]">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Email"
                                            name="email"
                                            type="text"
                                            placeholder="Enter Email"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={state.email}
                                            onChange={handleChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                    {state.error.email && <div className="mt-1 text-sm text-red-500">{state.error.email}</div>}
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Password"
                                            type={state.showPassword ? 'text' : 'password'}
                                            placeholder="Enter Password"
                                            className="form-input pe-10 ps-10 placeholder:text-white-dark"
                                            value={state.password}
                                            name="password"
                                            onChange={handleChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                        <button type="button" className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setState({ showPassword: !state.showPassword })}>
                                            {!state.showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path
                                                        d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2711M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d="M14 14.2362C13.4692 14.7112 12.7684 15.0000 12 15.0000C10.3431 15.0000 9 13.6569 9 12.0000C9 11.1573 9.33193 10.3931 9.86932 9.8427"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <IconEye />
                                            )}
                                        </button>
                                    </div>
                                    {state.error.password && <div className="mt-1 text-sm text-red-500">{state.error.password}</div>}
                                </div>
                                {/* <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                                        <span className="text-white-dark">Subscribe to weekly newsletter</span>
                                    </label>
                                </div> */}
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 p-2 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    {state.loading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Sign in'}
                                </button>
                            </form>
                            {/* <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div> */}
                            {/* <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5 text-white">
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconInstagram />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconFacebookCircle />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconTwitter fill={true} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconGoogle />
                                        </Link>
                                    </li>
                                </ul>
                            </div> */}
                            {/* <div className="text-center dark:text-white">
                                Don't have an account ?&nbsp;
                                <Link href="/auth/signup" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN UP
                                </Link>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
LoginBoxed.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};
export default LoginBoxed;
