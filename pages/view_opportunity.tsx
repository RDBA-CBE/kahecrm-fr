import React, { useEffect } from 'react';
import CommonLoader from './elements/commonLoader';
import { Dropdown, Success, capitalizeFLetter, convertUrlToFile, getFileNameFromUrl, objIsEmpty, roundOff, showDeleteAlert, useSetState } from '@/utils/functions.utils';
import { useRouter } from 'next/router';
import Models from '@/imports/models.import';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import IconUser from '@/components/Icon/IconUser';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import CheckboxInput from '@/components/Checkbox';
import IconLoader from '@/components/Icon/IconLoader';
import { createLeadValidation } from '@/utils/validation.utils';
import { Validation } from '@/utils/imports.utils';
import * as Yup from 'yup';
import { DataTable } from 'mantine-datatable';
import ViewLabel from '@/components/viewLabel';
import SideMenu from '@/common_component/sideMenu';
import OppCard from '@/components/oppCard';
import IconPlus from '@/components/Icon/IconPlus';
import { notifyError, notifySuccess } from '@/components/toast';
import Swal from 'sweetalert2';
import Modal from '@/common_component/modal';
import LogCard from '@/components/logCard';
import TextArea from '@/components/TextArea';
import CustomeDatePicker from '@/common_component/datePicker';
import moment from 'moment';
import { leadId, oppId } from '@/store/crmConfigSlice';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import IconMenuContacts from '@/components/Icon/Menu/IconMenuContacts';
import IconContacts from '@/components/Icon/IconContact';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import Tippy from '@tippyjs/react';
import IconOpportunity from '@/components/Icon/IconOpportunity';
import OppLabel from '@/components/oppLabel';
import Breadcrumb from '@/common_component/breadcrumb';
import YearPicker from '@/common_component/yearPicker';
import FileUpload from '@/common_component/fileUpload';
// import Link from 'next/link';
import Dropdowns from '../components/Dropdown';
import IconTrash from '@/components/Icon/IconTrash';
import { Badge, Card, SimpleGrid, Text, Title } from '@mantine/core';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import IconArrowDown from '@/components/Icon/IconArrowDown';
import MenuPopup from '@/components/MenuPopup';
import IconHorizontalDots from '@/components/Icon/IconHorizontalDots';
import IconVerticalDots from '@/components/Icon/IconVerticalDots';
import { IRootState } from '@/store';

