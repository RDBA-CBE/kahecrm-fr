import React, { useEffect, useState } from 'react';
import CustomfullCalender from '@/common_component/fullCalender';
import { Dropdown, Failure, Success, capitalizeFLetter, objIsEmpty, useSetState } from '@/utils/functions.utils';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import IconFilter from '@/components/Icon/IconFilter';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import CommonLoader from './elements/commonLoader';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import moment from 'moment';
import { ROLE } from '@/utils/constant.utils';
import Tippy from '@tippyjs/react';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import SideMenu from '@/common_component/sideMenu';
import TextArea from '@/components/TextArea';
import IconLoader from '@/components/Icon/IconLoader';
import * as Yup from 'yup';
import { PrivateRouter, Validation } from '@/utils/imports.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import IconSquareRotated from '@/components/Icon/IconSquareRotated';
import IconQuickEdit from '@/components/Icon/IconQuickEdit';
import ContactQuickEdit from '@/components/ContactQuickEdit';
import useDebounce from '@/common_component/useDebounce';
import CheckboxInput from '@/components/Checkbox';
import { useRouter } from 'next/router';
import Modal from '@/common_component/modal';
import FileUpload from '@/common_component/fileUpload';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import IconX from '@/components/Icon/IconX';
import Pagination from '@/components/Pagination';

