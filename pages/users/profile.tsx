import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useEffect, useState } from 'react';

import { Mail, Phone, CheckCircle, Clock, MapPin, Droplets, Calendar, Target, TrendingUp, TrendingDown, Loader, Edit } from 'lucide-react';
import Models from '@/imports/models.import';
import { useRouter } from 'next/router';
import { formatDate, Success, useSetState } from '../../utils/functions.utils';
import IconUser from '@/components/Icon/IconUser';
import Modal from '@/common_component/modal';
import TextInput from '@/components/TextInput';
import IconLoader from '@/components/Icon/IconLoader';
import TextArea from '@/components/TextArea';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const Profile = () => {
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('Performance');

    const [state, setState] = useSetState({
        loading: false,
        userDetail: null,
        targetData: null,
        isOpen: false,
    });

    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    });

    useEffect(() => {
        getUserDetails(true);
    }, []);

    const getUserDetails = async (loading = false) => {
        try {
            if (loading) {
                setState({ loading: true });
            }
            const res: any = await Models.auth.userDetails();
            const target: any = await Models.report.adminCardData(null);
            const find = target?.find((item) => item?.type == 'currentMonth');
            setState({
                first_name: res?.first_name,
                last_name: res?.last_name,
                email: res.email,
                location: res.address,
                phone_number:`+91 ${res.phone_number}`,
                userDetail: res,
                targetData: find,
                loading: false,
                userId: res?.id,
            });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const updateProfile = async () => {
        try {
            setState({ submitLoad: true });
            const body = {
                first_name: state.first_name,
                last_name: state.last_name,
                email: state.email,
                address: state.location,
                  phone_number: state.phone_number?.replace("+91", "")
            };

            const res = await Models.auth.update(body, state.userId);
            getUserDetails(false);
            Success("Profile updated successfully")

            setState({ isOpen: false, submitLoad: false });
        } catch (error) {
            setState({ isOpen: false, submitLoad: false });

            console.log('✌️error --->', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(parseFloat(amount || 0));
    };

    const getGenderIcon = (gender) => {
        return gender === 'F' ? '♀' : gender === 'M' ? '♂' : '⚧';
    };

    const handlePhoneChange = (value) => {
        const valid = value && isValidPhoneNumber(value);
        if (valid == false) {
            setState({
                errors: { ...state.errors, phone_number: 'Please enter a valid phone number' },
                phone_number: value,
            });
        } else {
            setState({
                errors: { ...state.errors, phone_number: '' },
                phone_number: value,
            });
        }
    };

    if (state.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <Loader className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!state.userDetail) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">No user data found</p>
                </div>
            </div>
        );
    }

    const user = state.userDetail;
    const target = state.targetData;

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="container mx-auto p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 xl:gap-6">
                    <div className="lg:col-span-1">
                        <div className="panel rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:p-6">
                            <button
                                className="absolute right-4 top-4 rounded-lg bg-gray-100 p-2 text-gray-400 transition-all hover:text-blue-600"
                                onClick={() => {
                                    setState({ isOpen: true });
                                }}
                            >
                                <Edit className="h-5 w-5" />
                            </button>
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4 sm:mb-5">
                                    <IconUser className="h-20 w-20 rounded-full bg-gray-200 p-2 sm:h-24 sm:w-24 md:h-28 md:w-28" />
                                    <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white sm:-bottom-2 sm:-right-2">
                                        {getGenderIcon(user?.gender)}
                                    </div>
                                </div>

                                <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
                                    {user?.first_name} {user?.last_name}
                                </h2>
                                <p className="mb-2 text-center text-base font-semibold text-blue-600 sm:text-lg">{user?.designation}</p>

                                <div className="w-full space-y-3 border-t pt-4 text-sm text-gray-700">
                                    {user.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                                            <span className="truncate text-sm font-medium">{user?.email}</span>
                                        </div>
                                    )}

                                    {user.phone_number && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                                            <span className="text-sm font-medium">{user?.phone_number}</span>
                                        </div>
                                    )}

                                    {user.joined_on && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                                            <span className="text-sm font-medium">{formatDate(user?.joined_on)}</span>
                                        </div>
                                    )}

                                    {user.blood_group && (
                                        <div className="flex items-center gap-3">
                                            <Droplets className="h-4 w-4 flex-shrink-0 text-red-500 sm:h-5 sm:w-5" />
                                            <span className="text-sm font-medium">Blood Group: {user?.blood_group}</span>
                                        </div>
                                    )}

                                    {user.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500 sm:h-5 sm:w-5" />
                                            <span className="text-xs font-medium sm:text-sm">{user?.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
                                <div className="flex flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50 p-3 transition hover:bg-blue-100 sm:p-4">
                                    <Target className="mb-1 h-5 w-5 text-blue-600 sm:mb-2 sm:h-6 sm:w-6" />
                                    <p className="text-md sm:text-md font-bold">{target ? formatCurrency(target?.target) : '₹0'}</p>
                                    <p className="mt-1 text-center text-sm leading-tight text-gray-600">Monthly Target</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl border border-green-100 bg-green-50 p-3 transition hover:bg-green-100 sm:p-4">
                                    <CheckCircle className="mb-1 h-5 w-5 text-green-600 sm:mb-2 sm:h-6 sm:w-6" />
                                    <p className="text-md sm:text-md font-bold">{target ? formatCurrency(target?.achieved) : '₹0'}</p>
                                    <p className="mt-1 text-xs text-gray-600">Achieved</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl border border-purple-100 bg-purple-50 p-3 transition hover:bg-purple-100 sm:p-4">
                                    <TrendingUp className="mb-1 h-5 w-5 text-purple-600 sm:mb-2 sm:h-6 sm:w-6" />
                                    <p className="text-md sm:text-md font-bold">{target ? target?.percentage : 0}%</p>
                                    <p className="mt-1 text-xs text-gray-600">Completion</p>
                                </div>
                                <div
                                    className={`flex flex-col items-center justify-center rounded-xl border p-3 transition sm:p-4 ${
                                        target?.increase ? 'border-green-100 bg-green-50 hover:bg-green-100' : 'border-red-100 bg-red-50 hover:bg-red-100'
                                    }`}
                                >
                                    {target?.increase ? (
                                        <TrendingUp className="mb-1 h-5 w-5 text-green-600 sm:mb-2 sm:h-6 sm:w-6" />
                                    ) : (
                                        <TrendingDown className="mb-1 h-5 w-5 text-red-600 sm:mb-2 sm:h-6 sm:w-6" />
                                    )}
                                    <p className="sm:text-md text-lg font-bold">{target?.increase ? '↑' : '↓'}</p>
                                    <p className="mt-1 text-xs text-gray-600">Trend</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="panel rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:p-6">
                            <div className="mb-4 border-b border-gray-200 sm:mb-6">
                                <div className="flex space-x-4 overflow-x-auto pb-1 text-sm font-semibold sm:space-x-8 sm:text-base">
                                    {['Performance', 'Details', 'Activity'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`whitespace-nowrap pb-3 transition duration-150 ease-in-out ${
                                                activeTab === tab ? 'border-b-2 border-blue-600 text-blue-700 sm:border-b-4' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <h2 className="mb-4 text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl">{activeTab}</h2>

                            {activeTab === 'Performance' && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                        <h3 className="mb-3 text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">Monthly Target Progress</h3>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex flex-col justify-between gap-2 text-sm sm:flex-row sm:gap-0">
                                                <span className="font-medium">Target: {target ? formatCurrency(target?.target) : '₹0'}</span>
                                                <span className="font-medium">Achieved: {target ? formatCurrency(target?.achieved) : '₹0'}</span>
                                            </div>
                                            <div className="h-3 w-full rounded-full bg-gray-200 sm:h-4">
                                                <div className="h-3 rounded-full bg-blue-600 transition-all duration-500 sm:h-4" style={{ width: `${Math.min(target?.percentage || 0, 100)}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 sm:text-sm">
                                                <span>Completion</span>
                                                <span>{target ? target.percentage : 0}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className={`rounded-full p-1.5 sm:p-2 ${target?.increase ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {target?.increase ? (
                                                        <TrendingUp className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 sm:text-sm">Performance Trend</p>
                                                    <p className="text-base font-bold sm:text-lg">{target?.increase ? 'Increasing' : 'Decreasing'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="rounded-full bg-blue-100 p-1.5 sm:p-2">
                                                    <Target className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 sm:text-sm">Remaining Target</p>
                                                    <p className="text-base font-bold sm:text-lg">{target ? formatCurrency(parseFloat(target.target) - parseFloat(target.achieved)) : '₹0'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Details' && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        <h3 className="text-base font-bold text-gray-900 sm:text-lg">Personal Information</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Username:</span>
                                                <span className="text-sm font-semibold sm:text-base">@{user.username}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Employee ID:</span>
                                                <span className="text-sm font-semibold sm:text-base">#{user.id}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Gender:</span>
                                                <span className="text-sm font-semibold sm:text-base">{user.gender === 'F' ? 'Female' : user.gender === 'M' ? 'Male' : 'Other'}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Blood Group:</span>
                                                <span className="text-sm font-semibold sm:text-base">{user.blood_group}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        <h3 className="text-base font-bold text-gray-900 sm:text-lg">Professional Information</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Designation:</span>
                                                <span className="text-sm font-semibold sm:text-base">{user.designation}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Department:</span>
                                                <span className="text-sm font-semibold sm:text-base">{user.department}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Join Date:</span>
                                                <span className="text-sm font-semibold sm:text-base">{formatDate(user.joined_on)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-gray-600 sm:text-base">Status:</span>
                                                <span className="text-sm font-semibold sm:text-base">
                                                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500 sm:mr-2"></span>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Activity' && (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                        <h3 className="mb-3 text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">Recent Performance</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                                                <span className="text-sm font-medium sm:text-base">Current Month Target</span>
                                                <span className="text-sm font-bold text-blue-600 sm:text-base">{target ? formatCurrency(target.target) : '₹0'}</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                                <span className="text-sm font-medium sm:text-base">Amount Achieved</span>
                                                <span className="text-sm font-bold text-green-600 sm:text-base">{target ? formatCurrency(target.achieved) : '₹0'}</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                                                <span className="text-sm font-medium sm:text-base">Completion Rate</span>
                                                <span className="text-sm font-bold text-purple-600 sm:text-base">{target ? target.percentage : 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={state.isOpen}
                addHeader={'Update Profile'}
                close={() => setState({ isOpen: false, stage: '', errors: {} })}
                renderComponent={() => (
                    <div className="flex flex-col gap-3 p-5">
                        <TextInput title={'First Name'} placeholder={'First Name'} value={state.first_name} onChange={(e) => setState({ first_name: e })} error={state.errors?.first_name}  />

                        <TextInput title={'Last Name'} placeholder={'Last Name'} value={state.last_name} onChange={(e) => setState({ last_name: e })} error={state.errors?.last_name}  />

                        <TextInput title={'Email'} placeholder={'Email'} value={state.email} onChange={(e) => setState({ email: e })} error={state.errors?.email}  />
                        
                        <div>
                        <label className="block text-sm font-bold text-gray-700">
                            Phone Number
                        </label>

                        <PhoneInput
                            withCountryCallingCode
                            countryCallingCodeEditable={false}
                            countrySelectComponent={() => null}
                            country={'IN'}
                            defaultCountry={'IN'}
                            value={state.phone_number}
                            onChange={handlePhoneChange}
                            international
                            className="phone-input-custom"
                        />
                        {state.errors?.phone && <div style={{ color: 'red' }}>{state.errors?.phone}</div>}

                        </div>
                        
                      
                        <TextInput title={'Location'} placeholder={'Location'} value={state.location} onChange={(e) => setState({ location: e })} />

                        <div className="mt-8 flex items-center justify-end ">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, stage: '', errors: {} })}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                onClick={() => {
                                    updateProfile();
                                }}
                            >
                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Update'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default Profile;