export default function View_opportunity(props: any) {
    const router = useRouter();

    const id = router?.query?.id;

    const dispatch = useDispatch();

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const [state, setState] = useSetState({
        loading: false,
        data: {},
        isOpen: false,
        contactList: [],
        isOpenCreateContact: false,
        statusList: [],
        leadSourceList: [],
        createdByList: [],
        assigned_to: '',
        department: '',
        designation: '',
        phoneNumber: '',
        email: '',
        lead_source: '',
        contact_status: '',
        source_from: '',
        createdby: '',
        contact_name: '',
        logList: [],
        opportunityList: [],
        logCount: 0,
        contactCount: 0,
        isOpenOpp: false,
        //Opportunity
        opp_name: '',
        owner: '',
        opportunity_value: '',
        recurring_value_per_year: '',
        currency_type: '',
        probability_in_percentage: '',
        opp_created_by: '',
        opp_closing_date: '',
        opp_stage: '',
        oppLoading: false,
        ownerList: [],
        file: null,
        isOpenOppo: false,
        isOpenLog: false,
        logType: null,
        taskType: null,
        isLogOpen: false,
        primary_contact_list: [],
        primary_contact: null,
        stageList: [],
        assignToList: [],
        oppStageList: [],
        isOpenLeadInfo: false,
        assignment_note: '',
        log_assigned_to: null,
    });

    useEffect(() => {
        getDate();
        getLogStageList();
        getLogList();
    }, [id]);

    useEffect(() => {
        getDate();
        getLogStageList();
        userList();
    }, []);

    useEffect(() => {
        if (state.logtype) {
            getLogListFilter();
        } else {
            getLogList();
        }
    }, [state.logtype]);

    const getLogList = async () => {
        try {
            const res: any = await Models.lead.logOppoList(id);
            setState({ logList: res?.results, logCount: res.count });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getLogListFilter = async () => {
        try {
            let statusId = null;
            if (state.logtype == 'Email') {
                statusId = 'Email';
            }
            if (state.logtype == 'Call') {
                statusId = 'Call';
            }
            if (state.logtype == 'Meeting') {
                statusId = 'Meeting';
            }
            const res: any = await Models.lead.opplogFilterList(id, statusId);
            setState({ logList: res?.results, loading: false, logCount: res.count });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getDate = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.opportunity.details(id);
            let primary_contact = res?.primary_contact;
            setState({
                loading: false,
                data: res,
                contact_name: primary_contact?.name,
                email_id: primary_contact?.email_id,
                phone_number: primary_contact?.phone_number,
                designation: primary_contact?.designation,
                source_from: primary_contact?.source_from,
                status: primary_contact?.lead?.lead_status?.name,
                department: !objIsEmpty(primary_contact?.department) ? { value: primary_contact?.department?.id, label: primary_contact?.department?.department } : null,
                lead_source: !objIsEmpty(primary_contact?.lead_source) ? { value: primary_contact?.lead_source?.id, label: primary_contact?.lead_source?.source } : null,
                contact_status: !objIsEmpty(primary_contact?.status) ? { value: primary_contact?.status?.id, label: primary_contact?.status?.status } : null,
                primary_contact: { value: primary_contact.id, label: primary_contact.name },
                assigned_to: `${primary_contact?.lead?.assigned_to?.first_name} ${primary_contact?.lead?.assigned_to?.last_name}`,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getLogStageList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.stageList();
            console.log('res: ', res);
            const dropdownList = Dropdown(res.results, 'stage');
            setState({ stageList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const deleteOpp = async (id) => {
        showDeleteAlert(
            async () => {
                try {
                    notifySuccess('Opportunity deleted successfully.');

                    Swal.fire('Deleted!', 'Your opportunity has been deleted.', 'success');
                } catch (error) {
                    notifyError('An error occurred while deleting the opportunity.');
                    Swal.fire('Error!', 'An error occurred while deleting the opportunity.', 'error');
                }
            },
            () => {
                Swal.fire('Cancelled', 'Your opportunity is safe :)', 'info');
            },
            'Are you sure you want to delete opportunity?'
        );
    };
    const clearLogData = () => {
        setState({
            isOpenLog: false,
            logCreatedBy: '',
            logId: '',
            logStage: '',
            focus_segment: '',
            follow_up_date_time: '',
            details: '',
            errors: '',
            logLoad: false,
            file: null,
            isLogOpen: false,
            log_type: '',
            remark: '',
            task_type: '',
            log_assigned_to: [],
        });
    };
    const userList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.task.assigned_to();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignToList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const createAndUpdateLog = async () => {
        try {
            setState({ logLoad: true });
            let validateField;
            if (state.follow_up_date_time) {
                validateField = {
                    logStage: state.logStage?.value,
                    log_type: state.log_type?.value,
                    follow_up_date_time: state.follow_up_date_time,
                    task_type: state.taskType?.value,
                    details: state.details,
                    // assigned_to: state.assigned_to?.value,
                    assigned_to: state.log_assigned_to?.length > 0 ? state.log_assigned_to?.map((item) => item.value) : [],
                    // details: state.details,
                    // focus_segment: state.focus_segment?.value,
                    // primary_contact: state.primary_contact?.value,
                };

                await Validation.createLeadsLog.validate(validateField, { abortEarly: false });
            } else {
                validateField = {
                    logStage: state.logStage?.value,
                    log_type: state.log_type?.value,
                    details: state.details,
                    // focus_segment: state.focus_segment?.value,
                    // primary_contact: state.primary_contact?.value,
                };
                await Validation.createLeadLog.validate(validateField, { abortEarly: false });
            }

            let body;

            if (state.follow_up_date_time) {
                body = {
                    contact: state.primary_contact?.value,
                    lead: null,
                    opportunity: id,
                    // focus_segment: state.focus_segment?.value,
                    follow_up_date_time: state.follow_up_date_time,
                    log_stage: state.logStage?.value,
                    details: state.details,
                    log_type: state.log_type?.value,
                    task_assignment: {
                        // assigned_to: [state.assigned_to?.value], // Keep it as an array
                        assigned_to: state.log_assigned_to.map((item) => item.value),
                        assignment_note: state.assignment_note,
                    },

                    // file:state.file,
                    task_type: state.taskType?.value,
                    // remark: state.remark,
                };
            } else {
                body = {
                    contact: state.primary_contact?.value,
                    lead: null,
                    opportunity: id,
                    // focus_segment: state.focus_segment?.value,
                    follow_up_date_time: null,
                    log_stage: state.logStage?.value,
                    details: state.details,
                    log_type: state.log_type?.value,
                    // file:state.file
                };
            }

            if (state.logId) {
                await Models.log.update(body, id);
                Success('Log updated successfully');
            } else {
                await Models.log.create(body);
                Success('Log created successfully');
            }
            clearLogData();
            getLogList();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ errors: validationErrors });
                setState({ logLoad: false });
            } else {
                console.log('Error: ', error?.message);
                setState({ logLoad: false });
            }
            setState({ logLoad: false });
        }
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Lead', path: `viewLead?id=${redux?.leadId}` },
        { label: 'Opportunity', path: '/' },
    ];

    const handleCheckboxChange = (option) => {
        // setState({ logtype: state.logtype == option ? null : option });
        setState({ logtype: option });
    };

    const checkboxOptions = [
        { value: 'Call', label: 'Call' },
        { value: 'Meeting', label: 'Meeting' },
        { value: 'Email', label: 'Email' },
    ];

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="  relative  h-auto bg-[#dbe7ff] bg-cover p-2 ">
            <Breadcrumb items={breadcrumbItems} />
            <div className="panel pl-3 pr-3 ">
                <p className="text-sm text-gray-500 dark:text-gray-300">Lead</p>
                <h5 className="text-lg font-semibold dark:text-white-light">{`${capitalizeFLetter(state.data?.lead?.name)}`}</h5>
            </div>

            <div className=" panel mt-2 flex flex-wrap items-center justify-between gap-5 pl-3 pr-3 ">
                <div className="flex items-center gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                        <img src="/assets/images/profile-1.jpeg" style={{ objectFit: 'cover' }} />

                        {/* <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/auth/user.png" alt="userProfile" /> */}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Opportunity</p>

                        <h5 className="text-lg font-semibold dark:text-white-light">{`${capitalizeFLetter(state.data?.name?.name)}`}</h5>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {/* <button type="button" className="btn btn-outline-primary" onClick={() => router.push(`/updateLead?id=${id}`)}>
                        <IconEdit />
                    </button> */}
                    <div className="flex flex-col p-2 ">
                        <div className="text-md text-gray-600">Assigned To</div>
                        <div className="text-[18px]">{state?.assigned_to}</div>
                    </div>
                    {/* <div className="flex flex-col p-2 ">
                        <div className="text-md text-gray-600">Status</div>
                        <div className="text-[18px]">{state?.status}</div>
                    </div> */}
                </div>
            </div>
            <div className="panel mt-2 rounded-2xl p-3">
                <div className=" cursor-pointer items-center gap-3" onClick={() => setState({ isOpenLeadInfo: !state.isOpenLeadInfo })}>
                    <>
                        <div className="mt-1 flex w-full flex-wrap">
                            <div className={`mt-1  w-full md:w-1/3`}>
                                <div className="  flex  flex-col gap-5 rounded-2xl p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                            <IconUser className="text-[#82de69]" />
                                        </div>
                                        <div className=" " style={{ fontSize: '20px' }}>
                                            Opportunity Information
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Opportunity Name</div>
                                            <div className="text-[18px]">
                                                <div className="text-[18px]">{state.data?.name?.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Opportunity Value</div>
                                            <div className="text-[18px]">{state.data?.opportunity_value}</div>
                                        </div>{' '}
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Recurring Value For Year</div>
                                            <div className="text-[18px]">{state.data?.recurring_value_per_year}</div>
                                        </div>{' '}
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Probability In Percentage</div>
                                            <div className="text-[18px]">{state.data?.probability_in_percentage}</div>
                                        </div>{' '}
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Closing Date</div>
                                            <div className="text-[18px]">{state.data?.closing_date ? moment(state.data?.closing_date).format('DD-MM-YYYY') : null}</div>
                                        </div>{' '}
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Stage</div>
                                            <div className="text-[18px]">{state.data?.stage?.stage}</div>
                                        </div>{' '}
                                        <div className="flex flex-col p-2 ">
                                            <div className="text-md text-gray-600">Status</div>
                                            <div className="text-[18px]">{state.data?.opportunity_status?.name}</div>
                                        </div>{' '}
                                    </div>
                                </div>
                            </div>
                            <div className=" w-full md:w-1/3">
                                <div className=" col-span-12 flex flex-col   md:col-span-5">
                                    <div className=" mt-1 flex flex-col gap-5 rounded-2xl p-3 pb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffeeee]">
                                                <IconUser className="text-[#fe70f2]" />
                                            </div>
                                            <div className="text-lg font-medium" style={{ fontSize: '20px' }}>
                                                Contact Information
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Name</div>

                                                <div className="text-[18px]">{state.contact_name}</div>
                                            </div>
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Email</div>
                                                <div className="text-[18px]">{state.email_id}</div>
                                            </div>{' '}
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Phone Number</div>
                                                <div className="text-[18px]">{state.phone_number}</div>
                                            </div>{' '}
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Designation</div>
                                                <div className="text-[18px]">{state.designation}</div>
                                            </div>{' '}
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Department</div>
                                                <div className="text-[18px]">{state.department?.label}</div>
                                            </div>{' '}
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Lead Source</div>
                                                <div className="text-[18px]">{state.lead_source?.label}</div>
                                            </div>{' '}
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Source Details</div>
                                                <div className="text-[18px]">{state?.source_from}</div>
                                            </div>{' '}
                                            <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Contact Status</div>
                                                <div className="text-[18px]">{state.contact_status?.label}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-1 w-full md:w-1/3`}>
                                <div className=" col-span-12 flex flex-col   md:col-span-5">
                                    <div className=" mt-1 flex flex-col gap-5 rounded-2xl p-3 pb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffefe4]">
                                                <IconUser className="text-[#ffbb55]" />
                                            </div>
                                            <div className="text-lg font-medium" style={{ fontSize: '20px' }}>
                                                More Information
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {state.data?.remark && (
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">Remark</div>
                                                    <div className="text-[18px]">{state.data?.remark}</div>
                                                </div>
                                            )}
                                            {/* <div className="flex flex-col p-2 ">
                                                <div className="text-md text-gray-600">Lead Manager</div>
                                                <div className="text-[18px]">{state.data?.owner?.username}</div>
                                            </div> */}
                                            {state.data?.file_url && (
                                                <div className="flex flex-col p-2">
                                                    <div className="text-md text-gray-600">Document Upload</div>
                                                    <a href={state.data?.file_url} download target="_blank" rel="noopener noreferrer">
                                                        <img src="/assets/images/pdf.png" height={50} width={50} alt="Download PDF" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                </div>
            </div>

            <div className="panel col-span-12 mt-2 flex flex-col  rounded-2xl p-3 md:col-span-12">
                <div className="flex justify-between">
                    <div className="log-history flex w-full flex-wrap justify-between">
                        <div className="flex cursor-pointer items-center gap-3" onClick={() => setState({ isOpenLog: !state.isOpenLog })}>
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                {state.isOpenLog ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                            </div>
                            <div className="text-xl font-bold ">Log History</div>

                            <div className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white" style={{ fontSize: '18px' }}>
                                {state.logList?.length}
                            </div>
                        </div>
                        <div className="mt-2 flex cursor-pointer flex-wrap items-center gap-3" onClick={() => setState({ isOpenLog: true })}>
                            {checkboxOptions.map((option) => (
                                <CheckboxInput
                                    key={option.value}
                                    checked={state.logtype === option?.value}
                                    onChange={() =>
                                        setState({
                                            logtype: state.logtype === option.value ? null : option?.value,
                                        })
                                    }
                                    label={option?.label}
                                />
                            ))}
                            {/* <CheckboxInput checked={state.logtype === 'Call'} onChange={() => handleCheckboxChange('Call')} label="Call" />
                            <CheckboxInput checked={state.logtype === 'Meeting'} onChange={() => handleCheckboxChange('Meeting')} label="Meeting" />
                            <CheckboxInput checked={state.logtype === 'Email'} onChange={() => handleCheckboxChange('Email')} label="Email" /> */}
                            <button
                                type="button"
                                className="btn btn-primary log-btn p-1"
                                onClick={() => {
                                    dispatch(leadId(id));
                                    setState({ isLogOpen: true });
                                }}
                            >
                                <IconPlus />
                            </button>
                        </div>
                    </div>
                </div>
                {state.isOpenLog && (
                    <div className="max-h-[600px] overflow-y-scroll">
                        <LogCard data={state.logList} onPress={(item) => router.push(`/opportunity?id=${item.id}`)} onDelete={(item) => deleteOpp(item.id)} editIcon={false} />
                    </div>
                )}
            </div>

            <SideMenu
                title={state.logId ? 'Update Log' : 'Create Log'}
                open={state.isLogOpen}
                cancelOnClick={() => clearLogData()}
                // submitOnClick={() => console.log("submit") }
                submitOnClick={() => createAndUpdateLog()}
                // submitOnClick={() => (state.contactId ? updateContact() : createContact())}
                submitLoading={state.oppLoading}
                close={() => clearLogData()}
                renderComponent={() => (
                    <div className="flex flex-col gap-3">
                        <CustomSelect
                            title="Log Type"
                            value={state.log_type}
                            onChange={(e) => {
                                setState({ log_type: e });
                            }}
                            placeholder={'Log Type'}
                            options={[
                                { label: 'Call', value: 'Call' },
                                { label: 'Meeting', value: 'Meeting' },
                                { label: 'Email', value: 'Email' },
                                // { label: 'Others', value: 'Others' },
                            ]}
                            error={state.errors?.log_type}
                            required
                        />
                        <CustomSelect
                            title="Log Stage"
                            value={state.logStage}
                            onChange={(e) => setState({ logStage: e })}
                            placeholder={'Log Stage'}
                            options={state.stageList}
                            error={state.errors?.logStage}
                            required
                        />
                        {/* <CustomSelect
                            title="Focus Segment"
                            value={state.focus_segment}
                            onChange={(e) => setState({ focus_segment: e })}
                            placeholder={'Focus Segment'}
                            options={state.focusSegmentList}
                            error={state.errors?.focus_segment}
                            required
                        /> */}

                        <CustomeDatePicker value={state.follow_up_date_time} title="Follow Up" onChange={(e) => setState({ follow_up_date_time: e })} />
                        {state.follow_up_date_time && (
                            <>
                                <CustomSelect
                                    title="Task Type"
                                    value={state.taskType}
                                    onChange={(e) => {
                                        setState({ taskType: e });
                                    }}
                                    placeholder={'Task Type'}
                                    options={[
                                        {
                                            label: 'Call',
                                            value: 'Call',
                                        },
                                        {
                                            label: 'Follow Up',
                                            value: 'Follow Up',
                                        },
                                        {
                                            label: 'To Do',
                                            value: 'To Do',
                                        },
                                    ]}
                                    error={state.errors?.logStage}
                                    required
                                />

                                <CustomSelect
                                    title="Assign To"
                                    value={state.log_assigned_to}
                                    onChange={(e) =>
                                        //     {setState({ log_assigned_to: e })
                                        //  console.log(state.log_assigned_to);
                                        // }
                                        setState({
                                            ...state, // Spread the current state
                                            log_assigned_to: e, // Directly update `assigned_to`
                                        })
                                    }
                                    placeholder={'Assign To'}
                                    options={state.assignToList}
                                    error={state.errors?.assigned_to}
                                    required
                                    isMulti={true}
                                />
                                {/* <TextArea height="120px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} /> */}
                            </>
                        )}
                        {/* <CustomSelect
                            title="Primary Contact"
                            value={state.primary_contact}
                            onChange={(e) => setState({ primary_contact: e })}
                            placeholder={'Primary Contact'}
                            options={state.primary_contact_list}
                            // loadMore={() => leadListLoadMore()}
                        /> */}
                        <TextArea height="150px" value={state.details} onChange={(e) => setState({ details: e })} placeholder={'Details'} title={'Details'} required error={state.errors?.details} />
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".pdf,.doc,.docx,.txt"
                            isImageAllowed={false}
                            value={state.file}
                        />

                        {/* <div className="mt-3 flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => setState({ isLogOpen: false })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => createAndUpdateLog()}>
                                {state.logLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div> */}
                    </div>
                )}
            />
        </div>
    );
}