const Contacts = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const router = useRouter();

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const [state, setState] = useSetState({
        contactList: [],
        previous: null,
        next: null,
        role: null,
        columns: [],
        currentPage: 1,
        totalRecords: 0,
        isOpenCreateContact: false,
        lead: '',
        contact: '',
        leadList: [],
        task_date_time: '',
        taskType: '',
        assigned_to: '',
        currentLeadPage: 1,
        expandedRow: null,
        isOpenImport: false,
        isClick: false,
        importLoading: false,
        errorContacts: [],
    });

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        contactList(state.currentPage);
        statusList();
        leadList();
        sourceList();
        departmentList();
        bdmList();
        dmList();
        userData();
        filter(state.currentPage);
        // telecallerList();
        // bdeList();
        // BDEList();
        // assignList();
    }, []);
    useEffect(() => {
        if (state.roles?.value == 'BDE') {
            bdeList();
        } else {
            telecallerList();
        }
    }, [state.roles]);

    useEffect(() => {
        if (state.role == 'BDM') {
            telecallerList();
            BDEList();
            assignList();
        }
    }, [state.role]);

    // useEffect(() => {
    //     filter(state.currentPage);
    // }, [state.currentPage]);

    useEffect(() => {
        if (!objIsEmpty(bodyData())) {
            filter(1);
        } else {
            contactList(1);
        }
    }, [debouncedSearch, state.filter_status, state.bdm, state.bde, state.dm, state.tm, state.assignRole, state.role, state.assigned_to, state.lead_source, state.lead_status]);

    useEffect(() => {
        if (ROLE.TM == state.role || ROLE.DM == state.role) {
            if (!objIsEmpty(state.assignRole)) {
                if (state.assignRole?.value == 'owner') {
                    TelecallerFilterOwnerList();
                } else if (state.assignRole?.value == 'bdm') {
                    TelecallerFilterBdmList();
                } else {
                    TelecallerFilterBdeList();
                }
            }
        }
    }, [state.assignRole]);

    const bodyData = () => {
        let filter: any = {};

        filter.team = true;

        if (state.search) {
            filter.name = state.search;
        }
        if (state.filter_status) {
            filter.status = state.filter_status?.value;
        }

        if (state.lead_source) {
            filter.lead_source = state.lead_source?.value;
        }
        if (state.lead_status) {
            filter.status = state.lead_status?.value;
        }
        if (state.assigned_to) {
            filter.assigned_to = state.assigned_to?.value;
        } else if (state.bdm) {
            if (state.bde) {
                filter.bde = state.bde?.value;
            } else if (state.tm) {
                filter.tm = state.tm?.value;
            } else {
                filter.bdm = state.bdm?.value;
            }
        } else if (state.bde) {
            filter.bde = state.bde?.value;
        } else if (state.tm) {
            filter.tm = state.tm?.value;
        }

        if (state.dm) {
            filter.dm = state.dm?.value;
        }

        console.log(filter);
        return filter;
    };

    const contactList = async (page) => {
        setState({ loading: true });
        const role: any = await Models.auth.userDetails();
        let res: any;

        if (ROLE.ADMIN == state.role || ROLE.BDM == state.role) {
            res = await Models.contact.archive_list(page);
        } else {
            res = await Models.contact.archive_list(page, role?.id);
        }
        // const res: any = await Models.contact.archive_list(page, role?.id);
        setState({ role: role?.designation, loading: false, currentPage: page });
        tableData(res, role?.designation);

        try {
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

    const filter = async (page) => {
        setState({ loading: true });
        const body = bodyData();
        const role: any = await Models.auth.userDetails();
        let res: any;

        if (ROLE.ADMIN == state.role || ROLE.BDM == state.role) {
            res = await Models.contact.archive_filter(page, body);
        } else {
            res = await Models.contact.archive_filter(page, body, role?.id);
        }
        // const res: any = await Models.contact.archive_filter(page, body, role?.id);
        setState({ role: role?.designation });
        tableData(res, role?.designation);
        setState({ loading: false, totalRecords: res.count, next: res.next, previous: res.previous, isOpen: false, currentPage: page });

        try {
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const tableData = (res: any, role: string) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                company_name: item?.company_name ? capitalizeFLetter(item?.company_name) : '',
                contact_person: item?.name ? capitalizeFLetter(item?.name) : '',
                contact_number: item?.phone_number,
                designation: item?.designation ? capitalizeFLetter(item?.designation) : '',
                remark: item?.remark,
                status: item?.status?.status,
                allData: item,
            };
        });

        setState({ contactList: data, next: res.next, previous: res.previous, totalRecords: res.count });
    };

    const handleNextPage = () => {
        if (state.next) {
            const newPage = state.currentPage + 1;
            if (!objIsEmpty(bodyData())) {
                filter(newPage);
            } else {
                contactList(newPage);
            }
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            const newPage = state.currentPage - 1;
            if (!objIsEmpty(bodyData())) {
                filter(newPage);
            } else {
                contactList(newPage);
            }
        }
    };

    const userData = async () => {
        try {
            const res: any = await Models.auth.userDetails();
            setState({ role: res?.designation, userId: res?.id });
        } catch (error) {
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

    const telecallerList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.bdmAndBDE();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ bdeOrTMList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const BDEList = async () => {
        try {
            setState({ loading: true });
            const role: any = await Models.auth.userDetails();
            const res: any = await Models.lead.bdmBasedBde(role?.id);
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ bdeList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const bdmList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.leadManager();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ bdmList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const bdeList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.bdmBasedBde(state?.bdm?.value);
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ bdeOrTMList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const dmList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.lead.dmList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ dmList: dropdownList, loading: false });
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

    const clearContactData = (rowId: any) => {
        setState({
            name: '',
            department: '',
            designation: '',
            phone_number: '',
            email_id: '',
            lead_source: '',
            status: '',
            is_active: false,
            isOpenCreateContact: false,
            errors: '',
            remark: '',
            moveToLead: false,
            is_archive: false,
            contactId: null,
            expandedRow: rowId,
        });
    };

    const createContact = async (rowId) => {
        try {
            setState({ createContactLoad: true, errors: {} });

            const validateField = {
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation,
                phone_number: state.phone_number,
                email_id: state.email_id,
                name: state.name,
                lead: state.lead?.value,
                moveToLead: state.moveToLead,
            };

            const body = {
                // lead: id,
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation,
                phone_number: state.phone_number,
                email_id: state.email_id,
                is_active: state.is_active,
                name: state.name,
                is_archive: state.is_archive,
                lead: state.moveToLead ? state.lead?.value : null,
                remark: state.remark,
            };

            await Validation.createNewContact.validate(validateField, { abortEarly: false });

            await Models.contact.create(body);
            Success('Contact created successfully');
            clearContactData(rowId);
            contactList(state.currentPage);
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

    const updateContacts = async (rowId) => {
        try {
            setState({ createContactLoad: true, errors: {} });

            const validateField = {
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phone_number?.trim(),
                email_id: state.email_id?.trim(),
                name: state.name?.trim(),
                lead: state.lead?.value,
                moveToLead: state.moveToLead,
                company_name: state.company_name?.trim(),
            };

            const body = {
                // lead: id,
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phone_number,
                email_id: state.email_id?.trim(),
                is_active: state.is_active,
                name: state.name?.trim(),
                company_name: state.company_name?.trim(),
                is_archive: state.is_archive,
                lead: state.moveToLead ? state.lead?.value : null,
                remark: state.remark?.trim(),
            };

            await Validation.createNewContact.validate(validateField, { abortEarly: false });

            await Models.contact.update(body, state.contactId);
            Success('Contact updated successfully');
            clearContactData(rowId);
            contactList(state.currentPage);
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

    const updateContact = (row) => {
        setState({
            isOpenCreateContact: true,
            contactId: row.id,
            name: row.name?.trim(),
            company_name: row.company_name?.trim(),
            email_id: row.email_id?.trim(),
            phone_number: row.phone_number,
            designation: row.designation?.trim(),
            department: objIsEmpty(row.department) ? null : { value: row.department.id, label: row.department.department },
            lead_source: objIsEmpty(row.lead_source) ? null : { value: row.lead_source.id, label: row.lead_source.source },
            status: objIsEmpty(row.allData?.status) ? null : { value: row.allData?.status.id, label: row.allData?.status.status },
            remark: row.remark?.trim(),
            moveToLead: objIsEmpty(row.lead) ? false : true,
            lead: objIsEmpty(row.lead) ? null : { value: row.lead.id, label: row.lead.name },
            is_archive: row.is_archive,
            expandedRow: null,
        });
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

    const importContact = async () => {
        try {
            setState({ importLoading: true });
            if (!state.file) {
                Failure('Please upload a valid file');
                return;
            }
            const formData = new FormData();
            formData.append('file', state.file);
            const res: any = await Models.contact.import(formData);

            if (res?.error) {
                setState({ isOpenImport: false, file: null, importLoading: false });
                throw new Error(res.error);
            }

            Success('Contact imported successfully');

            setState({ isOpenImport: false, file: null, importLoading: false, errorContacts: [] });
            contactList(state.currentPage);
        } catch (error: any) {
            console.log('✌️error --->', error);
            setState({ importLoading: false });
            if (error.response?.data?.details?.length > 0) {
                const errorContacts = error.response?.data?.details
                    .filter((contact: any) => Object.keys(contact.error).length > 0)
                    .map((contact: any) => {
                        let errorMessage = '';
                        if (contact?.error?.company_name) {
                            errorMessage += ` Company Name Error - ${contact?.error.company_name?.company_name} - Created By -(${capitalizeFLetter(
                                contact?.error.company_name?.created_by
                            )}) message- (${contact?.error.company_name?.message})  `;
                        }
                        if (contact?.error?.phone_number) {
                            errorMessage += ` Phone Number Error - ${contact?.error?.phone_number?.phone_number} - Created By (${capitalizeFLetter(
                                contact?.error?.phone_number?.created_by
                            )}) message - (${contact?.error?.phone_number?.message}) `;
                        }
                        return errorMessage;
                    });
                setState({ errorContacts });
            } else {
                if (error?.response?.data?.error) {
                    // Failure(error?.response?.data?.error);
                    setState({ errorContacts: [error?.response?.data?.error] });
                }
            }
        }
    };

    const TelecallerFilterOwnerList = async () => {
        try {
            const res: any = await Models.lead.ownerList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const TelecallerFilterBdmList = async () => {
        try {
            const res: any = await Models.lead.bdmList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const TelecallerFilterBdeList = async () => {
        try {
            const res: any = await Models.lead.bdeList();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const handleRemove = (type) => {
        if (type == 'bdm') {
            setState({ bdm: null, roles: null, bde: null, dm: null });
        } else if (type == 'roles') {
            setState({ roles: null, bde: null });
        } else if (type == 'bde') {
            setState({ bde: null });
        } else if (type == 'status') {
            setState({ card_lead_status: null, today: false, month: false });
        } else if (type == 'dm') {
            setState({ dm: null });
        } else if (type == 'tm') {
            setState({ tm: null });
        } else if (type == 'lead_source') {
            setState({ lead_source: null });
        } else if (type == 'lead_status') {
            setState({ lead_status: null });
        } else if (type == 'assigned_to') {
            setState({ assigned_to: null });
        } else if (type == 'assignRole') {
            setState({ assignRole: null, assigned_to: null, assignList: [] });
        } else {
            // setState({ dm: null });
        }
    };

    return (
        <div className="p-2">
            <div className="panel  mb-3 flex items-center justify-between gap-5 ">
                <div className="flex items-center gap-5 pl-3">
                    {/* <h5 className="text-lg font-semibold ">ARCHIVE CONTACTS</h5> */}

                    <h5 className="text-lg font-semibold ">{(ROLE.ADMIN == state.role || ROLE.BDM == state.role) && 'TEAM '}ARCHIVE CONTACTS</h5>
                </div>
                {state.role !== ROLE.ADMIN && state.role !== ROLE.BDM && (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                router.push('create_contact');
                                // setState({
                                //     name: '',
                                //     department: '',
                                //     designation: '',
                                //     phone_number: '',
                                //     email_id: '',
                                //     lead_source: '',
                                //     status: '',
                                //     is_active: false,
                                //     isOpenCreateContact: true,
                                //     errors: '',
                                //     remark: '',
                                //     moveToLead: false,
                                //     is_archive: false,
                                //     contactId: null,
                                // });
                            }}
                        >
                            Add
                            {/* {submitLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : submitTitle ? submitTitle : 'Submit'} */}
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => setState({ isOpenImport: true })}>
                            Import
                            {/* {submitLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : submitTitle ? submitTitle : 'Submit'} */}
                        </button>
                    </div>
                )}
            </div>

            <div className="panel mt-2 flex flex-col gap-4 lg:flex-row lg:items-center ">
                <div className="relative flex w-full max-w-full items-center rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3">
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search ..."
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                {/* <CustomSelect
                    value={state.filter_status}
                    onChange={(e) => {
                        setState({ filter_status: e });
                    }}
                    placeholder="Status"
                    options={state.statusList}
                    className="w-full md:w-1/2 lg:w-2/4"
                /> */}

                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    {ROLE.ADMIN == state.role && (
                        <>
                            <CustomSelect
                                options={state.bdmList}
                                value={state.bdm}
                                onChange={(e) => setState({ bdm: e, bde: null, roles: null })}
                                isMulti={false}
                                placeholder="BDM"
                                className="w-full "
                                disabled={state.dm?.value}
                            />
                            <CustomSelect
                                options={
                                    state.bdm?.value
                                        ? [
                                              {
                                                  value: 'BDE',
                                                  label: 'BDE',
                                              },
                                              {
                                                  value: 'TM',
                                                  label: 'TM',
                                              },
                                          ]
                                        : []
                                }
                                value={state.roles}
                                onChange={(e) => setState({ roles: e, bde: null })}
                                isMulti={false}
                                placeholder="Choose Role"
                                className="w-full "
                                disabled={state.dm?.value}
                            />
                            {state.roles ? (
                                state.roles?.value == 'BDE' ? (
                                    <CustomSelect
                                        options={state.bdeOrTMList}
                                        value={state.bde}
                                        onChange={(e) => setState({ bde: e })}
                                        isMulti={false}
                                        placeholder="BDE"
                                        className="w-full "
                                        disabled={state.dm?.value}
                                    />
                                ) : (
                                    <CustomSelect
                                        options={state.bdeOrTMList}
                                        value={state.bde}
                                        onChange={(e) => setState({ bde: e })}
                                        isMulti={false}
                                        placeholder="TM"
                                        className="w-full "
                                        disabled={state.dm?.value}
                                    />
                                )
                            ) : null}
                            <CustomSelect
                                options={state.dmList}
                                value={state.dm}
                                onChange={(e) => setState({ dm: e })}
                                isMulti={false}
                                placeholder="DM"
                                className="w-full "
                                disabled={state.bdm?.value || state.bde?.value || state.roles?.value}
                            />
                        </>
                    )}

                    {ROLE.BDM == state.role && (
                        <>
                            <CustomSelect
                                options={state.bdeList}
                                value={state.bde}
                                onChange={(e) => setState({ bde: e })}
                                disabled={state?.tm?.value || state.dm?.value}
                                isMulti={false}
                                placeholder="BDE"
                                className="w-full"
                            />

                            <CustomSelect
                                options={state.assignList}
                                value={state.tm}
                                onChange={(e) => setState({ tm: e })}
                                disabled={state?.bde?.value || state.dm?.value}
                                isMulti={false}
                                placeholder="TM"
                                className="w-full"
                            />

                            <CustomSelect
                                options={state.dmList}
                                value={state.dm}
                                onChange={(e) => setState({ dm: e })}
                                disabled={state?.bde?.value || state.tm?.value}
                                isMulti={false}
                                placeholder="DM"
                                className="w-full"
                            />
                        </>
                    )}

                    {(ROLE.BDE == state.role || ROLE.TM == state.role) && (
                        <>
                            <CustomSelect
                                value={state.lead_source}
                                onChange={(e) => setState({ lead_source: e })}
                                placeholder={'Source'}
                                options={state.sourceList}
                                error={state.errors?.lead_source}
                                className="w-full"
                                required
                            />
                            <CustomSelect
                                value={state.lead_status}
                                onChange={(e) => setState({ lead_status: e })}
                                placeholder={'Status'}
                                options={state.statusList}
                                error={state.errors?.lead_status}
                                className="w-full"
                                required
                            />
                        </>
                    )}
                    {/* <button className="btn btn-primary w-full lg:w-auto" onClick={() => setState({ isOpen: true })}>
                        <IconFilter />
                    </button> */}
                </div>

                {/* <button className="btn btn-primary w-full lg:w-auto" onClick={() => setState({ isOpen: true })}>
                        <IconFilter />
                    </button> */}
            </div>
            {ROLE.ADMIN == state.role ? (
                <>
                    {!state?.dm && (state?.bdm || state?.roles || state?.bde || state?.card_lead_status) && (
                        <p className="flex items-center gap-2 pt-3 text-sm font-semibold">
                            Filters:
                            {state?.bdm?.label && (
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('bdm')}>
                                    {state?.bdm?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            )}
                            {state?.roles?.label && <div>/</div>}
                            {state?.roles?.label && (
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('roles')}>
                                    {state?.roles?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            )}
                            {state?.bde?.label && <div>/</div>}
                            {state?.bde?.label && (
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('bde')}>
                                    {state?.bde?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            )}
                            {state?.card_lead_status && <div>,</div>}
                            {state?.card_lead_status && (
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('status')}>
                                    {`${state?.card_lead_status} (${state.today ? 'Today' : 'Month'})`}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            )}
                        </p>
                    )}
                    {state?.dm && (
                        <div className="pb-2 pt-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                Filters:
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('dm')}>
                                    {state?.dm?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                                {state?.card_lead_status && <div>,</div>}
                                {state?.card_lead_status && (
                                    <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('status')}>
                                        {`${state?.card_lead_status} (${state.today ? 'Today' : 'Month'})`}
                                        <div>
                                            <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : ROLE.BDM == state.role ? (
                <>
                    <div className="flex gap-2 pt-3">
                        {state?.bde?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('bde')}>
                                    {state?.bde?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {state?.tm?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('tm')}>
                                    {state?.tm?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {state?.dm?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('dm')}>
                                    {state?.dm?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state?.card_lead_status && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('status')}>
                                    {`${state?.card_lead_status} (${state.today ? 'Today' : 'Month'})`}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : ROLE.BDE == state.role ? (
                <>
                    <div className="flex gap-2 pt-3">
                        {state?.lead_source?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('lead_source')}>
                                    {state?.lead_source?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {state?.lead_status?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('lead_status')}>
                                    {state?.lead_status?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {state?.card_lead_status && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('status')}>
                                    {`${state?.card_lead_status} (${state.today ? 'Today' : 'Month'})`}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex gap-2 pt-3">
                        {state?.assignRole?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('assignRole')}>
                                    {state?.assignRole?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {state?.assigned_to?.label && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('assigned_to')}>
                                    {state?.assigned_to?.label}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {state?.lead_source?.value && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('lead_source')}>
                                    {`${state?.lead_source?.label}`}
                                    <div>
                                        <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state?.card_lead_status && (
                            <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('status')}>
                                {`${state?.card_lead_status} (${state.today ? 'Today' : 'Month'})`}
                                <div>
                                    <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className=" mt-2 grid grid-cols-12  gap-4">
                {state.loading || state.subLoading ? (
                    <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                        <CommonLoader />
                    </div>
                ) : (
                    <div className=" col-span-12 flex flex-col   md:col-span-12">
                        <div className=" col-span-12 flex flex-col   md:col-span-12">
                            <div className="flex items-center justify-end pb-2 pr-3">
                                <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                                    {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                                </div>
                            </div>
                            <DataTable
                                className="table-responsive"
                                records={state.contactList}
                                columns={[
                                    { accessor: 'company_name', title: 'Company Name' },
                                    { accessor: 'contact_person', title: 'Contact Person' },
                                    { accessor: 'phone_number', title: 'Contact Number' },
                                    // { accessor: 'category', title: 'Category',  },
                                    // { accessor: 'created_by', title: 'Assign To',  },
                                    { accessor: 'designation', title: 'Designation' },

                                    ...(state?.role !== ROLE.BDE ? [{ accessor: 'status', title: 'Status' }] : []),
                                    {
                                        accessor: 'remark',
                                        title: 'Remark',
                                        render: (row: any) => (
                                            <Tippy content={row?.remark} placement={'top'} className="rounded-lg bg-black p-1 text-sm text-white">
                                                <div>{row?.remark?.length > 30 ? `${row.remark.slice(0, 30)}...` : row?.remark}</div>
                                            </Tippy>
                                        ),
                                    },
                                    {
                                        accessor: 'actions',
                                        title: 'Actions',
                                        render: (row: any) => (
                                            <div className="mx-auto flex w-max items-center gap-4">
                                                {/* <button
                                                    className="flex hover:text-primary"
                                                    onClick={(e) => {
                                                        state.expandedRow === row.id ? setState({ expandedRow: null, isClick: true }) : setState({ expandedRow: row.id, isClick: true });
                                                    }}
                                                >
                                                    <IconQuickEdit />
                                                </button> */}
                                                {/* <button className="flex hover:text-primary" onClick={() => console.log('View task', row)}>
                                                    <IconEye />
                                                </button> */}
                                                <button
                                                    className="flex hover:text-info"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/update_contact?id=${row?.id}`);
                                                    }}
                                                >
                                                    <IconEdit className="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                                rowExpansion={{
                                    collapseProps: {
                                        transitionDuration: 500,
                                        animateOpacity: false,
                                        transitionTimingFunction: 'ease-out',
                                    },
                                    allowMultiple: false,
                                    content: ({ record, collapse }) =>
                                        state.expandedRow === record?.id ? (
                                            <div>
                                                <ContactQuickEdit
                                                    key={record.id}
                                                    collapse={() => collapse()}
                                                    data={record}
                                                    updateList={() => {
                                                        setState({ expandedRow: null });
                                                        filter(state.currentPage);
                                                        contactList(state.currentPage);
                                                    }}
                                                    resetExpandedRow={() => {
                                                        setState({ expandedRow: null });
                                                    }}
                                                />
                                            </div>
                                        ) : null,
                                }}
                                onRowClick={({ id }) => {
                                    if (state.expandedRow !== id) {
                                        setState({ expandedRow: id });
                                        // router.push(`/update_contact?id=${id}`);
                                    }
                                }}
                                // onRowClick={({ id }) => {
                                //     if (state.isClick) {
                                //         //     setState({ expandedRow: id });
                                //         router.push(`/update_contact?id=${id}`);
                                //     }
                                // }}
                                highlightOnHover
                                totalRecords={state.taskList?.length}
                                recordsPerPage={state.pageSize}
                                minHeight={200}
                                page={null}
                                onPageChange={(p) => {}}
                                withBorder={true}
                                sortStatus={sortStatus}
                                onSortStatusChange={setSortStatus}
                                paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                            />
                        </div>
                        {/* <div className="mt-5 flex justify-center gap-3">
                            <button disabled={!state.previous} onClick={handlePreviousPage} className={`btn ${!state.previous ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!state.next} onClick={handleNextPage} className={`btn ${!state.next ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowForward />
                            </button>
                        </div> */}

                        <div className="mt-5 flex justify-center gap-3">
                            <Pagination
                                currentPage={state.currentPage}
                                totalRecords={state.count}
                                onPageChange={(page) => {
                                    if (!objIsEmpty(bodyData())) {
                                        filter(page);
                                    } else {
                                        contactList(page);
                                    }
                                    setState({ currentPage: page });
                                }}
                                hasNext={state.next !== null}
                                hasPrevious={state.previous !== null}
                                recordsPerPage={10}
                            />
                        </div>
                    </div>
                )}
            </div>
            <SideMenu
                title={state.contactId ? 'Update Contact' : 'Add Contact'}
                open={state.isOpenCreateContact}
                close={() => clearContactData(state.contactId)}
                cancelOnClick={() => clearContactData(state.contactId)}
                submitOnClick={() => (state.contactId ? updateContacts(state.contactId) : createContact(state.contactId))}
                submitLoading={state.createContactLoad}
                renderComponent={() => (
                    <div className="flex flex-col gap-3 ">
                        <TextInput
                            title="Company Name"
                            value={state.company_name}
                            onChange={(e) => setState({ company_name: e })}
                            placeholder={'Company Name'}
                            error={state.errors?.company_name}
                            required
                        />
                        <TextInput title="Name" value={state.name} onChange={(e) => setState({ name: e })} placeholder={'Name'} error={state.errors?.name} required />
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
                            title="Department"
                            value={state.department}
                            onChange={(e) => setState({ department: e })}
                            placeholder={'Department'}
                            options={state.departmentList}
                            error={state.errors?.department}
                            required
                        />
                        <CustomSelect
                            title="Lead Source"
                            value={state.lead_source}
                            onChange={(e) => setState({ lead_source: e })}
                            placeholder={'Lead Source'}
                            options={state.sourceList}
                            error={state.errors?.lead_source}
                            required
                        />
                        <CustomSelect
                            title="Status"
                            value={state.status}
                            onChange={(e) => setState({ status: e })}
                            placeholder={'Status'}
                            options={state.statusList}
                            error={state.errors?.status}
                            required
                        />
                        <TextArea height="120px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} />
                        <div className="">
                            <CheckboxInput className="w-full md:w-1/2 lg:w-3/4" checked={state.moveToLead} onChange={(val) => setState({ moveToLead: val })} label="Move To Lead" />
                            {state.moveToLead && (
                                <CustomSelect
                                    value={state.lead}
                                    onChange={(e) => setState({ lead: e })}
                                    placeholder={'Lead'}
                                    title={'Lead '}
                                    options={state.leadList}
                                    error={state.errors?.lead}
                                    required
                                    loadMore={() => leadListLoadMore()}
                                />
                            )}
                        </div>
                        <CheckboxInput className="w-full md:w-1/2 lg:w-3/4" checked={state.is_archive} onChange={(val) => setState({ is_archive: val })} label="Archive Contact" />
                    </div>
                )}
            />
            <Modal
                open={state.isOpenImport}
                addHeader={'Import Contact'}
                close={() => setState({ isOpenImport: false, file: null })}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 p-5">
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".xls,.xlsx,.csv"
                            isImageAllowed={false}
                            value={state.file}
                        />
                        {state.errorContacts?.length > 0 && (
                            <ol className="list-disc pl-5 text-red-500">
                                {state.errorContacts?.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ol>
                        )}
                        <div className="mt-3 flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => setState({ isOpenImport: false, file: null })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => importContact()}>
                                {state.importLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};
export default PrivateRouter(Contacts);
