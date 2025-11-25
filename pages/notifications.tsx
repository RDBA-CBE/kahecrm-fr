import React, { useEffect, useState } from 'react';
import CustomfullCalender from '@/common_component/fullCalender';
import { Dropdown, Failure, Success, capitalizeFLetter, objIsEmpty, pageCounts, useSetState } from '@/utils/functions.utils';
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
import TaskCard from '@/components/TaskCard';
import Pagination from '@/components/Pagination';

const Notifications = () => {
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
        types: null,
        isOpenTask: false,
        task: {},
        conversationList: [],
        notificationList: [],
    });

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        contactList(state.currentPage);
        userData();
    }, []);

    useEffect(() => {
        contactList(1);
    }, [debouncedSearch, state.types]);

    const contactList = async (page) => {
        setState({ loading: true });
        let body = bodyData();
        const res: any = await Models.notication.list(page, body);
        setState({ loading: false, currentPage: page });
        tableData(res);
        try {
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const tableData = (res: any) => {
        if (!res?.results) return;

        const data = res?.results?.map((item) => {
            switch (item?.type) {
                case 'Task':
                    return taskData(item);
                case 'Opportunity':
                    return OppData(item);
                case 'Contact':
                    return contactData(item);
                default:
                    return leadData(item);
            }
        });

        setState({
            notificationList: data,
            next: res.next,
            previous: res.previous,
            totalRecords: res.count,
            count: res.count,
            loading: false,
        });
    };

    const conversationData = (row) => {
        return {
            id: row?.conversation?.task?.id,
            type: 'Conversation',
            lead_name: row?.conversation?.task?.contact?.lead?.name,
            contact: row?.conversation?.task?.contact?.name,
            assigned_to: `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`,
            status: row?.conversation?.task?.task_type,
            date: row?.created_at ? moment(row?.created_at).format('DD-MM-YYYY') : '',
            remark: row?.conversation?.message,
        };
    };

    const taskData = (row) => {
        return {
            Ids: row?.conversation?.task?.id || row?.task?.id,
            type: 'Task',
            lead_name: row?.conversation?.task?.contact?.lead?.name || row?.task?.contact?.lead?.name,
            contact: row?.conversation?.task?.contact?.name || row?.task?.contact?.name,
            assigned_to: `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`,
            status: row?.task?.task_type || row?.conversation?.task?.task_type,
            date: row?.created_at ? moment(row?.created_at).format('DD-MM-YYYY') : '',
            remark: row?.task?.remark,
        };
    };

    const OppData = (row) => {
        return {
            Ids: row?.opportunity?.lead?.id,
            type: 'Opportunity',
            lead_name: row?.opportunity?.lead?.name,
            contact: row?.opportunity?.lead?.primary_contact?.name,
            assigned_to: `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`,
            status: row?.opportunity?.lead?.opportunity_status?.name,
            date: row?.created_at ? moment(row?.created_at).format('DD-MM-YYYY') : '',
            remark: row?.opportunity?.remark,
        };
    };

    const contactData = (row) => {
        return {
            Ids: row?.contact?.id,
            type: 'Contact',
            lead_name: row?.contact?.company_name,
            contact: row?.contact?.name,
            assigned_to: `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`,
            status: row?.contact?.status,
            date: row?.created_at ? moment(row?.created_at).format('DD-MM-YYYY') : '',
            remark: row?.contact?.remark,
        };
    };

    const leadData = (row) => {
        return {
            Ids: row?.lead?.id,
            type: 'Lead',
            lead_name: row?.lead?.name,
            contact: row?.lead?.primary_contact?.name,
            assigned_to: `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`,
            status: row?.lead?.opportunity_status?.name,
            date: row?.created_at ? moment(row?.created_at).format('DD-MM-YYYY') : '',
            remark: row?.lead?.opportunity_remark,
        };
    };

    const assign_to = (item) => {
        let value = '';
        if (item?.type == 'task') {
            value =
                item?.assignment_details?.length > 0
                    ? item.assignment_details.map((detail) => `${detail.assigned_to.first_name} ${detail.assigned_to.last_name}`).join(', ')
                    : `${item.created_by?.first_name} ${item.created_by?.last_name}`;
        } else {
            value = `${item?.assigned_to?.first_name} ${item?.assigned_to?.last_name}`;
        }
        return value;
    };

    const bodyData = () => {
        let body: any = {};
        if (state.search) {
            body.search = state.search;
        }
        if (state.types) {
            body.type = state.types?.value;
        }
        return body;
    };

    const handleNextPage = () => {
        if (state.next) {
            const newPage = state.currentPage + 1;
            contactList(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            const newPage = state.currentPage - 1;
            contactList(newPage);
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

    const onView = (row) => {
        if (row?.type == 'Lead' || row?.type == 'Opportunity') {
            router.push(`/viewLead?id=${row.Ids}`);
        } else if (row?.type == 'Contact') {
            router.push(`/update_contact?id=${row?.Ids}`);
        } else {
            taskDetails(row);
        }
    };

    const taskDetails = async (row: any) => {
        try {
            setState({ viewLoad: true });
            const res = await Models.task.details(row?.Ids);
            const body = bodyData();
            const conversationList = await Models.task.get_reply_task_messages(row?.Ids);
            setState({ task: res, isOpenTask: true, conversationList });
            setState({ viewLoad: false });
        } catch (error) {
            setState({ viewLoad: false });

            console.log('✌️error --->', error);
        }
    };

    return (
        <div className="p-2">
            <div className="panel  mb-3 flex items-center justify-between gap-5 ">
                <div className="flex items-center gap-5 pl-3">
                    <h5 className="text-lg font-semibold ">NOTIFICATIONS</h5>
                </div>
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
                        placeholder="Search by lead name"
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>
                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    <CustomSelect
                        value={state.types}
                        onChange={(e) => setState({ types: e })}
                        placeholder={'Filter By Type'}
                        options={[
                            { value: 'Lead', label: 'Lead' },
                            { value: 'Task', label: 'Task' },
                            { value: 'Opportunity', label: 'Opportunity' },
                        ]}
                        className="w-full"
                    />
                </div>
            </div>

            <div className=" mt-2 grid grid-cols-12  gap-4">
                {/* {state.loading || state.subLoading ? (
                    <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                        <CommonLoader />
                    </div>
                ) : ( */}
                <div className=" col-span-12 flex flex-col   md:col-span-12">
                    <div className=" col-span-12 flex flex-col   md:col-span-12">
                        <div className="flex items-center justify-end pb-2 pr-3">
                            <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                                {pageCounts(state.currentPage, state.totalRecords)}
                                {/* {state.currentPage}-{state.totalRecords ? Math.min(state.currentPage * 10, state.totalRecords) : 0} of {state.totalRecords ? state.totalRecords : 0} */}
                            </div>
                        </div>
                        <DataTable
                            className="table-responsive"
                            records={state.notificationList}
                            fetching={state.loading || state.subLoading}
                            loaderSize="lg"
                            loaderVariant="dots"
                            loaderColor="blue"
                            loaderBackgroundBlur={0}
                            columns={[
                                {
                                    accessor: 'type',
                                    title: 'Type',

                                    render: (row: any) => (
                                        <div
                                            className={` font-bold ${
                                                row?.type == 'Lead' ? 'text-green-600' : row?.type == 'Opportunity' ? ' text-blue-600' : row?.type == 'Conversation' ? 'text-pink-600' : 'text-red-600'
                                            }`}
                                        >
                                            {capitalizeFLetter(row?.type)}
                                        </div>
                                    ),
                                },
                                { accessor: 'lead_name', title: 'Lead Name' },
                                { accessor: 'contact', title: 'Contact Name' },
                                { accessor: 'assigned_to', title: 'Assign to' },
                                { accessor: 'status', title: 'Status' },
                                { accessor: 'date', title: 'Date' },
                                {
                                    accessor: 'remark',
                                    title: 'Remark',
                                    sortable: false,
                                    render: (row) => (
                                        <Tippy content={row?.remark} placement="top" className="rounded-lg bg-black p-1 text-sm text-white">
                                            <div>{row?.remark?.length > 20 ? `${row.remark.slice(0, 20)}...` : row?.remark}</div>
                                        </Tippy>
                                    ),
                                },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <button className="flex hover:text-primary" onClick={() => onView(row)}>
                                                <IconEye />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            onRowClick={(object) => onView(object)}
                            highlightOnHover
                            totalRecords={state.notificationList?.length}
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
                                contactList(page);

                                setState({ currentPage: page });
                            }}
                            hasNext={state.next !== null}
                            hasPrevious={state.previous !== null}
                            recordsPerPage={10}
                        />
                    </div>
                </div>
                {/* )} */}
            </div>

            <Modal
                open={state.isOpenTask}
                addHeader={'Task Details'}
                height={state.popupHeight}
                close={() => setState({ isOpenTask: false, task: {} })}
                renderComponent={() => <TaskCard task={state.task} conversationList={state.conversationList} close={() => setState({ isOpenTask: false })} />}
            />
        </div>
    );
};
export default PrivateRouter(Notifications);
