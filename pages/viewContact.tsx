import React, { useEffect } from 'react';
import CommonLoader from './elements/commonLoader';
import { Dropdown, Success, capitalizeFLetter, convertToFormData, convertUrlToFile, getFileNameFromUrl, showDeleteAlert, useSetState } from '@/utils/functions.utils';
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
import IconEdit from '@/components/Icon/IconEdit';
import Tippy from '@tippyjs/react';
import TooltipButton from '@/common_component/tooltipButton';
import IconAddLog from '@/components/Icon/IconLogPlus';
import FileUpload from '@/common_component/fileUpload';
import Breadcrumb from '@/common_component/breadcrumb';
import { IRootState } from '@/store';

export default function ViewLead() {
    const router = useRouter();

    const id = router?.query?.id;

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const [state, setState] = useSetState({
        loading: false,
        data: {},
        isOpen: false,
        logList: [],
        isOpenCreateContact: false,
        statusList: [],
        leadSourceList: [],
        createdByList: [],
        department: '',
        designation: '',
        phoneNumber: '',
        email: '',
        lead_source: '',
        contact_status: '',
        contact_name: '',
        logStageList: [],
        follow_up_date_time: null,
        details: '',
        isOpenEdit: false,
        createdby: null,
        logCreatedBy: null,
        isOpenLog: false,
        logLoad: false,
        createContactLoad: false,
        file: null,
    });

    useEffect(() => {
        getDate();
        getLogList();
        getLogStageList();
        getContactStatusList();
        getContactLeadSourceList();
        createdByList();
        getFocusSegmentList();
    }, [id]);

    const getDate = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.details(id);
            setState({
                loading: false,
                data: res,
                contact_name: res.name,
                designation: res.designation,
                department: res.department,
                phoneNumber: res.phone_number,
                email: res.email_id,
                lead_source: { value: res.lead_source?.id, label: res?.lead_source?.source },
                createdby: { value: res.created_by?.id, label: res?.created_by?.username },
                contact_status: { value: res.status?.id, label: res?.status?.status },
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getLogList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.log.listByContactId(id);
            setState({ logList: res?.results, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getLogStageList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.log.logStage();
            const dropdownList = Dropdown(res, 'stage');

            setState({ logStageList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getFocusSegmentList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.dropdowns('focus_segment');
            const dropdownList = Dropdown(res, 'focus_segment');
            setState({ focusSegmentList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getContactStatusList = async () => {
        try {
            setState({ loading: true });
            const res = await Models.contact.dropdowns('contactstatus');
            const dropdownList = Dropdown(res, 'status');
            setState({ statusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getContactLeadSourceList = async () => {
        try {
            setState({ loading: true });
            const res = await Models.contact.dropdowns('lead_source');
            const dropdownList = Dropdown(res, 'source');
            setState({ leadSourceList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const createdByList = async () => {
        try {
            setState({ loading: true });
            const res = await Models.lead.dropdowns('created_by');
            const dropdownList = Dropdown(res, 'username');
            setState({ createdByList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
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

    const createAndLog = async () => {
        try {
            setState({ logLoad: true });
                let validateField = {
                    logStage: state.logStage?.value,
                };
                await Validation.updateLog.validate(validateField, { abortEarly: false });
          

            const formData = new FormData();
            formData.append('details', state.details);
            formData.append('log_stage', state.logStage?.value);
            formData.append('focus_segment', state.focus_segment?.value);

            if (state.follow_up_date_time) {
                formData.append('follow_up_date_time', moment(state.follow_up_date_time).format('YYYY-MM-DD'));
            }

            if (state.file && state.file instanceof File) {
                formData.append('file', state.file); 
            } else {
                formData.append('file', ''); 
            }
            if (state.logId) {
                await Models.log.update(formData, state.logId);
                Success('Log updated successfully');
            } else {
                // await Models.log.create(formData, id);
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

    const updateContact = async () => {
        try {
            setState({ createContactLoad: true });
            const validateField = {
                contact_status: state.contact_status?.value,
                lead_source: state.lead_source?.value,
                department: state.department,
                designation: state.designation,
                phoneNumber: state.phoneNumber,
                email: state.email,
                contact_name: state.contact_name,
            };
            await Validation.createContact.validate(validateField, { abortEarly: false });

            const body = {
                lead: id,
                status: state.contact_status?.value,
                lead_source: state.lead_source?.value,
                created_by: state.createdby?.value,
                department: state.department,
                designation: state.designation,
                phone_number: state.phoneNumber,
                email_id: state.email,
                is_active: state.is_active,
                name: state.contact_name,
            };

            const res = await Models.contact.update(body, id);
            Success('Contact updated successfully');
            getLogList();
            getDate();
            clearContactData();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = error.inner.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {});
                setState({ errors: validationErrors, createContactLoad: false });
            } else {
                console.log('Error: ', error?.message);
            }
            setState({ createContactLoad: false });
        }
    };

    const onEditLog = async (item) => {
        if (item?.file_url) {
            const fileName = getFileNameFromUrl(item?.file_url);
            const files = await convertUrlToFile(item?.file_url, fileName);
            setState({ file: files });
        }
        setState({
            logId: item.id,
            isOpenLog: true,
            logCreatedBy: { value: item?.created_by?.id, label: item?.created_by?.username },
            details: item.details,
            logStage: { value: item?.log_stage?.id, label: item?.log_stage?.stage },
            focus_segment: { value: item?.focus_segment?.id, label: item?.focus_segment?.name },
            follow_up_date_time: item?.follow_up_date_time ? new Date(item?.follow_up_date_time) : null,
        });
    };

    const clearContactData = () => {
        setState({
            isOpenEdit: false,
            errors: '',
            createContactLoad: false,
        });
        getDate();
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
        });
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Lead', path: `viewLead?id=${redux?.leadId}` },
        { label: 'Contact', path: '' },
    ];
    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="relative h-[100vh]  overflow-scroll bg-[#dbe7ff] bg-cover p-2">
            <Breadcrumb items={breadcrumbItems} />

            <div className="panel  flex items-center justify-between gap-5">
                <div className="flex items-center gap-5 pl-3">
                    <h5 className="text-lg font-semibold dark:text-white-light">{`${capitalizeFLetter(state.data?.name)} (Contact)`}</h5>
                </div>
                {state.logList?.length == 0 && (
                    <button type="button" className="btn btn-primary " onClick={() => setState({ isOpenLog: true })}>
                        Add Log
                    </button>
                )}
            </div>
            <div className=" mt-2 grid grid-cols-12  gap-2">
                <div className=" col-span-12 flex flex-col   md:col-span-5">
                    <div className="panel flex flex-col gap-3 rounded-2xl p-3">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                    <IconUser className="text-[#82de69]" />
                                </div>
                                <div className=" " style={{ fontSize: '20px' }}>
                                    Basic Information
                                </div>
                            </div>

                            <TooltipButton onClick={() => setState({ isOpenEdit: true })} icon={<IconEdit />} tipTitle="Edit Contact" />
                        </div>
                        <ViewLabel label={'Name'} value={state.data?.name} />
                        <ViewLabel label={'Email'} value={state.data?.email_id} />
                        <ViewLabel label={'Phone'} value={state.data?.phone_number} />
                        <ViewLabel label={'Status'} value={state.data?.status?.status} />
                        <ViewLabel label={'Lead Source'} value={state.data?.lead_source?.source} />
                        <ViewLabel label={'Lead'} value={state.data?.lead?.name} />
                        <ViewLabel label={'Department'} value={state.data?.department} />
                        <ViewLabel label={'Designation'} value={state.data?.designation} />
                    </div>
                </div>
                {state.logList?.length > 0 && (
                    <div className="panel col-span-12 flex flex-col gap-3 rounded-2xl p-3 md:col-span-7">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                    <IconUser className="text-[#82de69]" />
                                </div>
                                <div className=" " style={{ fontSize: '20px' }}>
                                    Log History {`(${state.logList?.length})`}
                                </div>
                            </div>

                            <TooltipButton onClick={() => setState({ isOpenLog: true })} icon={<IconPlus />} tipTitle="Add Log" />
                        </div>
                        <div className="max-h-[600px] overflow-y-scroll">
                            <LogCard data={state.logList} onPress={(item) => router.push(`/opportunity?id=${item.id}`)} onEdit={(item) => onEditLog(item)} editIcon={true} />
                        </div>
                    </div>
                )}
            </div>
            <Modal
                open={state.isOpenLog}
                addHeader={state.logId ? 'Update Log' : 'Create Log'}
                close={() => clearLogData()}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 p-5">
                       
                        <CustomSelect
                            title="Log Stage"
                            value={state.logStage}
                            onChange={(e) => setState({ logStage: e })}
                            placeholder={'Log Stage'}
                            options={state.logStageList}
                            error={state.errors?.logStage}
                            required
                        />
                        <CustomeDatePicker value={state.follow_up_date_time} title="Follow Up" onChange={(e) => setState({ follow_up_date_time: e })} />

                        <TextArea height="150px" value={state.details} onChange={(e) => setState({ details: e })} placeholder={'Details'} title={'Details'} />
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".pdf,.doc,.docx,.txt"
                            isImageAllowed={false}
                            value={state.file}
                        />
                        <div className="mt-3 flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => clearLogData()}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => createAndLog()}>
                                {state.logLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />

            <SideMenu
                open={state.isOpenEdit}
                close={() => clearContactData()}
                cancelOnClick={() => clearContactData()}
                submitOnClick={() => updateContact()}
                submitLoading={state.createContactLoad}
                title={'Update Contact'}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 ">
                        <TextInput title="Name" value={state.contact_name} onChange={(e) => setState({ contact_name: e })} placeholder={'Name'} error={state.errors?.contact_name} required />
                        <TextInput
                            title="Designation"
                            value={state.designation}
                            onChange={(e) => setState({ designation: e })}
                            placeholder={'Designation'}
                            error={state.errors?.designation}
                            required
                        />
                        <TextInput title="Department" value={state.department} onChange={(e) => setState({ department: e })} placeholder={'Department'} error={state.errors?.department} required />
                        <NumberInput
                            title="Phone Number"
                            value={state.phoneNumber}
                            onChange={(e) => setState({ phoneNumber: e })}
                            placeholder={'Phone Number'}
                            error={state.errors?.phoneNumber}
                            required
                        />
                        <TextInput title="Email" value={state.email} onChange={(e) => setState({ email: e })} placeholder={'Email'} error={state.errors?.email} required />
                        <CustomSelect
                            title="Lead Source"
                            value={state.lead_source}
                            onChange={(e) => setState({ lead_source: e })}
                            placeholder={'Lead Source'}
                            options={state.leadSourceList}
                            error={state.errors?.lead_source}
                            required
                        />{' '}
                        <CustomSelect
                            title="Contact Status"
                            value={state.contact_status}
                            onChange={(e) => setState({ contact_status: e })}
                            placeholder={'Contact Status'}
                            options={state.statusList}
                            error={state.errors?.contact_status}
                            required
                        />
                    </div>
                )}
            />
        </div>
    );
}
