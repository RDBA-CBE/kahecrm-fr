import React, { useEffect } from 'react';
import CommonLoader from './elements/commonLoader';
import { Dropdown, Failure, Success, capitalizeFLetter, convertUrlToFile, getFileNameFromUrl, objIsEmpty, roundOff, showDeleteAlert, useSetState } from '@/utils/functions.utils';
import { useRouter } from 'next/router';
import Models from '@/imports/models.import';
import { useDispatch } from 'react-redux';
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
import Link from 'next/link';
import Dropdowns from '../components/Dropdown';
import IconTrash from '@/components/Icon/IconTrash';
import { Badge, Card, SimpleGrid, Text, Title } from '@mantine/core';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import IconArrowDown from '@/components/Icon/IconArrowDown';
import MenuPopup from '@/components/MenuPopup';
import IconHorizontalDots from '@/components/Icon/IconHorizontalDots';
import IconVerticalDots from '@/components/Icon/IconVerticalDots';
import IconMenu from '@/components/Icon/IconMenu';
import IconPencil from '@/components/Icon/IconPencil';
import IconPencilPaper from '@/components/Icon/IconPencilPaper';
import { LEADTYPE } from '@/utils/constant.utils';

export default function ViewLead() {
    const router = useRouter();

    const id = router?.query?.id;

    const dispatch = useDispatch();

    const [state, setState] = useSetState({
        loading: false,
        data: {},
        isOpen: false,
        contactList: [],
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
        logtype: '',
        role: '',

        logStage: null,
        follow_up_date_time: null,
        assigned_to: null,
        // assignment_note: '',
        details: '',
        isEditLead: false,
        stateList: [],
        verticalList: [],
        marketSegmentList: [],
        countryList: [],
        leadManagerList: [],
        tagList: [],
        DropContactList: [],
        contactPage: 1,
        logAssignRole: null,
        logAssignList: [],
    });

    useEffect(() => {
        getDate();
        // getContactList();
        verticalList();
        getContactStatusList();
        getContactLeadSourceList();
        createdByList();
        getLogList();
        departmentList();
        currencyList();
        oppstageList();
        ownerList();
        getLeadOwnerByLeadId();
        getLogStageList();
        userList();
        focusSegmentList();
        statusList();
        countryList();
        getMarketSegmentList();
        leadManagerList();
        tagList();
        contactList();
    }, [id]);

    useEffect(() => {
        if (state.logtype) {
            if (state.logtype !== 'include_opportunity') {
                getLogListFilter();
            } else {
                getExcludeOppLogListFilter();
            }
        } else {
            getLogList();
        }
    }, [state.logtype]);

    useEffect(() => {
        if (state.assignRole) {
            if (state.assignRole?.value == 'owner') {
                DropOwnerList();
            } else if (state.assignRole?.value == 'bdm') {
                bdmList();
            } else {
                bdeList();
            }
        }
    }, [state.assignRole]);

    useEffect(() => {
        if (state.logAssignRole) {
            if (state.logAssignRole?.value == 'owner') {
                logOwnerList();
            } else if (state.logAssignRole?.value == 'bdm') {
                logBdmList();
            } else {
                logBdeList();
            }
        }
    }, [state.logAssignRole]);

    const getDate = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.details(id);
            const result: any = await Models.auth.userDetails();
            let primary_contact = res?.primary_contact;
            setState({
                loading: false,
                ...res,
                contact: !objIsEmpty(primary_contact) && primary_contact?.name ? { value: primary_contact?.id, label: primary_contact?.name } : null,
                focus_segment: !objIsEmpty(res.focus_segment) ? { value: res.focus_segment?.id, label: res.focus_segment?.focus_segment } : null,
                market_segment: !objIsEmpty(res.market_segment) ? { value: res.market_segment?.id, label: res.market_segment?.market_segment } : null,
                opportunity_status: !objIsEmpty(res.opportunity_status) ? { value: res.opportunity_status?.id, label: res.opportunity_status?.name } : null,
                lead_owner: !objIsEmpty(res.lead_owner) ? { value: res.lead_owner?.id, label: `${res.lead_owner?.first_name} ${res.lead_owner?.last_name}` } : null,
                country: !objIsEmpty(res.country) ? { value: res.country?.id, label: res.country?.country_name } : null,
                state: !objIsEmpty(res.state) ? { value: res.state?.id, label: res.state?.state_name } : null,
                tags: res.tags?.map((item) => ({ value: item?.id, label: item?.tag })) || [],
                is_active: res.is_active ?? false,
                created_by: !objIsEmpty(res.created_by) ? { value: res.created_by?.id, label: res.created_by?.username } : null,
                vertical: !objIsEmpty(res.focus_segment) ? { value: res.focus_segment?.vertical?.id, label: res.focus_segment?.vertical?.vertical } : null,
                lead_type: res.lead_type ? { value: res.lead_type, label: res.lead_type } : null,
                assigned_to: !objIsEmpty(res.assigned_to) ? { value: res.assigned_to?.id, label: `${res.assigned_to?.first_name} ${res.assigned_to?.last_name}` } : null,
                status: !objIsEmpty(res.lead_status) ? { value: res.lead_status?.id, label: res.lead_status?.name } : null,
                primary_contact: res.primary_contact,
                company_number: res?.primary_contact?.phone_number,
                company_email: res?.primary_contact?.email_id,
                contact_name: primary_contact?.name,
                email_id: primary_contact?.email_id,
                phone_number: primary_contact?.phone_number ? primary_contact?.phone_number : null,
                designation: primary_contact?.designation,
                department: !objIsEmpty(primary_contact?.department) ? { value: primary_contact?.department?.id, label: primary_contact?.department?.department } : null,
                lead_source: !objIsEmpty(primary_contact?.lead_source) ? { value: primary_contact?.lead_source?.id, label: primary_contact?.lead_source?.source } : null,
                source_from: primary_contact?.source_from ? primary_contact?.source_from : null,
                contact_status: !objIsEmpty(primary_contact?.status) ? { value: primary_contact?.status?.id, label: primary_contact?.status?.status } : null,
                city: !objIsEmpty(res.city) ? { value: res.city?.id, label: res.city?.city_name } : null,
            });
            assignRole(res?.assigned_to);
            getFocusSegmentList({ value: res.focus_segment?.vertical?.id });
            stateList({ value: res.country?.id });
            cityList({ value: res.city?.id });

            setState({ role: result?.designation });

            const primary = res?.primary_contact;
            setState({
                loading: false,
                data: res,
                isOpenLeadInfo: true,
                primary_contact: primary ? { value: primary?.id, label: primary?.name } : null,
                contactList: res.contacts,
                primary_contact_list: res.contacts?.length > 0 ? Dropdown(res.contacts, 'name') : [],
                opportunityList: res?.opportunities,
            });
            localStorage.setItem('LeadId', res?.id);
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const oppstageList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.oppStageList();
            const dropdownList = Dropdown(res?.results, 'stage');
            setState({ oppStageList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const focusSegmentList = async () => {
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

    const currencyList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.opportunity.oppDropdowns('currency_type');
            const dropdownList = Dropdown(res, 'currency_short');
            setState({ currencyList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const ownerList = async () => {
        try {
            setState({ loading: true });
            const res = await Models.lead.dropdowns('owner');
            const dropdownList = Dropdown(res, 'username');
            setState({ ownerList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getLogList = async () => {
        try {
            const res: any = await Models.lead.logList(id);
            setState({ logList: res?.results, loading: false, logCount: res.count });
        } catch (error) {
            console.log('error: ', error);
            setState({ loading: false });
        }
    };

    const getLogListFilter = async () => {
        try {
            let statusId = null;
            if (state.logtype == 'Meeting') {
                statusId = 'Meeting';
            }
            if (state.logtype == 'Call') {
                statusId = 'Call';
            }
            if (state.logtype == 'Email') {
                statusId = 'Email';
            }
            const res: any = await Models.lead.logFilterList(id, statusId);
            setState({ logList: res?.results, loading: false, logCount: res.count });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getExcludeOppLogListFilter = async () => {
        try {
            const res: any = await Models.lead.excludeOpplogList(id);
            setState({ logList: res?.results, loading: false, logCount: res.count });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getLogStageList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.stageList();
            const dropdownList = Dropdown(res.results, 'stage');
            setState({ stageList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
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
            const res: any = await Models.lead.sourceList();
            const dropdownList = Dropdown(res.results, 'source');
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

    const createContact = async () => {
        try {
            setState({ createContactLoad: true, errors: {} });

            const validateField = {
                contact_status: state.contact_status?.value,
                lead_source: state.lead_source?.value,
                source_from: state.source_from,
                department: state.department,
                designation: state.designation,
                phoneNumber: state.phoneNumber,
                email: state.email,
                contact_name: state.contact_name,
                company_name: state.company_name,
            };

            const body = {
                lead: id,
                status: state.contact_status?.value,
                lead_source: state.lead_source?.value,
                source_from: state.source_from,
                created_by: 1,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phoneNumber?.trim(),
                email_id: state.email?.trim(),
                is_active: state.is_active,
                name: state.contact_name?.trim(),
                company_name: state.company_name?.trim(),
            };

            await Validation.createContact.validate(validateField, { abortEarly: false });

            await Models.contact.create(body);
            Success('Contact created successfully');
            clearContactData();
            getDate();
            contactList();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = error.inner.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {});
                setState({ errors: validationErrors });
            } else {
                console.log('Error: ', error?.message);
            }
        } finally {
            setState({ createContactLoad: false });
        }
    };

    const updateContact = async () => {
        try {
            setState({ createContactLoad: true });
            const validateField = {
                contact_status: state.contact_status?.value,
                lead_source: state.lead_source?.value,
                source_from: state.source_from,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phone_number,
                email_id: state.email_id?.trim(),
                contact_name: state.contact_name?.trim(),
                company_name: state.company_name?.trim(),
                remark: state.remark?.trim(),
            };
            const body = {
                lead: id,
                status: state.contact_status?.value,
                lead_source: state.lead_source?.value,
                source_from: state.source_from?.trim(),
                // created_by: state.createdby?.value,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phone_number ? state.phone_number?.trim() : null,
                email_id: state.email_id?.trim(),
                is_active: state.is_active,
                name: state.contact_name?.trim(),
                company_name: state.company_name?.trim(),
                remark: state.remark?.trim(),
            };
            await Validation.createContact.validate(validateField, { abortEarly: false });

            const res = await Models.contact.update(body, state.contactId);
            Success('Contact updated successfully');
            clearContactData();
            getDate();
            contactList();
            setState({ createContactLoad: false });
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
        }
    };

    const createAndUpdateOpportunity = async () => {
        try {
            setState({ oppLoading: true });

            const validateField = {
                opp_name: state.opp_name,
                owner: state.owner?.value,
                opp_stage: state.opp_stage?.value,
                opportunity_value: state.opportunity_value,
                recurring_value_per_year: state.recurring_value_per_year,
                currency_type: state.currency_type?.value,
                closing_date: state.opp_closing_date ? moment(state.opp_closing_date).format('YYYY-MM-DD') : '',
                probability_in_percentage: state.probability_in_percentage,
            };

            // const body = {
            //     lead: id,
            //     name: state.opp_name,
            //     owner: state.owner?.value,
            //     stage: state.opp_stage?.value,
            //     opportunity_value: state.opportunity_value,
            //     recurring_value_per_year: state.recurring_value_per_year,
            //     currency_type: state.currency_type?.value,
            //     closing_date: state.opp_closing_date ? moment(state.opp_closing_date).format('YYYY-MM-DD') : '',
            //     probability_in_percentage: state.probability_in_percentage,
            //     file: null,
            //     created_by: 1,
            //     is_active: true,
            // };

            const formData = new FormData();

            formData.append('lead', id as string);
            formData.append('name', state.opp_name || '');
            formData.append('owner', state.owner?.value || '');
            formData.append('stage', state.opp_stage?.value || '');
            formData.append('opportunity_value', state.opportunity_value || '');
            formData.append('recurring_value_per_year', state.recurring_value_per_year || '');
            formData.append('currency_type', state.currency_type?.value || '');
            formData.append('closing_date', state.opp_closing_date ? moment(state.opp_closing_date).format('YYYY-MM-DD') : '');
            formData.append('probability_in_percentage', state.probability_in_percentage || '');
            if (state.file && state.file instanceof File) {
                formData.append('file', state.file);
            } else {
                formData.append('file', ''); // Make sure to append the file correctly
            }
            await Validation.createOppsValidation.validate(validateField, { abortEarly: false });
            let res;
            if (state.oppId) {
                res = await Models.opportunity.update(formData, state.oppId);
                Success('Opportunity updated successfully');
            } else {
                res = await Models.opportunity.create(formData);
                Success('Opportunity created successfully');
            }
            setState({ oppLoading: false });
            getDate();
            clearOppData();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message; // Set the error message for each field
                });
                setState({ errors: validationErrors });
                setState({ oppLoading: false });
            } else {
                setState({ oppLoading: false });
            }
            setState({ oppLoading: false });
        }
    };

    const onEditCantact = (item) => {
        setState({
            contactId: item.id,
            isOpenCreateContact: true,
            contact_name: item.name,
            designation: item.designation,
            email_id: item.email_id,
            department: !objIsEmpty(item.department) ? { value: item.department?.id, label: item.department?.department } : null,
            is_active: item.is_active,
            lead_source: { value: item?.lead_source?.id, label: item?.lead_source?.source },
            createdby: { value: item?.created_by?.id, label: item?.created_by?.username },
            contact_status: item?.status ? { value: item?.status?.id, label: item?.status?.status } : null,
            company_name: id == null ? item.company_name : null,
            source_from: item.source_from ? item.source_from : '',
            remark: item.remark,
            phone_number: item.phone_number ? item.phone_number : '',
        });
    };

    const clearContactData = () => {
        setState({
            contact_name: '',
            department: '',
            designation: '',
            phoneNumber: '',
            email: '',
            lead_source: '',
            source_from: '',
            createdby: '',
            contact_status: '',
            is_active: false,
            contactId: '',
            isOpenCreateContact: false,
            errors: '',
            createContactLoad: false,
            company_name: '',
        });
    };

    const clearOppData = () => {
        setState({
            oppId: '',
            opp_name: '',
            owner: '',
            opportunity_value: '',
            recurring_value_per_year: '',
            currency_type: '',
            probability_in_percentage: '',
            opp_created_by: '',
            opp_closing_date: '',
            opp_stage: '',
            isOpenOpp: false,
            oppLoading: false,
            errors: '',
            file: null,
        });
        getLeadOwnerByLeadId();
    };

    const editOppData = async (row) => {
        // dispatch(leadId(id));
        router.push(`/update_opportunity?id=${row?.id}`);
        // console.log('row: ', row);
        // if (row?.file_url) {
        //     const fileName = getFileNameFromUrl(row?.file_url);
        //     const files = await convertUrlToFile(row?.file_url, fileName);
        //     setState({ file: files });
        // }
        // setState({
        //     oppId: row.id,
        //     isOpenOpp: true,
        //     opp_name: row.name,
        //     owner: { value: row.owner.id, label: row.owner.username },
        //     opportunity_value: row.opportunity_value,
        //     recurring_value_per_year: row.recurring_value_per_year,
        //     currency_type: { value: row.currency_type.id, label: row.currency_type.currency_short },
        //     probability_in_percentage: row.probability_in_percentage,
        //     opp_created_by: { value: row.created_by.id, label: row.created_by.username },
        //     opp_closing_date: new Date(row.closing_date),
        //     opp_stage: row.stage ? { value: row.stage.id, label: row.stage.stage } : null,
        //     notes: row.note,
        // });
    };

    const getProbabilityPercentage = async (e) => {
        try {
            if (e) {
                const res: any = await Models.opportunity.getProbabilityPercentage(e?.value);
                setState({ probability_in_percentage: res.probability });
            } else {
                setState({ probability_in_percentage: '' });
            }
        } catch (error) {}
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
                    task_type: state.task_type?.value,
                    details: state.details,
                    logAssignRole: state.logAssignRole?.value,
                    // assigned_to: state.assigned_to?.value,
                    assigned_to: state.log_assigned_to?.length > 0 ? state.log_assigned_to?.map((item) => item.value) : [],
                    // assignment_note: state.assignment_note,

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
                    lead: id,
                    opportunity: null,
                    // focus_segment: state.focus_segment?.value,
                    follow_up_date_time: state.follow_up_date_time,
                    log_stage: state.logStage?.value,
                    details: state.details,
                    log_type: state.log_type?.value,
                    task_assignment: {
                        // assigned_to: [state.assigned_to?.value], // Keep it as an array
                        assigned_to: state.log_assigned_to.map((item) => item.value),
                        // assignment_note: state.assignment_note,
                    },
                    remark: state.remark,

                    // file:state.file,
                    task_type: state.task_type?.value,
                };
            } else {
                body = {
                    contact: state.primary_contact?.value,
                    lead: id,
                    opportunity: null,
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

    // const createAndUpdateLog = async () => {
    //     console.log('createAndUpdateLog triggered');
    //     try {
    //         setState({ logLoad: true });

    //         const validateField = {
    //             logStage: state.logStage?.value || '',
    //             logType: state.logType?.value || '',
    //             follow_up_date_time: state.follow_up_date_time || null,
    //             assigned_to: state.assigned_to?.label || '',
    //             assignment_note: state.assignment_note || '',
    //         };

    //         const validationSchema = state.follow_up_date_time
    //             ? Validation.createLeadsLog
    //             : Validation.createLeadLog;

    //         await validationSchema.validate(validateField, { abortEarly: false });

    //         const body = {
    //             contact: state.primary_contact?.value || null,
    //             lead: id,
    //             opportunity: null,
    //             follow_up_date_time: state.follow_up_date_time || null,
    //             log_stage: state.logStage?.value || '',
    //             details: state.details || '',
    //             logtype: state.logType?.value || '',
    //             file: state.file || null,
    //             ...(state.follow_up_date_time && {
    //                 task_assignment: { assigned_to: state.assigned_to?.label || '' },
    //                 assignment_note: state.assignment_note || '',
    //             }),
    //         };

    //         if (state.logId) {
    //             await Models.log.update(body, id);
    //             Success('Log updated successfully');
    //         } else {
    //             await Models.log.create(body);
    //             Success('Log created successfully');
    //         }

    //         clearLogData();
    //         getLogList();
    //     } catch (error) {
    //         if (error instanceof Yup.ValidationError) {
    //             const validationErrors = {};
    //             error.inner.forEach((err) => {
    //                 validationErrors[err.path] = err.message;
    //             });
    //             console.log('Validation Errors:', validationErrors);
    //             setState({ errors: validationErrors });
    //         } else {
    //             console.error('Error:', error.message);
    //         }
    //     } finally {
    //         setState({ logLoad: false });
    //     }
    // };

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
            logAssignList: [],
            logAssignRole: null,
        });
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Lead', path: '' },
    ];

    const getLeadOwnerByLeadId = async () => {
        try {
            const res: any = await Models.lead.details(id);
            let lead_owner = res?.lead_owner;
            setState({ owner: { value: lead_owner?.id, label: lead_owner?.username } });
        } catch (error) {}
    };

    const checkboxOptions = [
        { value: 'include_opportunity', label: 'Exclude Opportunity' },
        { value: 'Call', label: 'Call' },
        { value: 'Meeting', label: 'Meeting' },
        { value: 'Email', label: 'Email' },
    ];

    const contactLoadMore = async () => {
        try {
            if (state.hasMoreLead) {
                const role: any = await Models.auth.userDetails();
                // const res: any = await Models.contact.list(state.contactPage + 1, role?.id);
                const res: any = await Models.contact.listByLeadId(id);

                const newOptions = Dropdown(res?.results, 'name');
                const filters = newOptions?.filter((item) => item?.label !== null && item?.label !== '');
                setState({
                    DropContactList: [...state.DropContactList, ...filters],
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

    // const contactList = async (page) => {
    //     try {
    //         const role: any = await Models.auth.userDetails();
    //         const res: any = await Models.contact.list(page, role?.id);
    //         const dropdownList = Dropdown(res.results, 'name');
    //         const filters = dropdownList?.filter((item) => item?.label !== null && item?.label !== '');

    //         setState({ DropContactList: filters, hasMoreLead: res.next });
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // };

    const contactList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.listByLeadId(id);

            const dropdownList = Dropdown(res.results, 'name');
            // setState({ contactList: dropdownList, loading: false });
            setState({ DropContactList: dropdownList, hasMoreLead: res.next });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const assignRole = async (res) => {
        try {
            let role = {};
            if (res !== null && res?.groups?.length > 0) {
                if (res?.groups[0] == 'Admin') {
                    role = { value: 'owner', label: 'Owner' };
                } else if (res?.groups[0] == 'BDM') {
                    role = { value: 'bdm', label: 'BDM' };
                } else {
                    role = { value: 'bde', label: 'BDE' };
                }
                setState({ assignRole: role, loading: false });
            } else {
                setState({ assignRole: null, loading: false });
            }
        } catch (error) {
            setState({ loading: false, assignRole: null });

            console.log('error: ', error);
        }
    };

    const verticalList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.GetDropdown('verticals');
            const dropdownList = Dropdown(res?.results, 'vertical');
            setState({ verticalList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
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

    const DropOwnerList = async () => {
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

    const logOwnerList = async () => {
        try {
            const res: any = await Models.lead.ownerList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ logAssignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const logBdmList = async () => {
        try {
            const res: any = await Models.lead.bdmList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ logAssignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const logBdeList = async () => {
        try {
            const res: any = await Models.lead.bdeList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ logAssignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
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
                    lead_owner: state.lead_owner?.value,
                    // tags: tags,
                    is_active: true,
                    // assigned_to: state.assigned_to?.value,
                    // status: state.status?.value,
                    // remark: state.remark,
                    contact_id: state.contact?.value,
                    //For contact
                    // contact_name: state.contact_name,
                    // email_id: state.email_id,
                    // designation: state.designation,
                    // department: state.department?.value,
                    // phone_number: state.phone_number? state.phone_number:null,
                    // lead_source: state.lead_source?.value,
                    // contact_remark: state.contact_remark,
                    is_archive: false,
                    // source_from: state.source_from,
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
                    lead_owner: state.lead_owner?.value,
                    tags: tags,
                    is_active: true,
                    assigned_to: !objIsEmpty(state.assigned_to) ? state.assigned_to?.value : null,
                    lead_status: state.status?.value,
                    remark: state.remark,
                    contact_id: state.contact?.value,
                };


                await Validation.createLeadValidations.validate(body, { abortEarly: false });
                const res: any = await Models.lead.update(lead, id);
                if (res?.data?.id) {
                    updateContacts(res?.data?.id);
                } else {
                    setState({ submitLoad: false });
                }
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
                name: state.contact_name,
                email_id: state.email_id,
                designation: state.designation,
                department: state.department?.value,
                phone_number: state.phone_number,
                lead_source: state.lead_source?.value,
                remark: state.contact_remark,
                is_archive: false,
                source_from: state.source_from,
                status: state.contact_status?.value,
                is_active: true,
                moveToLead: true,
            };

            await Models.contact.update(body, state.contact?.value);
            setState({ submitLoad: false });
            Success('Lead updated successfully');
            setState({ isEditLead: false });
            getDate();
        } catch (error) {
            setState({ submitLoad: false });

            console.log('error: ', error);
        }
    };

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="  relative  h-auto bg-[#dbe7ff] bg-cover p-2 ">
            <Breadcrumb items={breadcrumbItems} />

            <div className=" panel flex flex-wrap items-center justify-between gap-5 pl-3 pr-3">
                <div className="flex items-center gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                        <img src="/assets/images/profile-1.jpeg" style={{ objectFit: 'cover' }} />

                        {/* <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/auth/user.png" alt="userProfile" /> */}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">LEAD</p>

                        <h5 className="text-lg font-semibold dark:text-white-light">{`${capitalizeFLetter(state.data?.name)}`}</h5>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {/* <button type="button" className="btn btn-outline-primary" onClick={() => router.push(`/updateLead?id=${id}`)}>
                        <IconEdit />
                    </button> */}
                    {state.isEditLead == true ? (
                        <div className="flex flex-wrap  items-center gap-3">
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
                                required
                                className="lg:w-[200px]"
                            />
                            <CustomSelect
                                value={state.assigned_to}
                                onChange={(e) => setState({ assigned_to: e })}
                                placeholder={'Assign To'}
                                options={state.assignList}
                                error={state.errors?.assigned_to}
                                required
                                className="lg:w-[200px]"
                            />

                            {/* <div>
                                <CustomSelect
                                    value={state.status}
                                    onChange={(e) => setState({ status: e })}
                                    placeholder={'Status'}
                                    options={state.statusList}
                                    error={state.errors?.status}
                                    required
                                    className="w-[200px]"
                                />
                            </div> */}
                        </div>
                    ) : (
                        <>
                            {' '}
                            {state.data?.assigned_to && (
                                <div className="flex flex-col p-2 ">
                                    <div className="text-md text-gray-600">Assigned To</div>
                                    <div className="text-[18px]">
                                        {`${capitalizeFLetter(state.data?.assigned_to?.first_name)} 
  ${state.data?.assigned_to?.last_name}`}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* {state.data?.lead_status?.name && (
                        <div className="flex flex-col p-2 ">
                            <div className="text-md text-gray-600">Status</div>
                            <div className="text-[18px]">{state.data?.lead_status?.name}</div>
                        </div>
                    )} */}
                </div>
            </div>
            {state.isEditLead == true && (
                <div className="panel mt-2">
                    <label className="block text-sm font-bold text-gray-700">
                        Select Primary Contact<span className="pl-1 text-red-500">*</span>
                    </label>
                    <CustomSelect
                        value={state.contact}
                        onChange={(e) => {
                            handleSelectedContact(e);
                        }}
                        isSearchable={true}
                        placeholder={'Select Contact'}
                        options={state.DropContactList}
                        className=" lg:w-2/3"
                        loadMore={() => contactLoadMore()}
                    />
                </div>
            )}

            <div className="panel mt-2 rounded-2xl p-3">
                {state.isEditLead == true ? (
                    <div className={`mt-1 flex w-full ${!objIsEmpty(state.contact) ? 'flex-wrap space-x-0' : 'flex-wrap'} `}>
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
                            </div>
                        </div>
                        {!objIsEmpty(state.contact) && (
                            <div className="w-full md:w-1/3">
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

                                        <TextInput
                                            title="Name"
                                            value={state.contact_name}
                                            onChange={(e) => setState({ contact_name: e })}
                                            placeholder={' Name'}
                                            // error={state.errors?.contact_name}
                                            // required
                                        />
                                        <TextInput title="Email" value={state.email_id} onChange={(e) => setState({ email_id: e })} placeholder={'Email'} error={state.errors?.email_id} />
                                        <NumberInput
                                            title="Phone Number"
                                            value={state.phone_number}
                                            onChange={(e) => setState({ phone_number: e })}
                                            placeholder={'Phone Number'}
                                            // error={state.errors?.phone_number}
                                            // required
                                        />
                                        <TextInput
                                            title="Designation"
                                            value={state.designation}
                                            onChange={(e) => setState({ designation: e })}
                                            placeholder={'Designation'}
                                            // error={state.errors?.designation}
                                            // required
                                        />
                                        <CustomSelect
                                            value={state.department}
                                            onChange={(e) => setState({ department: e })}
                                            placeholder={'Department'}
                                            title={'Department'}
                                            options={state.departmentList}
                                            // error={state.errors?.department}
                                            // required
                                        />

                                        <CustomSelect
                                            value={state.lead_source}
                                            onChange={(e) => setState({ lead_source: e })}
                                            placeholder={'Lead Source'}
                                            title={'Lead Source'}
                                            options={state.leadSourceList}
                                            // error={state.errors?.lead_source}
                                            // required
                                        />
                                        <TextArea
                                            height="120px"
                                            value={state.source_from}
                                            onChange={(e) => setState({ source_from: e })}
                                            placeholder={'Source From'}
                                            title={'Source From'}
                                            // required
                                            // error={state.errors?.source_from}
                                        />
                                        <CustomSelect
                                            value={state.contact_status}
                                            onChange={(e) => setState({ contact_status: e })}
                                            placeholder={'Status'}
                                            title={'Status'}
                                            options={state.statusList}
                                            // error={state.errors?.contact_status}
                                            // required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-full md:w-1/3' : 'w-full md:w-1/2'}`}>
                            <div className="panel col-span-12  flex h-[720px]  flex-col gap-5 rounded-2xl p-3 md:col-span-7">
                                <div className="  flex items-center gap-3">
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#ffefe4]">
                                        <IconUser className="text-[#ffbb55]" />
                                    </div>
                                    <div className=" " style={{ fontSize: '20px' }}>
                                        More Information
                                    </div>
                                </div>

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
                                <CustomSelect
                                    title="Lead Manager"
                                    value={state.lead_owner}
                                    onChange={(e) => setState({ lead_owner: e })}
                                    placeholder={'Lead Manager'}
                                    options={state.leadManagerList}
                                    error={state.errors?.lead_owner}
                                    disabled
                                />
                                <CustomSelect
                                    title="Tags"
                                    value={state.tags}
                                    isMulti={true}
                                    onChange={(e) => setState({ tags: e })}
                                    placeholder={'Tags'}
                                    options={state.tagList}
                                    // error={state.errors?.tags}
                                />

                                <TextArea
                                    height="120px"
                                    value={state.remark}
                                    onChange={(e) => setState({ remark: e })}
                                    placeholder={'Remark'}
                                    title={'Remark'}
                                    // error={state.errors?.remark} required
                                />

                                <div className=" flex items-center justify-end gap-3">
                                    <button type="button" className="btn btn-outline-danger border " onClick={() => setState({ isEditLead: false })}>
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
                ) : (
                    <div className=" cursor-pointer items-center gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  " onClick={() => setState({ isOpenLeadInfo: !state.isOpenLeadInfo })}>
                                    {state.isOpenLeadInfo ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                                </div>
                                <div className="text-xl font-bold ">Lead Information</div>
                            </div>
                            <div onClick={() => setState({ isEditLead: true, isOpenLeadInfo: true })}>
                                <IconPencilPaper />
                            </div>
                        </div>
                        {state.isOpenLeadInfo && (
                            <>
                                <div className="mt-1 flex w-full  flex-wrap">
                                    <div className={`mt-1  w-full md:w-1/3`}>
                                        <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                                    <IconUser className="text-[#82de69]" />
                                                </div>
                                                <div className=" " style={{ fontSize: '20px' }}>
                                                    Company Information
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {state.data?.company_website && (
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Website</div>
                                                        <div className="text-[18px]">
                                                            <Link href={state.data?.company_website} target="_blank">
                                                                {state.data?.company_website}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">Company Vertical</div>
                                                    <div className="text-[18px]">{state.data?.focus_segment?.vertical?.vertical}</div>
                                                </div>{' '}
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">Company Segment</div>
                                                    <div className="text-[18px]">{state.data?.focus_segment?.focus_segment}</div>
                                                </div>{' '}
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">Address</div>
                                                    <div className="text-[18px]">{state.data?.address}</div>
                                                </div>{' '}
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">Country</div>
                                                    <div className="text-[18px]">{state.data?.country?.country_name}</div>
                                                </div>{' '}
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">State</div>
                                                    <div className="text-[18px]">{state.data?.state?.state_name}</div>
                                                </div>{' '}
                                                <div className="flex flex-col p-2 ">
                                                    <div className="text-md text-gray-600">City</div>
                                                    <div className="text-[18px]">{state.data?.city?.city_name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-1 w-full md:w-1/3">
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
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Name</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.name}</div>
                                                    </div>
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Email</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.email_id}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Phone Number</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.phone_number}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Designation</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.designation}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Department</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.department?.department}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Lead Source</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.lead_source?.source}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Source Details</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.source_from}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Status</div>
                                                        <div className="text-[18px]">{state.data?.primary_contact?.status?.status}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`mt-1 w-full md:w-1/3`}>
                                        <div className=" col-span-12 flex flex-col   md:col-span-5">
                                            <div className="panel mt-1 flex flex-col gap-5 rounded-2xl p-3 pb-5">
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
                                                    {state.data?.annual_revenue && (
                                                        <div className="flex flex-col p-2 ">
                                                            <div className="text-md text-gray-600">Annual Revenue</div>
                                                            <div className="text-[18px]">{state.data?.annual_revenue}</div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Income Lead</div>
                                                        <div className="text-[18px]">{state.data?.market_segment?.market_segment}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Lead Type</div>
                                                        <div className="text-[18px]">{state.data?.lead_type}</div>
                                                    </div>{' '}
                                                    <div className="flex flex-col p-2 ">
                                                        <div className="text-md text-gray-600">Lead Manager</div>
                                                        <div className="text-[18px]">{`${capitalizeFLetter(state.data?.lead_owner?.first_name)} ${state.data?.lead_owner?.last_name} `}</div>
                                                    </div>{' '}
                                                    {state.data?.tags?.length > 0 && (
                                                        <div className="flex flex-col p-2 ">
                                                            <div className="text-md text-gray-600">Tags</div>
                                                            <div className="text-[18px]">{state.data?.tags?.map((tagName) => tagName?.tag).join(', ')}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            {state?.role !== 'DM' && (
                // Your JSX or other code to render when the condition is true
                <>
                    <>
                        <div className=" panel  col-span-12 mt-2 flex flex-col gap-5 rounded-2xl p-3 md:col-span-12">
                            <div className="flex justify-between">
                                <div className="flex w-full justify-between">
                                    <div className="flex cursor-pointer items-center gap-3" onClick={() => setState({ isOpenContact: !state.isOpenContact })}>
                                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                            {state.isOpenContact ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                                        </div>
                                        <div className="text-xl font-bold ">Contacts</div>

                                        <div className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white" style={{ fontSize: '18px' }}>
                                            {state.contactList?.length}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary p-1"
                                        onClick={() => {
                                            dispatch(leadId(id));
                                            router.push(`/create_contacts?leadid=${id}`);
                                        }}
                                    >
                                        <IconPlus />
                                    </button>
                                </div>
                            </div>
                            {state.contactList?.length > 0 && state.isOpenContact && (
                                <div className=" overflow-y-scroll">
                                    <DataTable
                                        className="table-responsive"
                                        records={state.contactList}
                                        columns={[
                                            {
                                                accessor: 'name',

                                                title: 'Name',
                                            },
                                            {
                                                accessor: 'email_id',

                                                title: 'Email',
                                            },
                                            {
                                                accessor: 'phone_number',

                                                title: 'Phone Number',
                                            },

                                            {
                                                accessor: 'designation',

                                                title: 'Designation',
                                                render: (row: any) => <div>{row.designation}</div>,
                                            },
                                            {
                                                accessor: 'department.department',

                                                title: 'Department',
                                                render: (row: any) => <div>{row?.department?.department}</div>,
                                            },

                                            {
                                                accessor: 'created_by.username',
                                                title: 'Source',
                                                render: (row: any) => <div>{row?.lead_source?.source}</div>,
                                            },
                                            {
                                                accessor: 'created_on',

                                                title: 'Date',
                                                render: (row: any) => <div>{moment(row?.created_on).format('DD-MM-YYYY')}</div>,
                                            },
                                            {
                                                accessor: 'actions',
                                                title: 'Actions',
                                                render: (row: any) => (
                                                    <div className="mx-auto flex w-max items-center gap-4">
                                                        {/* <button
                                                    type="button"
                                                    className="flex hover:text-danger"
                                                    onClick={() => {
                                                        dispatch(oppId(row?.id));
                                                        dispatch(leadId(row?.lead?.id));

                                                        router.push(`/viewOpportunity?id=${row.id}`);
                                                    }}
                                                >
                                                    <IconEye />
                                                </button> */}
                                                        <button className="flex hover:text-info" onClick={() => onEditCantact(row)}>
                                                            <IconEdit className="h-4.5 w-4.5" />
                                                        </button>
                                                    </div>
                                                ),
                                            },
                                        ]}
                                        highlightOnHover
                                        totalRecords={state.contactList?.length}
                                        recordsPerPage={state.pageSize}
                                        minHeight={200}
                                        page={null}
                                        onPageChange={(p) => {}}
                                        withBorder={true}
                                        selectedRecords={state.selectedRecords}
                                        onSelectedRecordsChange={(val) => {
                                            setState({ selectedRecords: val });
                                        }}
                                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                    <>
                        <div className=" panel  col-span-12 mt-2 flex flex-col gap-5 rounded-2xl p-3 md:col-span-12">
                            <div className="flex justify-between">
                                <div className="flex w-full justify-between">
                                    <div className="flex cursor-pointer items-center gap-3" onClick={() => setState({ isOpenOppo: !state.isOpenOppo })}>
                                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                            {state.isOpenOppo ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                                        </div>
                                        <div className="text-xl font-bold ">Opportunities</div>

                                        <div className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white" style={{ fontSize: '18px' }}>
                                            {state.opportunityList?.length}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary p-1"
                                        onClick={() => {
                                            dispatch(leadId(id));
                                            router.push(`/create_opportunity?leadid=${id}`);
                                        }}
                                    >
                                        <IconPlus />
                                    </button>
                                </div>
                            </div>
                            {state.opportunityList?.length > 0 && state.isOpenOppo && (
                                <div className=" overflow-y-scroll">
                                    <DataTable
                                        className="table-responsive"
                                        records={state.opportunityList}
                                        columns={[
                                            {
                                                accessor: 'primary_contact.name',

                                                title: 'Contact Name',
                                            },
                                            {
                                                accessor: 'name',

                                                title: 'Opportunity Name',
                                                render: (row: any) => (
                                                    <div>
                                                        {row?.name?.name} {/* {row?.opportunity_keyword && `(${row?.opportunity_keyword})`} */}
                                                    </div>
                                                ),
                                            },
                                            { accessor: 'opportunity_value', title: 'Opportunity Value', render: (row: any) => <div>{roundOff(row?.opportunity_value)}</div> },
                                            { accessor: 'probability_in_percentage', title: 'Probability (%)' },
                                            // { accessor: 'recurring_value_per_year',  title: 'Recurring Value ', render: (row: any) => <div>{roundOff(row?.recurring_value_per_year)}</div> },
                                            { accessor: 'stage.stage', title: 'Stage' },
                                            // { accessor: 'currency',  title: 'Currency Type' },
                                            {
                                                accessor: 'opportunity_status.name',

                                                title: 'Status',
                                                render: (row: any) => (
                                                    <div
                                                        className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                                            row?.opportunity_status?.name === 'Inquired'
                                                                ? 'bg-pink-100 text-pink-800'
                                                                : row?.opportunity_status?.name === 'Appointments'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : row?.opportunity_status?.name === 'Opportunity'
                                                                ? 'bg-green-100 text-green-800'
                                                                : row?.opportunity_status?.name === 'Proposal'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : row?.opportunity_status?.name === 'Leads'
                                                                ? 'bg-teal-100 text-teal-800'
                                                                : row?.opportunity_status?.name === 'Income'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : row?.opportunity_status?.name === 'Meetings'
                                                                ? 'bg-green-100 text-green-800'
                                                                : row?.opportunity_status?.name === 'Prospect'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : row?.opportunity_status?.name === 'Deal Won'
                                                                ? 'bg-green-100 text-green-800'
                                                                : row?.opportunity_status?.name === 'Deal Lose'
                                                                ? 'bg-red-300 text-red-800'
                                                                : row?.opportunity_status?.name === "Don't have our budget"
                                                                ? 'bg-red-200 text-red-800'
                                                                : row?.opportunity_status?.name === 'Idea in hold'
                                                                ? 'bg-red-100 text-red-800'
                                                                : row?.opportunity_status?.name === 'Follow Up'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : row?.opportunity_status?.name === 'Follow Up'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {row?.opportunity_status?.name}
                                                    </div>
                                                ),
                                            },
                                            { accessor: 'closing_date', title: 'Closing Date', render: (row: any) => <div>{moment(row?.closing_date).format('DD-MM-YYYY')}</div> },
                                            {
                                                accessor: 'actions',
                                                title: 'Actions',
                                                render: (row: any) => (
                                                    <>
                                                        <div className="mx-auto flex w-max items-center gap-4">
                                                            <button
                                                                type="button"
                                                                className="flex hover:text-danger"
                                                                onClick={() => {
                                                                    dispatch(oppId(row?.id));
                                                                    dispatch(leadId(id));

                                                                    router.push(`/view_opportunity?id=${row.id}`);
                                                                }}
                                                            >
                                                                <IconEye />
                                                            </button>
                                                            <button className="flex hover:text-info" onClick={() => editOppData(row)}>
                                                                <IconEdit className="h-4.5 w-4.5" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ),
                                            },
                                        ]}
                                        highlightOnHover
                                        totalRecords={state.opportunityList?.length}
                                        recordsPerPage={state.pageSize}
                                        minHeight={200}
                                        page={null}
                                        onPageChange={(p) => {}}
                                        withBorder={true}
                                        selectedRecords={state.selectedRecords}
                                        onSelectedRecordsChange={(val) => {
                                            setState({ selectedRecords: val });
                                        }}
                                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                    />
                                </div>
                            )}
                        </div>
                    </>

                    <div className="panel col-span-12 mt-2 flex flex-col  rounded-2xl p-3 md:col-span-12">
                        <div className="flex justify-between">
                            <div className="log-history flex w-full flex-wrap justify-between">
                                <div className="flex cursor-pointer items-center gap-3 " onClick={() => setState({ isOpenLog: !state.isOpenLog })}>
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                        {state.isOpenLog ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                                    </div>
                                    <div className="text-xl font-bold ">Log History</div>

                                    <div className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white" style={{ fontSize: '18px' }}>
                                        {state.logList?.length}
                                    </div>
                                </div>
                                <div className="flex-end mt-2 flex cursor-pointer flex-wrap items-center gap-3" onClick={() => setState({ isOpenLog: true })}>
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
                                    {/* <CheckboxInput checked={state.logtype === 'include_opportunity'} onChange={() => handleCheckboxChange('include_opportunity')} label="Include Opportunity" />

                                    <CheckboxInput checked={state.logtype === 'Call'} onChange={() => handleCheckboxChange('Call')} label="Call" />
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
                </>
            )}

            <SideMenu
                title={state.contactId ? 'Update Contact' : 'Add Contact'}
                open={state.isOpenCreateContact}
                close={() => clearContactData()}
                cancelOnClick={() => clearContactData()}
                submitOnClick={() => (state.contactId ? updateContact() : createContact())}
                submitLoading={state.createContactLoad}
                renderComponent={() => (
                    <div className="flex flex-col gap-3 ">
                        {id == null && (
                            <TextInput
                                title="Company Name"
                                value={state.company_name}
                                onChange={(e) => setState({ company_name: e })}
                                placeholder={'Company Name'}
                                error={state.errors?.company_name}
                                disabled
                            />
                        )}

                        <TextInput title=" Name" value={state.contact_name} onChange={(e) => setState({ contact_name: e })} placeholder={' Name'} error={state.errors?.contact_name} required />
                        <TextInput title="Email" value={state.email_id} onChange={(e) => setState({ email_id: e })} placeholder={'Email'} error={state.errors?.email_id} required />
                        <NumberInput
                            title="Phone Number"
                            value={state.phone_number}
                            onChange={(e) => setState({ phone_number: e })}
                            placeholder={'Phone Number'}
                            error={state.errors?.phone_number}
                            required
                        />
                        <TextInput
                            title="Designation"
                            value={state.designation}
                            onChange={(e) => setState({ designation: e })}
                            placeholder={'Designation'}
                            error={state.errors?.designation}
                            required
                        />
                        <CustomSelect
                            value={state.department}
                            onChange={(e) => setState({ department: e })}
                            placeholder={'Department'}
                            title={'Department'}
                            options={state.departmentList}
                            error={state.errors?.department}
                            required
                        />

                        <CustomSelect
                            value={state.lead_source}
                            onChange={(e) => setState({ lead_source: e })}
                            placeholder={'Lead Source'}
                            title={'Lead Source'}
                            options={state.leadSourceList}
                            error={state.errors?.lead_source}
                            required
                        />
                        <CustomSelect
                            value={state.contact_status}
                            onChange={(e) => setState({ contact_status: e })}
                            placeholder={'Status'}
                            title={'Status'}
                            options={state.statusList}
                            error={state.errors?.contact_status}
                            required
                        />
                        <TextArea
                            height="120px"
                            value={state.source_from}
                            onChange={(e) => setState({ source_from: e })}
                            required
                            error={state.errors?.source_from}
                            placeholder={'Source Details'}
                            title={'Source Details'}
                        />

                        <TextArea height="120px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} error={state.errors?.remark} required />
                    </div>
                )}
            />

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
                                    value={state.task_type}
                                    onChange={(e) => {
                                        setState({ task_type: e });
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
                                    error={state.errors?.task_type}
                                    required
                                />
                                <CustomSelect
                                    value={state.logAssignRole}
                                    onChange={(e) => setState({ logAssignRole: e, log_assigned_to: '', logAssignList: [] })}
                                    placeholder={'Choose Role'}
                                    title={'Choose Role'}
                                    options={[
                                        { value: 'owner', label: 'Owner' },
                                        { value: 'bdm', label: 'BDM' },
                                        { value: 'bde', label: 'BDE' },
                                    ]}
                                    error={state.errors?.logAssignRole}
                                    required
                                />

                                <CustomSelect
                                    title="Assign To"
                                    value={state.log_assigned_to}
                                    onChange={(e) =>
                                        //     {setState({ assigned_to: e })
                                        //  console.log(state.assigned_to);
                                        // }
                                        setState({
                                            ...state, // Spread the current state
                                            log_assigned_to: e, // Directly update `assigned_to`
                                        })
                                    }
                                    placeholder={'Assign To'}
                                    options={state.logAssignList}
                                    error={state.errors?.assigned_to}
                                    required
                                    isMulti={true}
                                />
                                {/* <TextArea height="120px" value={state.assignment_note} onChange={(e) => setState({ assignment_note: e })} placeholder={'Remark'} title={'Remark'} /> */}
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

            <SideMenu
                title={state.oppId ? 'Update Opportunity' : 'Add Opportunity'}
                open={state.isOpenOpp}
                cancelOnClick={() => clearOppData()}
                submitOnClick={() => createAndUpdateOpportunity()}
                submitLoading={state.oppLoading}
                close={() => clearOppData()}
                renderComponent={() => (
                    <div className="flex flex-col gap-3">
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".pdf,.doc,.docx,.txt"
                            isImageAllowed={false} // Only allow non-image files
                            value={state.file}
                        />
                        <TextInput title="Name" value={state.opp_name} onChange={(e) => setState({ opp_name: e })} placeholder={'Name'} error={state.errors?.opp_name} required />
                        <CustomSelect
                            title="Opportunity Owner"
                            value={state.owner}
                            onChange={(e) => setState({ owner: e })}
                            placeholder={'Opportunity Owner '}
                            options={state.ownerList}
                            error={state.errors?.owner}
                            required
                        />
                        <NumberInput
                            error={state.errors?.opportunity_value}
                            title="Opportunity Value"
                            value={state.opportunity_value}
                            onChange={(e) => setState({ opportunity_value: e })}
                            placeholder={'Opportunity Value'}
                            required
                        />

                        <NumberInput
                            title="Recurring Value Per Year"
                            value={state.recurring_value_per_year}
                            onChange={(e) => setState({ recurring_value_per_year: e })}
                            placeholder={'Recurring Value Per Year'}
                            error={state.errors?.recurring_value_per_year}
                            required
                        />
                        {/* <YearPicker
                            required
                            error={state.errors?.recurring_value_per_year}
                            title="Recurring Value Per Year"
                            value={state.recurring_value_per_year}
                            onChange={(year) => {
                                setState({ recurring_value_per_year: year });
                            }}
                        /> */}
                        {/* <CustomSelect
                            title="Stage"
                            value={state.opp_stage}
                            onChange={(e) => setState({ opp_stage: e })}
                            placeholder={'Stage'}
                            options={state.stageList}
                            required
                            error={state.errors?.opp_stage}
                        /> */}
                        <CustomSelect
                            title="Stage"
                            value={state.opp_stage}
                            onChange={(e) => {
                                setState({ opp_stage: e });
                                getProbabilityPercentage(e);
                            }}
                            placeholder={'Stage'}
                            options={state.oppStageList}
                            required
                            error={state.errors?.opp_stage}
                        />
                        <NumberInput
                            title="Probability In Percentage"
                            value={state.probability_in_percentage}
                            onChange={(e) => setState({ probability_in_percentage: e })}
                            placeholder={'Probability In Percentage'}
                            error={state.errors?.probability_in_percentage}
                            max={100}
                            required
                        />
                        {/* <CustomSelect
                            title="Created By"
                            value={state.opp_created_by}
                            onChange={(e) => setState({ opp_created_by: e })}
                            placeholder={'Created By'}
                            options={state.createdByList}
                            required
                            error={state.errors?.created_by}
                        /> */}
                        <CustomSelect
                            title="Primary Contact"
                            value={state.primary_contact}
                            onChange={(e) => setState({ primary_contact: e })}
                            placeholder={'Primary Contact'}
                            options={state.primary_contact_list}
                            // loadMore={() => leadListLoadMore()}
                        />
                        <CustomeDatePicker
                            error={state.errors?.closing_date}
                            value={state.opp_closing_date}
                            placeholder="Closing Date"
                            title="Closing Date"
                            onChange={(e) => setState({ opp_closing_date: e })}
                            required
                        />
                        <CustomSelect
                            title="Currency Type"
                            value={state.currency_type}
                            onChange={(e) => setState({ currency_type: e })}
                            placeholder={'Currency Type'}
                            options={state.currencyList}
                            required
                            error={state.errors?.currency_type}
                        />

                        {/* <div className="mt-3 flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => clearOppData()}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => createAndUpdateOpportunity()}>
                                {state.oppLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div> */}
                    </div>
                )}
            />
        </div>
    );
}
