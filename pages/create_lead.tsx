import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import { useRouter } from 'next/router';
import IconUser from '@/components/Icon/IconUser';
import { Dropdown, Failure, Success, objIsEmpty, useSetState } from '@/utils/functions.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import Models from '@/imports/models.import';
import CommonLoader from './elements/commonLoader';
import IconLoader from '@/components/Icon/IconLoader';
import { PrivateRouter, Validation } from '@/utils/imports.utils';
import * as Yup from 'yup';
import Breadcrumb from '@/common_component/breadcrumb';
import TextArea from '@/components/TextArea';
import { LEADTYPE } from '@/utils/constant.utils';
import moment from 'moment';

const CreateLead = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Create Lead'));
    });

    const router = useRouter();

    const [state, setState] = useSetState({
        loading: false,
        name: '',
        focus_segment: null,
        lead_owner: '',
        country: null,
        state: null,
        company_number: '',
        company_email: '',
        company_website: '',
        fax: '',
        annual_revenue: '',
        tags: [],
        market_segment: '',
        is_active: false,
        focusSegmentList: [],
        marketSegmentList: [],
        countryList: [],
        tagList: [],
        ownerList: [],
        stateList: [],
        createdByList: [],
        stateLoading: false,
        submitLoad: false,
        errors: null,
        created_by: null,
        verticalList: [],
        vertical: '',
        isOpenTask: false,
        isOpen: false,
        source_from: null,
        assignList: [],
        sourceList: [],
        sourceFromList: [],
        leadTypeList: [],
        leadManagerList: [],
        contactPage: 1,
    });

    useEffect(() => {
        verticalList();
        getMarketSegmentList();
        countryList();
        tagList();
        getOpportunityList();
        leadManagerList();
        sourceList();
        departmentList();
        statusList();
        contactStatusList();
        contactList(state.contactPage);
    }, []);

    useEffect(() => {
        if (state.assignRole) {
            if (state.assignRole?.value == 'owner') {
                ownerList();
            } else if (state.assignRole?.value == 'bdm') {
                bdmList();
            } else {
                bdeList();
            }
        }
    }, [state.assignRole]);

    const getFocusSegmentList = async (verticalData: any) => {
        try {
            const res: any = await Models.lead.focusSegmentList(verticalData?.value);

            let focusList: [];

            if (res?.results?.length > 0) {
                focusList = res?.results?.map((item) => ({ value: item?.id, label: item?.focus_segment }));
            }

            setState({ focusSegmentList: focusList });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const leadManagerList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.leadManager();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ leadManagerList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getMarketSegmentList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.GetDropdown('market_segments');
            const dropdownList = Dropdown(res.results, 'market_segment');
            setState({ marketSegmentList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const sourceList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.sourceList();
            const dropdownList = Dropdown(res.results, 'source');
            setState({ sourceList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const statusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.statusList();
            const dropdownList = Dropdown(res.results, 'name');
            setState({ statusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const contactStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.status();
            const dropdownList = Dropdown(res, 'status');
            setState({ contactStatusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const countryList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.GetDropdownThree('countries');
            const dropdownList = Dropdown(res?.results, 'country_name');
            setState({ countryList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const stateList = async (country) => {
        try {
            setState({ stateLoading: true });
            const res: any = await Models.lead.stateListOne(country?.value);
            const dropdownList = Dropdown(res.results, 'state_name');
            setState({ stateList: dropdownList, stateLoading: false });
        } catch (error) {
            setState({ stateLoading: false });

            console.log('error: ', error);
        }
    };

    const cityList = async (state) => {
        try {
            const res: any = await Models.lead.cityListOne(state?.value);
            const dropdownList = Dropdown(res?.results, 'city_name');
            setState({ cityList: dropdownList });
        } catch (error) {
            setState({ stateLoading: false });

            console.log('error: ', error);
        }
    };

    const tagList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.GetDropdown('tags');
            const dropdownList = Dropdown(res.results, 'tag');
            setState({ tagList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getOpportunityList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.GetDropdown('opportunity-name');
            const dropdownList = Dropdown(res.results, 'name');
            setState({ opportunityList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };
    const ownerList = async () => {
        try {
            const res: any = await Models.lead.ownerList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const bdmList = async () => {
        try {
            const res: any = await Models.lead.bdmList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const bdeList = async () => {
        try {
            const res: any = await Models.lead.bdeList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const departmentList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.departmentList();
            const dropdownList = Dropdown(res.results, 'department');
            setState({ departmentList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const contactList = async (page) => {
        const role: any = await Models.auth.userDetails();
        const res: any = await Models.contact.list(page, role?.id);
        const dropdownList = Dropdown(res.results, 'name');
        const filter = dropdownList?.filter((item) => item?.label !== null && item?.label !== '');
        setState({ contactList: dropdownList, hasMoreLead: res.next });
        try {
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const verticalList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.GetDropdownTwo('verticals');
            const dropdownList = Dropdown(res.results, 'vertical');
            setState({ verticalList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const contactLoadMore = async () => {
        try {
            if (state.hasMoreLead) {
                const role: any = await Models.auth.userDetails();
                const res: any = await Models.contact.list(state.contactPage + 1, role?.id);
                const newOptions = Dropdown(res?.results, 'name');
                const filters = newOptions?.filter((item) => item?.label !== null && item?.label !== '');
                setState({
                    contactList: [...state.contactList, ...filters],
                    hasMoreLead: res.next,
                    contactPage: state.contactPage + 1,
                });
            } else {
                setState({
                    leadList: state.leadList,
                });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleSelectedContact = async (contact) => {
        try {
            setState({ contact: contact });

            if (contact) {
                const res: any = await Models.contact.details(contact?.value);
                setState({
                    contact_name: res.name,
                    email_id: res.email_id,
                    phone_number: res.phone_number,
                    designation: res.designation,
                    department: !objIsEmpty(res.department) ? { value: res?.department?.id, label: res?.department?.department } : null,
                    lead_source: !objIsEmpty(res.lead_source) ? { value: res?.lead_source?.id, label: res?.lead_source?.source } : null,
                    source_from: res?.source_from,
                    contact_status: !objIsEmpty(res.status) ? { value: res.status.id, label: res.status.status } : null,
                    contact_remark: res?.remark,
                });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setState({ submitLoad: true });
            if (objIsEmpty(state.contact)) {
                Failure('Select a contact');
                setState({ submitLoad: false });
            } else {
                const user: any = await Models.auth.userDetails();

                let tags = [];
                if (state.tags?.length > 0) {
                    tags = state.tags?.map((item) => item.value);
                }

                const body = {
                    name: state.name,
                    // company_website: state.company_website,
                    // vertical: state.vertical?.value,
                    // focus_segment: state.focus_segment?.value,
                    address: state.address,
                    country: state.country?.value,
                    state: state.state?.value,
                    city: state.city?.value,
                    // annual_revenue: state.annual_revenue ? Number(state.annual_revenue) : null,
                    // market_segment: state.market_segment?.value,
                    lead_type: state.lead_type?.value,
                    // lead_owner: state.lead_owner?.value,
                    lead_owner: user?.id,
                    // tags: tags,
                    is_active: true,
                    // assigned_to: state.assigned_to?.value,
                    // status: state.status?.value,
                    // remark: state.remark,
                    opportunity_name: state.opportunity_name?.value,
                    contact_id: state.contact?.value,
                    //For contact
                    // contact_name: state.contact_name,
                    // email_id: state.email_id,
                    // designation: state.designation,
                    // department: state.department?.value,
                    // phone_number: state.phone_number,
                    // lead_source: state.lead_source?.value,
                    // source_from: state.source_from,
                    // contact_remark: state.contact_remark,
                    is_archive: false,
                    // contact_status: state.contact_status?.value,
                };

                const lead = {
                    name: state.name,
                    company_website: state.company_website,
                    vertical: state.vertical?.value,
                    focus_segment: state.focus_segment?.value,
                    address: state.address,
                    country: state.country?.value,
                    state: state.state?.value,
                    city: state.city?.value,
                    annual_revenue: state.annual_revenue ? Number(state.annual_revenue) : null,
                    market_segment: state.market_segment?.value,
                    lead_type: state.lead_type?.value,
                    // lead_owner: state.lead_owner?.value,
                    lead_owner: user?.id,
                    tags: tags,
                    opportunity_name: state.opportunity_name?.value,
                    // opportunity_keyword: state.opportunity_keyword,
                    is_active: true,
                    assigned_to: state.assigned_to?.value,
                    // lead_status: state.status?.value,
                    remark: state.remark,
                    contact_id: state.contact?.value,
                    status_date: moment(new Date()).format('YYYY-MM-DD'),
                };

                // const contacts = {
                //     name: state.contact_name,
                //     email_id: state.email_id,
                //     designation: state.designation,
                //     department: state.department?.value,
                //     phone_number: state.phone_number,
                //     lead_source: state.lead_source?.value,
                //     remark: state.contact_remark,
                //     is_archive: false,
                //     // lead: state.lead?.value,
                //     status: state.contact_status?.value,
                //     is_active: true,
                //     moveToLead: true,
                // };

                // console.log('contacts: ', contacts);

                await Validation.createLeadValidation.validate(body, { abortEarly: false });
                const res: any = await Models.lead.create(lead);
                // Success(res?.message);
                // router.replace(`/viewLead?id=${res?.data?.id}`);
                if (res?.id) {
                    updateContacts(res?.id);
                } else {
                    setState({ submitLoad: false });
                }
            }
        } catch (error) {
            console.log('✌️error --->', error);
            if (error?.message) {
                Failure(error?.message);
            } else {
                Failure(error);
            }
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ errors: validationErrors });
                setState({ submitLoad: false });
            } else {
                setState({ submitLoad: false });
            }
            setState({ submitLoad: false });
        }
    };

    const updateContacts = async (leadId) => {
        try {
            const body = {
                lead: leadId,
                name: state.contact_name?.trim(),
                email_id: state.email_id?.trim(),
                designation: state.designation?.trim(),
                department: state.department?.value,
                phone_number: state.phone_number?.trim(),
                lead_source: state.lead_source?.value,
                source_from: state.source_from?.trim(),
                remark: state.contact_remark?.trim(),
                is_archive: false,
                status: state.contact_status?.value,
                is_active: true,
                moveToLead: true,
            };

            await Models.contact.update(body, state.contact?.value);
            setState({ submitLoad: false });
            Success('Lead created successfully');
            router.replace('/leads');
        } catch (error) {
            setState({ submitLoad: false });

            console.log('error: ', error);
        }
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/leads' },
        { label: 'Create Lead', path: '' },
    ];

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="relative h-auto  overflow-scroll bg-[#dbe7ff] bg-cover p-2">
            <Breadcrumb items={breadcrumbItems} />

            <div className="panel  flex  flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-[50px] w-[50px] overflow-hidden bg-white" style={{ borderRadius: 50 }}>
                        <img src="/assets/images/profile-1.jpeg" height={'100%'} width={'100%'} />
                    </div>
                    <div>
                        <h5 className="font-semibold " style={{ fontSize: '18px' }}>
                            Create Lead
                        </h5>
                        <div className="  " style={{ fontSize: '14px', color: 'grey' }}>
                            Your data journey starts here...
                        </div>
                    </div>
                </div>
                <div className="flex  flex-wrap items-center gap-3">
                    <p>Assign To:</p>
                    <CustomSelect
                        value={state.assignRole}
                        onChange={(e) => setState({ assignRole: e, assigned_to: '', assignList: [] })}
                        placeholder={'Choose Role'}
                        options={[
                            { value: 'owner', label: 'Owner' },
                            { value: 'bdm', label: 'BDM' },
                            { value: 'bde', label: 'BDE' },
                        ]}
                        // required
                        className="lg:w-[200px]"
                    />
                    <CustomSelect
                        value={state.assigned_to}
                        onChange={(e) => setState({ assigned_to: e })}
                        placeholder={'Assign To'}
                        options={state.assignList}
                        error={state.errors?.assigned_to}
                        // required
                        className="lg:w-[200px]"
                    />

                    {/* <CustomSelect
                        value={state.status}
                        onChange={(e) => setState({ status: e })}
                        placeholder={'Status'}
                        options={state.statusList}
                        error={state.errors?.status}
                        required
                        className="lg:w-[200px]"
                    /> */}
                </div>
            </div>
            <div className="panel mt-2">
                <label>
                    Select Primary Contact<span className="pl-1 text-red-500">*</span>
                </label>
                <CustomSelect
                    value={state.contact}
                    onChange={(e) => {
                        handleSelectedContact(e);
                    }}
                    isSearchable={true}
                    placeholder={'Select Contact'}
                    options={state.contactList}
                    className=" lg:w-2/3"
                    loadMore={() => contactLoadMore()}
                />
                {/* <div className="  relative flex w-full max-w-lg items-center rounded-full border border-gray-300 dark:border-white-dark/30 ">
                    <button type="submit" className="absolute right-2 flex items-center justify-center rounded-full bg-transparent p-2 text-primary hover:bg-gray-200 dark:hover:bg-gray-700">
                        <IconSearch className="h-5 w-5 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search contact"
                        className="form-input flex-grow rounded-full border-0 bg-white py-2 pl-4 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div> */}
            </div>
            <div className={`mt-1 flex w-full ${!objIsEmpty(state.contact) ? 'flex-wrap space-x-0' : ' flex-wrap '} `}>
                <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-full md:w-1/3' : 'w-full md:w-1/2'}`}>
                    <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                <IconUser className="text-[#82de69]" />
                            </div>
                            <div className=" " style={{ fontSize: '20px' }}>
                                Company Information
                            </div>
                        </div>
                        <TextInput title="Lead Name" value={state.name} onChange={(e) => setState({ name: e })} placeholder={'Lead Name'} error={state.errors?.name} required />

                        <TextInput
                            title="Website"
                            value={state.company_website}
                            onChange={(e) => setState({ company_website: e })}
                            placeholder={'Website'}
                            // required
                            // error={state.errors?.company_website}
                        />
                        <CustomSelect
                            title="Company Vertical"
                            value={state.vertical}
                            onChange={(e) => {
                                if (e) {
                                    setState({ focus_segment: '', vertical: e });
                                    getFocusSegmentList(e);
                                } else {
                                    setState({ focus_segment: '', vertical: '' });
                                }
                            }}
                            placeholder={'Company Vertical'}
                            options={state.verticalList}
                            // required
                            // error={state.errors?.vertical}
                        />
                        <CustomSelect
                            title="Company Segment"
                            value={state.focus_segment}
                            onChange={(e) => {
                                setState({ focus_segment: e });
                            }}
                            placeholder={'Company Segment'}
                            options={state.focusSegmentList}
                            // required
                            // error={state.errors?.focus_segment}
                        />
                        <CustomSelect
                            title="Country"
                            value={state.country}
                            onChange={(e) => {
                                if (e) {
                                    stateList(e);
                                }
                                setState({ country: e, state: '' });
                            }}
                            placeholder={'Country'}
                            options={state.countryList}
                            required
                            error={state.errors?.country}
                        />
                        <CustomSelect
                            title="State"
                            value={state.state}
                            onChange={(e) => {
                                if (e) {
                                    cityList(e);
                                }
                                setState({ state: e, city: '' });
                            }}
                            placeholder={'State'}
                            options={state.stateList}
                            error={state.errors?.state}
                            required
                        />
                        <CustomSelect title="City" value={state.city} onChange={(e) => setState({ city: e })} placeholder={'City'} options={state.cityList} error={state.errors?.city} required />
                        <TextInput title="Address" value={state.address} onChange={(e) => setState({ address: e })} placeholder={'Address'} error={state.errors?.address} required />
                    </div>
                </div>
                {!objIsEmpty(state.contact) && (
                    <div className="  w-full md:w-1/3">
                        <div className=" col-span-12 flex flex-col   md:col-span-5">
                            <div className="panel mt-1 flex flex-col gap-5 rounded-2xl p-3 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffeeee]">
                                        <IconUser className="text-[#fe70f2]" />
                                    </div>
                                    <div className="text-lg font-medium" style={{ fontSize: '20px' }}>
                                        Contact Information
                                    </div>
                                </div>
                                <TextInput title="Name" value={state.contact_name} onChange={(e) => setState({ contact_name: e })} placeholder={' Name'} error={state.errors?.contact_name} />
                                <TextInput
                                    title="Email"
                                    value={state.email_id}
                                    onChange={(e) => setState({ email_id: e })}
                                    placeholder={'Email'}
                                    // error={state.errors?.email_id}
                                />
                                <NumberInput
                                    title="Phone Number"
                                    value={state.phone_number}
                                    onChange={(e) => setState({ phone_number: e })}
                                    placeholder={'Phone Number'}
                                    // error={state.errors?.phone_number}
                                />
                                <TextInput
                                    title="Designation"
                                    value={state.designation}
                                    onChange={(e) => setState({ designation: e })}
                                    placeholder={'Designation'}
                                    // error={state.errors?.designation}
                                />
                                <CustomSelect
                                    value={state.department}
                                    onChange={(e) => setState({ department: e })}
                                    placeholder={'Department'}
                                    title={'Department'}
                                    options={state.departmentList}
                                    // error={state.errors?.department}
                                />

                                <CustomSelect
                                    value={state.lead_source}
                                    onChange={(e) => setState({ lead_source: e })}
                                    placeholder={'Lead Source'}
                                    title={'Lead Source'}
                                    options={state.sourceList}
                                    // error={state.errors?.lead_source}
                                />
                                <TextArea
                                    height="120px"
                                    value={state.source_from}
                                    onChange={(e) => setState({ source_from: e })}
                                    placeholder={'Source From'}
                                    title={'Source From'}
                                    // error={state.errors?.source_from}
                                />

                                <CustomSelect
                                    value={state.contact_status}
                                    onChange={(e) => setState({ contact_status: e })}
                                    placeholder={'Status'}
                                    title={'Status'}
                                    options={state.contactStatusList}
                                    // error={state.errors?.contact_status}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-full md:w-1/3' : 'w-full md:w-1/2'}`}>
                    <div className="panel col-span-12  flex   flex-col gap-5 rounded-2xl p-3 md:col-span-7">
                        <div className="  flex items-center gap-3">
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#ffefe4]">
                                <IconUser className="text-[#ffbb55]" />
                            </div>
                            <div className=" " style={{ fontSize: '20px' }}>
                                More Information
                            </div>
                        </div>
                        <CustomSelect
                            title="Opportunity_name"
                            value={state.opportunity_name}
                            onChange={(e) => setState({ opportunity_name: e })}
                            placeholder={'Opportunity_name'}
                            options={state.opportunityList}
                            error={state.errors?.opportunity_name}
                            required
                        />
                        {/* {
                            state?.opportunity_name && (
                                <TextArea
                                    height="120px"
                                    value={state.opportunity_keyword}
                                    onChange={(e) => setState({ opportunity_keyword: e })}
                                    placeholder={'Opportunity Remark'}
                                    title={'Opportunity Remark'}
                                // error={state.errors?.source_from}
                                />
                            )
                        } */}

                        <NumberInput
                            title="Annual Revenue"
                            value={state.annual_revenue}
                            onChange={(e) => setState({ annual_revenue: e })}
                            placeholder={'Annual Revenue'}
                            error={state.errors?.annual_revenue}
                        />
                        <CustomSelect
                            title="Income Segment"
                            value={state.market_segment}
                            onChange={(e) => setState({ market_segment: e })}
                            placeholder={'Income Segment'}
                            options={state.marketSegmentList}
                            // required
                            // error={state.errors?.market_segment}
                        />
                        <CustomSelect
                            title="Lead Type"
                            value={state.lead_type}
                            onChange={(e) => setState({ lead_type: e })}
                            placeholder={'Lead Type'}
                            options={LEADTYPE}
                            error={state.errors?.lead_type}
                            required
                        />
                        {/* <CustomSelect
                            title="Lead Manager"
                            value={state.lead_owner}
                            onChange={(e) => setState({ lead_owner: e })}
                            placeholder={'Lead Manager'}
                            options={state.leadManagerList}
                            error={state.errors?.lead_owner}
                            required
                        /> */}
                        <CustomSelect title="Tags" value={state.tags} isMulti={true} onChange={(e) => setState({ tags: e })} placeholder={'Tags'} options={state.tagList} error={state.errors?.tags} />

                        <TextArea
                            height="120px"
                            value={state.remark}
                            onChange={(e) => setState({ remark: e })}
                            placeholder={'Remark'}
                            title={'Remark'}
                            // required error={state.errors?.remark}
                        />

                        <div className=" flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => router.replace('/leads')}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Submit'}
                            </button>
                            {/* <button type="button" className="btn btn-primary" onClick={() => setState({ isOpen: true })}>
                            {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit and Add Opportunity'}
                        </button> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className=" mt-2 grid grid-cols-12  gap-2">
                <div className=" col-span-12 flex flex-col   md:col-span-5"></div>
            </div>
        </div>
    );
};

export default PrivateRouter(CreateLead);
