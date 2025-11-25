import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import { useRouter } from 'next/router';
import IconUser from '@/components/Icon/IconUser';
import { Dropdown, Failure, Success, objIsEmpty, useSetState } from '@/utils/functions.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import CheckboxInput from '@/components/Checkbox';
import Models from '@/imports/models.import';
import CommonLoader from './elements/commonLoader';
import IconLoader from '@/components/Icon/IconLoader';
import { createLeadValidation } from '@/utils/validation.utils';
import { PrivateRouter, Validation } from '@/utils/imports.utils';
import * as Yup from 'yup';
import Breadcrumb from '@/common_component/breadcrumb';
import Modal from '@/common_component/modal';
import CustomeDatePicker from '@/common_component/datePicker';
import TextArea from '@/components/TextArea';
import SideMenu from '@/common_component/sideMenu';
import FileUpload from '@/common_component/fileUpload';
import { LEADTYPE } from '@/utils/constant.utils';
import IconSearch from '@/components/Icon/IconSearch';
import { SimpleGrid } from '@mantine/core';
import moment from 'moment';

const UpdateContact = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Update contact'));
    });

    const router = useRouter();

    const id = router?.query?.id;

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
        source_from: '',
        assignList: [],
        sourceList: [],
        sourceFromList: [],
        leadTypeList: [],
        leadManagerList: [],
        currentLeadPage: 1,
        is_archive: false,
        moveToLead: false,
    });

    useEffect(() => {
        getDate();
        sourceList();
        departmentList();
        statusList();
        leadList();
        countryList();
        leadStatusList();
        verticalList();
        // assignList();
        leadManagerList();
        getMarketSegmentList();
        tagList();
        getOpportunityList();
    }, []);

    useEffect(() => {
        getDate();
    }, [id]);
    // contactAssignRole,contactAssigned_to

    useEffect(() => {
        if (state.assignRole) {
            if (state.assignRole?.value == 'owner') {
                ownerList();
            } else if (state.assignRole?.value == 'bdm') {
                bdmList();
            } else if (state.assignRole?.value == 'tm') {
                telecallerList();
            } else if (state.assignRole?.value == 'bde') {
                bdeList();
            }
        }
    }, [state.assignRole]);

    useEffect(() => {
        if (state.contactAssignRole) {
            if (state.contactAssignRole?.value == 'Admin') {
                ownerList();
            } else if (state.contactAssignRole?.value == 'BDM') {
                bdmList();
            } else if (state.contactAssignRole?.value == 'TM') {
                telecallerList();
            } else if (state.contactAssignRole?.value == 'BDE') {
                bdeList();
            }
        }
    }, [state.contactAssignRole]);

    const getDate = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.details(id);
            setState({
                company_name: res.company_name,
                name: res.name,
                email_id: res.email_id,
                phone_number: res.phone_number ? res.phone_number.replace(/\s/g, '') : null,
                designation: res.designation,
                department: !objIsEmpty(res.department) ? { value: res.department?.id, label: res.department?.department } : null,
                lead_source: !objIsEmpty(res.lead_source) ? { value: res.lead_source?.id, label: res.lead_source?.source } : null,
                status: !objIsEmpty(res.status) ? { value: res.status?.id, label: res.status?.status } : null,
                remark: res.remark,
                source_from: res.source_from,
                is_archive: res.is_archive,
                contactAssignRole: !objIsEmpty(res.assigned_to) ? { value: res.assigned_to?.groups?.[0], label: res.assigned_to?.groups?.[0] } : null,
                contactAssigned_to:  !objIsEmpty(res.assigned_to) ? { value: res.assigned_to?.id, label:  `${res?.assigned_to?.first_name} ${res?.assigned_to?.last_name} `} : null,
                
            });
            setState({ loading: false });
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

    const telecallerList = async () => {
        try {
            const res: any = await Models.lead.bdmAndBDE();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList });
        } catch (error) {
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

    const statusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.status();
            const dropdownList = Dropdown(res, 'status');
            setState({ statusList: dropdownList, loading: false });
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

    const leadList = async () => {
        try {
            const res: any = await Models.lead.list(state.currentLeadPage);
            const dropdownList = Dropdown(res?.results, 'name');
            setState({
                leadList: dropdownList,
                hasMoreLead: res.next,
            });
        } catch (error) {
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

    const leadStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.statusList();
            const dropdownList = Dropdown(res.results, 'name');
            setState({ leadStatusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

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

    const leadListLoadMore = async () => {
        try {
            if (state.hasMoreLead) {
                const res: any = await Models.lead.list(state.currentLeadPage + 1);
                const newOptions = Dropdown(res?.results, 'name');
                setState({
                    leadList: [...state.leadList, ...newOptions],
                    hasMoreLead: res.next,
                    currentLeadPage: state.currentLeadPage + 1,
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

    const handleSubmit = async () => {
        try {
            setState({ submitLoad: true });
            const user: any = await Models.auth.userDetails();

            if (state.moveToLead) {
                const body = {
                    company_name: state.company_name?.trim(),
                    opportunity_name: state.opportunity_name?.value,
                    // name: state.name?.trim(),
                    // email_id: state.email_id?.trim(),
                    // phone_number: state.phone_number,
                    // designation: state.designation?.trim(),
                    // department: state.department?.value,
                    // lead_source: state.lead_source?.value,
                    // source_from: state.source_from?.trim(),
                    // status: state.status?.value,
                    // remark: state.remark?.trim(),
                    is_archive: state.is_archive,
                    is_active: true,
                    // company_website: state.company_website,
                    // vertical: state.vertical?.value,
                    // focus_segment: state.focus_segment?.value,
                    address: state.address,
                    country: state.country?.value,
                    state: state.state?.value,
                    city: state.city?.value,
                    // assigned_to: state.assigned_to?.value,
                    // lead_status: state.lead_status?.value,
                    // annual_revenue: state.annual_revenue ? Number(state.annual_revenue) : null,
                    // market_segment: state.market_segment?.value,
                    lead_type: state.lead_type?.value,
                    // lead_owner: state.lead_owner?.value,
                    lead_owner: user?.id,
                };
                await Validation.createNewContactWithLead.validate(body, { abortEarly: false });
                const contact = {
                    name: state.name?.trim(),
                    company_name: state.company_name?.trim(),
                    email_id: state.email_id?.trim(),
                    designation: state.designation?.trim(),
                    department: state.department?.value,
                    phone_number: state.phone_number,
                    lead_source: state.lead_source?.value,
                    source_from: state.source_from?.trim(),
                    remark: state.remark?.trim(),
                    is_archive: state.is_archive,
                    status: state.status?.value,
                    is_active: true,
                };

                const response: any = await Models.contact.update(contact, id);
                let tags = [];
                if (state.tags?.length > 0) {
                    tags = state.tags?.map((item) => item.value);
                }
                const lead = {
                    name: state.company_name?.trim(),
                    email_id: state.email_id?.trim(),
                    phone_number: state.phone_number,
                    designation: state.designation?.trim(),
                    department: state.department?.value,
                    remark: state.remark?.trim(),
                    is_active: true,
                    company_website: state.company_website,
                    vertical: state.vertical?.value,
                    focus_segment: state.focus_segment?.value,
                    address: state.address,
                    country: state.country?.value,
                    state: state.state?.value,
                    city: state.city?.value,
                    assigned_to: state.assigned_to?.value,
                    // lead_status: state.lead_status?.value,
                    annual_revenue: state.annual_revenue ? Number(state.annual_revenue) : null,
                    market_segment: state.market_segment?.value,
                    lead_type: state.lead_type?.value,
                    // lead_owner: state.lead_owner?.value,
                    lead_owner: user?.id,

                    tags: tags,
                    contact_id: response?.id,
                    opportunity_name: state.opportunity_name?.value,
                    // opportunity_keyword: state?.opportunity_keyword,
                    status_date: moment(new Date()).format('YYYY-MM-DD'),
                };
                const res: any = await Models.lead.create(lead);
                console.log('create: ', res);
                setState({ submitLoad: false });
                Success('Lead created successfully');
                router.push('/leads');
            } else {
                const body = {
                    // name: state.name?.trim(),
                    company_name: state.company_name?.trim(),
                    // email_id: state.email_id?.trim(),
                    // designation: state.designation?.trim(),
                    // department: state.department?.value,
                    // phone_number: state.phone_number,
                    // lead_source: state.lead_source?.value,
                    // source_from: state.source_from?.trim(),
                    // remark: state.remark?.trim(),
                    is_archive: state.is_archive,
                    lead: state.lead?.value,
                    // status: state.status?.value,
                    is_active: true,
                };
                await Validation.createNewContact.validate(body, { abortEarly: false });

                const contact = {
                    name: state.name?.trim(),
                    company_name: state.company_name?.trim(),
                    email_id: state.email_id?.trim(),
                    designation: state.designation?.trim(),
                    department: state.department?.value ? state.department?.value : null,
                    phone_number: state.phone_number,
                    lead_source: state.lead_source?.value ? state.lead_source?.value : null,
                    source_from: state.source_from?.trim(),
                    remark: state.remark?.trim(),
                    is_archive: state.is_archive,
                    status: state.status?.value ? state.status?.value : null,
                    is_active: true,
                    assigned_to: state.contactAssigned_to?.value,
                };

                const response: any = await Models.contact.update(contact, id);

                if (state.is_archive) {
                    Success('Contact updated successfully');
                    // router.replace(`/archive_contact`);
                    router.back()
                } else {
                    Success('Contact updated successfully');
                    // router.replace(`/contacts`);
                    router.back()

                }
                setState({ submitLoad: false });
            }
        } catch (error) {
            if (error?.message) {
                Failure(error?.message);
            } else {
                Failure(error);
            }
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message; // Set the error message for each field
                });

                setState({ errors: validationErrors });
                setState({ submitLoad: false });
            } else {
                console.log('Error: ', error?.message);
                setState({ submitLoad: false });
            }
            setState({ submitLoad: false });
        }
    };

    const verticalList = async () => {
        try {
            setState({ loading: true });
            const res = await Models.lead.verticalList();
            const dropdownList = Dropdown(res, 'vertical');
            setState({ verticalList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const assignList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.bdmAndBDE();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/contacts' },
        { label: 'Update Contact', path: '' },
    ];

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="relative h-auto  overflow-scroll bg-[#dbe7ff] bg-cover p-2">
            <Breadcrumb items={breadcrumbItems} />

            <div className="panel  flex  items-center justify-between gap-5 ">
                <div className="flex items-center gap-2">
                    <div className="flex h-[50px] w-[50px] overflow-hidden bg-white" style={{ borderRadius: 50 }}>
                        <img src="/assets/images/profile-1.jpeg" height={'100%'} width={'100%'} />
                    </div>
                    <div>
                        <h5 className="font-semibold " style={{ fontSize: '18px' }}>
                            Update Contact
                        </h5>
                        <div className="  " style={{ fontSize: '14px', color: 'grey' }}>
                            Your data journey starts here...
                        </div>
                    </div>
                </div>
                {!state.moveToLead && (
                    <div className="flex gap-5">
                        <CustomSelect
                            value={state.contactAssignRole}
                            onChange={(e) => setState({ contactAssignRole: e, contactAssigned_to: '', assignList: [] })}
                            placeholder={'Choose Role'}
                            title={'Choose Role'}
                            options={[
                                { value: 'Admin', label: 'Admin' },
                                { value: 'BDM', label: 'BDM' },
                                { value: 'BDE', label: 'BDE' },
                                { value: 'TM', label: 'TM' },
                            ]}
                            className="lg:w-[200px]"
                        />
                        <CustomSelect
                            title="Assigned To"
                            value={state.contactAssigned_to}
                            onChange={(e) => {
                                setState({ contactAssigned_to: e });
                            }}
                            placeholder={'Assigned To'}
                            options={state.assignList}
                            className="lg:w-[200px]"
                        />
                    </div>
                )}
            </div>
            <div className="panel mt-2">
                <SimpleGrid
                    cols={3}
                    spacing="lg"
                    breakpoints={[
                        { maxWidth: 768, cols: 2 },
                        { maxWidth: 576, cols: 1 },
                    ]}
                    className="p-2"
                >
                    <TextInput
                        title="Company Name"
                        value={state.company_name}
                        onChange={(e) => setState({ company_name: e })}
                        placeholder={'Company Name'}
                        error={state.errors?.company_name}
                        required
                    />

                    <TextInput
                        title=" Name"
                        value={state.name}
                        onChange={(e) => setState({ name: e })}
                        placeholder={' Name'}
                        // error={state.errors?.name}
                        // required={!!state.moveToLead}
                    />
                    <TextInput
                        title="Email"
                        value={state.email_id}
                        onChange={(e) => setState({ email_id: e })}
                        placeholder={'Email'}
                        // error={state.errors?.email_id}
                        // required={!!state.moveToLead}
                    />
                    <NumberInput
                        title="Phone Number"
                        value={state.phone_number}
                        onChange={(e) => setState({ phone_number: e })}
                        placeholder={'Phone Number'}
                        // error={state.errors?.phone_number}
                        // required={!!state.moveToLead}
                    />
                    <TextInput
                        title="Designation"
                        value={state.designation}
                        onChange={(e) => setState({ designation: e })}
                        placeholder={'Designation'}
                        //  error={state.errors?.designation}
                        //  required={!!state.moveToLead}
                    />
                    <CustomSelect
                        value={state.department}
                        onChange={(e) => setState({ department: e })}
                        placeholder={'Department'}
                        title={'Department'}
                        options={state.departmentList}
                        // error={state.errors?.department}
                        // required={!!state.moveToLead}
                    />

                    <CustomSelect
                        value={state.lead_source}
                        onChange={(e) => setState({ lead_source: e })}
                        placeholder={'Lead Source'}
                        title={'Lead Source'}
                        options={state.sourceList}
                        // error={state.errors?.lead_source}
                        // required={!!state.moveToLead}
                    />
                    <CustomSelect
                        value={state.status}
                        onChange={(e) => setState({ status: e })}
                        placeholder={'Status'}
                        title={'Status'}
                        options={state.statusList}
                        // error={state.errors?.status}
                        // required={!!state.moveToLead}
                    />
                    <TextArea
                        height="120px"
                        value={state.remark}
                        onChange={(e) => setState({ remark: e })}
                        placeholder={'Remark'}
                        title={'Remark'}
                        //  required={!!state.moveToLead}
                        //  error={state.errors?.remark}
                    />
                    <TextArea
                        height="120px"
                        value={state.source_from}
                        onChange={(e) => setState({ source_from: e })}
                        // required={!!state.moveToLead}
                        // error={state.errors?.source_from}
                        placeholder={'Source Details'}
                        title={'Source Details'}
                    />

                    <div className="">
                        <CheckboxInput
                            className="w-full md:w-1/2 lg:w-3/4"
                            checked={state.moveToLead}
                            disabled={state.is_archive}
                            onChange={(val) => {
                                setState({ moveToLead: val });
                            }}
                            label="Move To Lead"
                        />
                    </div>
                    <CheckboxInput
                        className="w-full md:w-1/2 lg:w-3/4 "
                        disabled={state.moveToLead}
                        checked={state.is_archive}
                        onChange={(val) => setState({ is_archive: val })}
                        label="Archive Contact"
                    />
                </SimpleGrid>

                {state.moveToLead && (
                    <div className="mt-1 flex w-full justify-between space-x-2">
                        <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-1/3' : 'w-2/3'}`}>
                            <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                        <IconUser className="text-[#82de69]" />
                                    </div>
                                    <div className=" " style={{ fontSize: '20px' }}>
                                        Company Information
                                    </div>
                                </div>
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
                                <TextInput title="Address" value={state.address} onChange={(e) => setState({ address: e })} placeholder={'Address'} error={state.errors?.address} required />
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
                                <CustomSelect
                                    title="City"
                                    value={state.city}
                                    onChange={(e) => setState({ city: e })}
                                    placeholder={'City'}
                                    options={state.cityList}
                                    error={state.errors?.city}
                                    required
                                />
                                <CustomSelect
                                    value={state.assignRole}
                                    onChange={(e) => setState({ assignRole: e, assigned_to: '', assignList: [] })}
                                    placeholder={'Choose Role'}
                                    title={'Choose Role'}
                                    options={[
                                        { value: 'owner', label: 'Owner' },
                                        { value: 'bdm', label: 'BDM' },
                                        { value: 'bde', label: 'BDE' },
                                    ]}
                                />
                                <CustomSelect
                                    value={state.assigned_to}
                                    onChange={(e) => setState({ assigned_to: e })}
                                    placeholder={'Assign To'}
                                    title={'Assign To'}
                                    options={state.assignList}
                                    error={state.errors?.assigned_to}
                                    // required
                                />

                                {/* <CustomSelect
                                    value={state.lead_status}
                                    onChange={(e) => setState({ lead_status: e })}
                                    placeholder={'Status'}
                                    title={'Status'}
                                    options={state.leadStatusList}
                                    error={state.errors?.lead_status}
                                    required
                                /> */}
                            </div>
                        </div>

                        <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-1/3' : 'w-2/3'}`}>
                            <div className="panel col-span-12  flex h-[720px]  flex-col gap-5 rounded-2xl p-3 md:col-span-7">
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
                                    // error={state.errors?.annual_revenue}
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
                                <CustomSelect
                                    title="Tags"
                                    value={state.tags}
                                    isMulti={true}
                                    onChange={(e) => setState({ tags: e })}
                                    placeholder={'Tags'}
                                    options={state.tagList}
                                    // error={state.errors?.tags}
                                />

                                {/* <div className=" flex items-center justify-end gap-3">
                                            <button type="button" className="btn btn-outline-danger border " onClick={() => router.replace('/')}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
                                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Submit'}
                                            </button>
                                          
                                        </div> */}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex flex-col gap-3 pt-5 md:flex-row md:justify-end">
                    <button type="button" className="btn btn-outline-danger w-full border md:w-auto" onClick={() => router.back()}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => handleSubmit()}>
                        {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateContact;
