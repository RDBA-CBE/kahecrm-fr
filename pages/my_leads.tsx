import IconBitcoin from '@/components/Icon/IconBitcoin';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import { Dropdown, chartData, filterByDates, getDateRange, objIsEmpty, pageCounts, useSetState } from '@/utils/functions.utils';
import { Loader, SimpleGrid } from '@mantine/core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import QuickEdit from '@/components/QuickEdit';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import SideMenu from '@/common_component/sideMenu';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import { ROLE } from '@/utils/constant.utils';
import { PrivateRouter } from '@/utils/imports.utils';
import moment from 'moment';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import Chip from '@/components/chip';
import useDebounce from '@/common_component/useDebounce';
import IconX from '@/components/Icon/IconX';
import { current } from '@reduxjs/toolkit';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import IconLoader from '@/components/Icon/IconLoader';
import { IRootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { leadIndex } from '@/store/crmConfigSlice';
import Pagination from '@/components/Pagination';

const Leads = () => {
    const dispatch = useDispatch();
    const ReactApexChart = dynamic(() => import('react-apexcharts'), {
        ssr: false,
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const router = useRouter();

    const prevDeps = useRef(null);

    const isInitialLoad = useRef(true);

    const [state, setState] = useSetState({
        state: [],
        loading: false,
        chartData: {},
        role: '',
        currentPage: 1,
        totalRecords: 0,
        next: null,
        previous: null,
        search: '',
        statusList: [],
        allData: null,
        selectedRow: {},
        bdmList: [],
        bdeList: [],
        dmList: [],
        cardData: [],
        chartLoading: false,
        sourceList: [],
        assignList: [],
        expandedRow: null,
        coloumns: [],
        assignRole: null,
        chartsLoading: false,
        activeTab: '',
        today: false,
        month: false,
        card_lead_status: '',
        opporunity_status: '',
        userId: '',
        // data:
    });

    useEffect(() => {
        bdmList();
        dmList();
        countData();
        getData();
        userData();
        statusList();
        opportunityList();
        sourceList();
        DMGraphData();
    }, []);

    const debouncedSearch = useDebounce(state.search, 500);

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
    // const body = bodyData();
    // if (body) {
    // filterData();
    // } else {
    //     getAllData(state.currentPage);
    // }
    // }, [state.currentPage]);

    const deps = useMemo(
        () => ({
            activeTab: state.activeTab,
            search: debouncedSearch,
            assigned_to: state.assigned_to?.value,
            lead_source: state.lead_source?.value,
            opportunity: state.opportunity?.value,
            lead_status: state.lead_status?.value,
            role: state.role,
            bdm: state.bdm?.value,
            bde: state.bde?.value,
            dm: state.dm?.value,
            tm: state.tm?.value,
            today: state?.today,
            month: state?.month,
            card_lead_status: state?.card_lead_status,
        }),
        [
            state.activeTab,
            debouncedSearch,
            state.assigned_to,
            state.lead_source,
            state.opportunity,
            state.lead_status,
            state.role,
            state.bdm,
            state.bde,
            state.dm,
            state.tm,
            state?.today,
            state?.month,
            state?.card_lead_status,
        ]
    );

    useEffect(() => {
        if (!state.role) return;

        const currentDeps = JSON.stringify(deps);

        if (isInitialLoad.current) {
            const page = redux?.leadIndex || state?.currentPage;
            if (redux?.leadIndex) {
                setState({ currentPage: redux.leadIndex });
            }
            filterData(page);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            filterData(1);
            countData();
        }

        prevDeps.current = currentDeps;
    }, [deps]);

    useEffect(() => {
        if (state.role == ROLE.DM) {
            DMGraphData();
        }
    }, [state.activeTab]);

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

    useEffect(() => {
        setState({ from_date: '', end_date: '' });
    }, [state.activeTab]);

    useEffect(() => {
        if (state.from_date || state.end_date) {
            setState({ activeTab: 'Custom' });
        }
    }, [state.from_date, state.end_date]);

    const getAllData = async (page = 1) => {
        try {
            setState({ loading: true });
            const response: any = await Models.lead.list(page);
            const role: any = await Models.auth.userDetails();
            setState({ range: [0, response.max_revenue], maxPrice: response.max_revenue });
            tableData(response?.results, role?.designation);
            setState({
                loading: false,
                totalRecords: response.count,
                next: response.next,
                previous: response.previous,
                role: role?.designation,
            });
        } catch (error) {
            setState({ loading: false });
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


     const opportunityList = async () => {
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
            const res: any = await Models.lead.bdmBasedBde(state?.userId);
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ bdeList: dropdownList, loading: false });
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

    const countData = async () => {
        try {
            setState({ chartLoading: true });
            let body = bodyData();
            const user: any = await Models.auth.userDetails();
            const res: any = await Models.lead.leadCount(body, user?.id);


            // const count = [
            //     { title: 'Leads', monthCount: res?.Leads?.this_month, todayCount: res?.Leads?.today, icon: '🔗', name1: 'Today', name2: 'Month' },
            //     { title: 'Calls', monthCount: res?.Calls?.this_month, todayCount: res?.Calls?.today, icon: '🔗', name1: 'Today', name2: 'Month' },
            //     { title: 'Prospect', monthCount: res?.Prospect?.this_month, todayCount: res?.Prospect?.today, icon: '💰', name1: 'Today', name2: 'Month' },
            //     { title: 'Meetings', monthCount: res?.Meetings?.this_month, todayCount: res?.Meetings?.today, icon: '👨‍💼', name1: 'Today', name2: 'Month' },
            // ];

            // if (state.role == ROLE.TM) {
            //     count.push({ title: 'Follow Up', monthCount: res?.['Follow Up']?.this_month, todayCount: res?.['Follow Up']?.today, icon: '⏳', name1: 'Month', name2: 'Target' });
            // }

            // if (state.role == ROLE.BDE || state.role == ROLE.BDM || state.role == ROLE.ADMIN) {
            //     count.push(
            //         { title: 'Proposal', monthCount: res?.Proposal?.this_month, todayCount: res?.Proposal?.today, icon: '⏳', name1: 'Month', name2: 'Target' },
            //         { title: 'Deal Won', monthCount: res?.['Deal Won']?.this_month, todayCount: res?.['Deal Won']?.today, icon: '💵', name1: 'Month', name2: 'Target' }
            //     );
            // }

            const state = { role: 'BDE' }; // Example role
            const ROLE = { TM: 'TM', BDE: 'BDE', BDM: 'BDM', ADMIN: 'ADMIN' };

            const count = [
                { title: 'Leads', id: res?.Lead?.id, monthCount: res?.Lead?.total_count, todayCount: res?.Lead?.today, icon: '🔗', name1: 'Today', name2: 'Total' },
                { title: 'Calls', id: res?.Calls?.id, monthCount: res?.Calls?.total_count, todayCount: res?.Calls?.today, icon: '🔗', name1: 'Today', name2: 'Total' },
                { title: 'Prospect', id: res?.Prospect?.id, monthCount: res?.Prospect?.total_count, todayCount: res?.Prospect?.today, icon: '💰', name1: 'Today', name2: 'Total' },
                { title: 'Meetings', id: res?.Meeting?.id, monthCount: res?.Meeting?.total_count, todayCount: res?.Meeting?.today, icon: '👨‍💼', name1: 'Today', name2: 'Total' },
            ];


            if (user?.designation === ROLE.TM) {
                count.push({
                    title: 'Follow Up',
                    id: res?.['Follow Up']?.id,
                    monthCount: res?.['Follow Up']?.total_count,
                    todayCount: res?.['Follow Up']?.today,
                    icon: '⏳',
                    name1: 'Today',
                    name2: 'Total',
                });
            }

            if (user?.designation === ROLE.BDE || user?.designation === ROLE.BDM || user?.designation === ROLE.ADMIN) {
                count.push(
                    { title: 'Proposal', id: res?.Proposal?.id, monthCount: res?.Proposal?.total_count, todayCount: res?.Proposal?.today, icon: '⏳', name1: 'Today', name2: 'Total' },
                    { title: 'Deal Won', id: res?.['Deal Won']?.id, monthCount: res?.['Deal Won']?.total_count, todayCount: res?.['Deal Won']?.today, icon: '💵', name1: 'Today', name2: 'Total' }
                );
            }

            setState({ cardData: count, chartLoading: false });
        } catch (error) {
            setState({ chartLoading: false });
            console.log('error: ', error);
        }
    };

    const DMGraphData = async () => {
        try {
            setState({ chartsLoading: true });
            const body = bodyData();
            const res: any = await Models.lead.leadGraph(body?.from_date, body?.end_date);
            const tableData = chartData(res);
            const options = {
                series: [
                    {
                        name: 'Leads',
                        data: tableData.map((data) => data.monthCount),
                    },
                ],
                options: {
                    chart: {
                        height: 350,
                        type: 'bar',
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: '50%',
                            endingShape: 'rounded',
                        },
                    },
                    stroke: {
                        width: 2,
                        colors: ['transparent'],
                    },
                    xaxis: {
                        title: {
                            text: 'Dates',
                        },
                        categories: tableData.map((data) => data.title),
                    },
                    yaxis: {
                        title: {
                            text: 'Number Of Leads',
                        },
                        labels: {
                            formatter: function (val: number) {
                                return val.toFixed(0);
                            },
                        },
                        tickAmount: 10,
                        min: 0,
                        max: 100,
                    },
                    colors: ['#9957B3'],
                    tooltip: {
                        y: {
                            formatter: (val: number) => {
                                if (val === undefined || val === null) {
                                    return 'N/A';
                                }
                                return val.toString();
                            },
                        },
                    },
                    responsive: [
                        {
                            breakpoint: 576,
                            options: {
                                chart: {
                                    height: 300,
                                },
                            },
                        },
                    ],
                },
            };

            setState({ chartsLoading: false, chartData: options });
        } catch (error) {
            setState({ chartsLoading: false });
            console.log('error: ', error);
        }
    };

    const DMGraphCustomData = async (body) => {
        try {
            setState({ chartsLoading: true });
            const res: any = await Models.lead.leadGraph(body?.from_date, body?.end_date);
            const tableData = chartData(res);
            const options = {
                series: [
                    {
                        name: 'Leads',
                        data: tableData.map((data) => data.monthCount),
                    },
                ],
                options: {
                    chart: {
                        height: 350,
                        type: 'bar',
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: '50%',
                            endingShape: 'rounded',
                        },
                    },
                    stroke: {
                        width: 2,
                        colors: ['transparent'],
                    },
                    xaxis: {
                        title: {
                            text: 'Dates',
                        },
                        categories: tableData.map((data) => data.title),
                    },
                    yaxis: {
                        title: {
                            text: 'Number Of Leads',
                        },
                        labels: {
                            formatter: function (val: number) {
                                return val.toFixed(0);
                            },
                        },
                        tickAmount: 10,
                        min: 0,
                        max: 100,
                    },
                    colors: ['#9957B3'],
                    tooltip: {
                        y: {
                            formatter: (val: number) => {
                                if (val === undefined || val === null) {
                                    return 'N/A';
                                }
                                return val.toString();
                            },
                        },
                    },
                    responsive: [
                        {
                            breakpoint: 576,
                            options: {
                                chart: {
                                    height: 300,
                                },
                            },
                        },
                    ],
                },
            };

            setState({ chartsLoading: false, chartData: options });
        } catch (error) {
            setState({ chartsLoading: false });
            console.log('error: ', error);
        }
    };

    const handleEdit = (id) => {
        dispatch(leadIndex(state.currentPage));
        router.push(`/updateLead?id=${id}`);
    };

    const handleView = (id) => {
        dispatch(leadIndex(state.currentPage));
        router.push(`/viewLead?id=${id}`);
    };

    const tableData = (res, role) => {
        const data = res?.map((item) => {
            return {
                ...item,
                allData: item,
                lead: item.lead,
                opportunity: item?.name,
                // opportunity: item?.opportunities?.length > 0 ? item.opportunities.map((detail) => detail.name).join(', ') : '-',
                source: item.primary_contact?.lead_source?.source || '',
                date: item.created_on ? moment(item.created_on).format('DD-MM-YYYY') : '',
                contact_person: item.primary_contact?.name || '',
                lead_status: item.lead_status?.name,
                status_date: item.status_date ? moment(item.status_date).format('DD-MM-YYYY') : null,
                remark: item.remark,
                assigned_to: item.assigned_to?.username,
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
                updated_on: item?.updated_on ? moment(item?.updated_on).format('DD-MM-YYYY') : '',
                closing_date: item.closing_date ? moment(item.closing_date).format('DD-MM-YYYY') : '',
            };
        });

        let columns = [];

        switch (role) {
            case ROLE.ADMIN:
                columns = [
                    { accessor: 'lead' },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source' },
                    { accessor: 'date', title: 'Date', width: 120 },
                    { accessor: 'contact_person', title: 'Contact Person' },
                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'remark', title: 'Remark' },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Assign To" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button type="button" className="flex hover:text-primary" onClick={() => setState({ isOpenAssign: true, leadId: row.lead?.id })}>
                                        <IconUserPlus />
                                    </button>
                                </Tippy>
                                <button type="button" className="flex hover:text-primary" onClick={() => handleView(row.lead?.id)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => handleEdit(row.lead?.id)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky',
                            right: 0,
                            background: '#fff',
                            zIndex: 2,
                        },
                    },
                ];
                break;

            case ROLE.BDM:
                columns = [
                    { accessor: 'lead' },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source' },
                    { accessor: 'date', title: 'Date', width: 120 },

                    { accessor: 'contact_person', title: 'Contact Person' },

                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'remark', title: 'Remark' },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Assign To" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button type="button" className="flex hover:text-primary" onClick={() => setState({ isOpenAssign: true, leadId: row.id })}>
                                        <IconUserPlus />
                                    </button>
                                </Tippy>
                                <button type="button" className="flex hover:text-primary" onClick={() => handleView(row?.id)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => handleEdit(row?.id)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky',
                            right: 0,
                            background: '#fff',
                            zIndex: 2,
                        },
                    },
                ];
                break;

            case ROLE.BDE:
                columns = [
                    {
                        accessor: 'lead',

                        render: (row, index) => (
                            <>
                                <div className="">{row.name}</div>
                            </>
                        ),
                    },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source', title: 'Source' },
                    { accessor: 'date', title: 'Date' },
                    { accessor: 'contact_person', title: 'Contact Person' },
                    { accessor: 'contact_number', title: 'Contact Number' },
                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'remark', title: 'Remark' },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button
                                        type="button"
                                        className="flex hover:text-primary"
                                        onClick={() => {
                                            state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                        }}
                                    >
                                        <IconNotesEdit />
                                    </button>
                                </Tippy>

                                <button type="button" className="flex hover:text-primary" onClick={() => handleView(row?.id)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => handleEdit(row?.id)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                    },
                ];
                break;

            case ROLE.TM:
                columns = [
                    {
                        accessor: 'lead',

                        title: 'Company',
                    },

                    {
                        accessor: 'contact_person',
                        title: 'Contact Person',
                    },
                    { accessor: 'contact_number', title: 'Contact Number' },

                    { accessor: 'source', title: 'Source' },

                    { accessor: 'date', title: 'Date', width: 120 },
                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Follow Up', width: 120 },
                    { accessor: 'remark', title: 'Remark ' },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button
                                        type="button"
                                        className="flex hover:text-primary"
                                        onClick={() => {
                                            state.expandedRow == row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                        }}
                                    >
                                        <IconNotesEdit />
                                    </button>
                                </Tippy>

                                <button type="button" className="flex hover:text-primary" onClick={() => handleView(row?.id)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => handleEdit(row?.id)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                    },
                ];
                break;

            case ROLE.DM:
                columns = [
                    {
                        accessor: 'lead',
                    },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source', title: 'Source' },
                    { accessor: 'date', title: 'Date' },
                    { accessor: 'contact_person', title: 'Contact Person' },
                    {
                        accessor: 'last_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lastStatus === 'New'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lastStatus === 'Contacted'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lastStatus === 'Qualified'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lastStatus === 'Disqualified'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lastStatus === 'Follow-Up'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lastStatus === 'Converted'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lastStatus}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'remark', title: 'Remark' },

                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button
                                        type="button"
                                        className="flex hover:text-primary"
                                        onClick={() => {
                                            // Toggle row expansion
                                            state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                        }}
                                    >
                                        <IconNotesEdit />
                                    </button>
                                </Tippy>

                                <button type="button" className="flex hover:text-primary" onClick={() => handleView(row?.id)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => handleEdit(row?.id)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky', // Sticky position
                            right: 0, // Fix to the right side
                            background: '#fff', // Background color for better visibility
                            zIndex: 2, // Ensure it's above other elements
                        },
                    },
                ];
                break;

            default:
                console.warn('Invalid role provided!');
                break;
        }
        setState({ data: data, allData: res, columns: columns });
    };

    const getData = async () => {
        try {
            let res;
            if (state.activeTab === 'Year') {
                res = filterByDates('Year');
            } else if (state.activeTab === 'Last Month') {
                res = filterByDates('Last Month');
            } else if (state.activeTab === 'This Month') {
                res = filterByDates('This Month');
            } else if (state.activeTab === 'Last 7 Days') {
                res = filterByDates('Last 7 Days');
            }
            setState({ loading: false });
        } catch (error) {
            console.log('error: ', error);
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

    const orderFilter = ['Year', 'Last Month', 'This Month', 'Last 7 Days', 'Custom'];

    const handleNextPage = () => {
        if (state.next) {
            const newPage = state.currentPage + 1;
            filterData(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            const newPage = state.currentPage - 1;
            filterData(newPage);
        }
    };

    const clearFilter = () => {
        setState({
            activeTab: '',
            from_date: '',
            end_date: '',
            card_lead_status: '',
            opporunity_status: '',
            today: false,
            month: false,
        });
        // getAllData(state.currentPage);
        // countData();
    };

    const filterData = async (page) => {
        try {
            setState({ loading1: true });
            let body = bodyData();
            console.log('body: ', body);
            const res: any = await Models.auth.userDetails();
            const response: any = await Models.opportunity.filtersByOwnLead(body, page, res?.id);
            tableData(response?.results, state.role);
            setState({
                loading1: false,
                totalRecords: response.count,
                next: response.next,
                previous: response.previous,
                isOpen: false,
                currentPage: page,
                count: response.count,
            });
            // } else {
            //     getAllData(state.currentPage);
            //     countData();

            //     setState({
            //         loading: false,

            //         isOpen: false,
            //     });
            // }
        } catch (error) {
            setState({ loading1: false });
        }
    };

    const filterCustomDate = async () => {
        try {
            setState({ loading1: true })
            let body = bodyData();
            if (state.from_date) {
                body.from_date = moment(state.from_date).format('YYYY-MM-DD');
            }

            if (state.end_date) {
                body.end_date = moment(state.end_date).format('YYYY-MM-DD');
            }
            const response: any = await Models.opportunity.filters(body, state.currentPage);
            tableData(response?.results, state.role);
            countData();
            DMGraphCustomData(body);
            setState({
                totalRecords: response.count,
                next: response.next,
                previous: response.previous,
                isOpen: false,
                loading1: false
            });
        } catch (error) {
            setState({ loading1: false })

            console.log('error: ', error);
        }
    };
    const filterCards = async (card, date) => {
        if (date == 'today') {
            setState({ today: true, card_lead_status: card.title, opporunity_status: card.id });
        } else {
            setState({ today: false });
        }

        if (date == 'month') {
            setState({ month: true, card_lead_status: card.title, opporunity_status: card.id });
        } else {
            setState({ month: false });
        }

        try {
            // setState({ loading: true });
            // let body = bodyData();
            // console.log('body', body);
            // // if (!objIsEmpty(body)) {
            // const response: any = await Models.opportunity.filters(body, state.currentPage);
            // console.log(response, 'response');
            // tableData(response?.results, state.role);
            // setState({
            //     loading: false,
            //     // totalRecords: response.count,
            //     // next: response.next,
            //     // previous: response.previous,
            //     // isOpen: false,
            // });
        } catch (error) {
            setState({ loading: false });
        }
    };

    // console.log(state.filterCard1, "FilterCard1");

    // const filterCard2 = async (card) => {
    //     console.log('card', card);
    //     console.log(card.title, card.name2);
    //     setState({ filterCard2: card.name2 });

    //     try {
    //         setState({ loading: true });
    //         let body = bodyData();
    //         console.log('body', body);

    //         // if (!objIsEmpty(body)) {
    //         const response: any = await Models.opportunity.filters(body, state.currentPage);
    //         console.log(response, 'response');

    //         tableData(response?.results, state.role);
    //         setState({
    //             loading: false,
    //             // totalRecords: response.count,
    //             // next: response.next,
    //             // previous: response.previous,
    //             // isOpen: false,
    //         });
    //     } catch (error) {
    //         setState({ loading: false });
    //     }
    // };

    const bodyData = () => {
        let body: any = {};
        if (state.search) {
            body.search = state.search;
        }

        if (state.lead_source) {
            body.lead_source = state.lead_source?.value;
        }
        if (state.opportunity) {
            body.opportunity = state.opportunity?.value;
        }
        if (state.lead_status) {
            body.status = state.lead_status?.value;
        }
        if (state.assigned_to) {
            body.assigned_to = state.assigned_to?.value;
        } else if (state.bdm) {
            if (state.roles?.label == 'TM') {
                if (state.tm) {
                    body.tm = state.tm?.value;
                } else {
                    body.bdm = state.bdm?.value;
                }
            } else if (state.roles?.label == 'BDE') {
                if (state.bde) {
                    body.bde = state.bde?.value;
                } else {
                    body.bdm = state.bdm?.value;
                }
            } else {
                body.bdm = state.bdm?.value;
            }
        } else if (state.bde) {
            body.bde = state.bde?.value;
        } else if (state.dm) {
            body.dm = state.dm?.value;
        } else if (state.tm) {
            body.tm = state.tm?.value;
        }
        if (state.today == true && state?.card_lead_status) {
            body.today = state.today;
            body.card_lead_status = state?.card_lead_status;
            body.opporunity_status = state?.opporunity_status;
        }
        if (state.month == true && state?.card_lead_status) {
            body.month = state.month;
            body.card_lead_status = state?.card_lead_status;
            body.opporunity_status = state?.opporunity_status;
        }
        if (state.activeTab == 'Year') {
            let date = getDateRange('Year');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.activeTab == 'Last Month') {
            let date = getDateRange('lastMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.activeTab == 'This Month') {
            let date = getDateRange('thisMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }
        if (state.activeTab == 'Last 7 Days') {
            let date = getDateRange('last7Days');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.from_date) {
            body.from_date = moment(state.from_date).format('YYYY-MM-DD');
        }

        if (state.end_date) {
            body.end_date = moment(state.end_date).format('YYYY-MM-DD');
        }

        // if (state.range[0] > 0 || state.range[1] != state.maxPrice) {
        //     (body.min_revenue = state.range[0]), (body.max_revenue = state.range[1]);
        // }

        return body;
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
            setState({ card_lead_status: null, today: false, month: false, opporunity_status: null });
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

    const exportToExcel = async () => {
        setState({ excelLoading: true });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Define the columns you want to export
        const exportColumns = [
            {
                title: `${ROLE.TM == state.role ? 'Company' : 'Lead'}`,
                accessor: (row: any) => row?.lead?.name,
            },
            ...(state.role === ROLE.BDE || state.role === ROLE.BDM || state.role === ROLE.DM || state.role === ROLE.ADMIN
                ? [
                      {
                          title: 'Opportunity',
                          accessor: (row: any) => row?.name?.name,
                      },
                  ]
                : []),
            {
                title: 'Contact Person',
                accessor: 'contact_person',
            },
            ...(state.role == ROLE.BDE || state.role == ROLE.TM
                ? [
                      {
                          title: 'Contact Number',
                          accessor: 'contact_number',
                      },
                  ]
                : []),
            {
                title: 'Source',
                accessor: 'source',
            },
            {
                title: 'Date',
                accessor: 'date',
            },
            {
                title: 'Opportunity Status',
                accessor: (row: any) => row?.opportunity_status?.name,
            },
            {
                title: `${ROLE.TM == state.role ? 'Follow Up' : 'Status Date'}`,
                accessor: 'status_date',
            },
            {
                title: 'Remark',
                accessor: 'remark',
            },
        ];

        // Add header row
        worksheet.addRow(exportColumns.map((col) => col.title));

        // Get user details once
        const res: any = await Models.auth.userDetails();
        const userId = res?.id;

        let page = 1;
        let hasMoreData = true;
        let allData: any[] = [];

        // Loop through all pages until no more data
        while (hasMoreData) {
            try {
                const body = bodyData(); // Get your filter body
                const response: any = await Models.opportunity.filtersByOwnLead(body, page, userId);

                if (response?.results && response?.results.length > 0) {
                    allData = [...allData, ...response?.results];
                }
                if (response?.next) {
                    page++;
                } else {
                    hasMoreData = false;
                }
            } catch (error) {
                console.error('Error fetching data for export:', error);
                hasMoreData = false;
            }
        }
        setState({ excelLoading: false });

        const data = allData?.map((item) => {
            return {
                ...item,
                allData: item,
                lead: item.lead,
                opportunity: item?.name,
                // opportunity: item?.opportunities?.length > 0 ? item.opportunities.map((detail) => detail.name).join(', ') : '-',
                source: item.primary_contact?.lead_source?.source || '',
                date: item.created_on ? moment(item.created_on).format('DD-MM-YYYY') : '',
                contact_person: item.primary_contact?.name || '',
                lead_status: item.lead_status?.name,
                status_date: item.status_date ? moment(item.status_date).format('DD-MM-YYYY') : null,
                remark: item.remark,
                assigned_to: item.assigned_to?.username,
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
            };
        });

        // Add all data rows to worksheet
        data.forEach((row: any) => {
            const rowData = exportColumns.map((col) => {
                if (typeof col.accessor === 'function') {
                    return col.accessor(row);
                }
                return row[col.accessor];
            });
            worksheet.addRow(rowData);
        });

        // Auto-fit columns
        exportColumns.forEach((_, i) => {
            const headerLength = exportColumns[i].title.length;
            worksheet.getColumn(i + 1).width = Math.max(20, headerLength + 2);
        });

        // Generate and save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        FileSaver.saveAs(
            new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'Leads.xlsx'
        );
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                {/* Title Section */}
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">LEADS</h5>
                </div>

                {/* Button Section */}
                <div className="flex">
                    <button type="button" className="btn btn-primary w-auto" onClick={() => router.push('/create_contact')}>
                        + Create
                    </button>
                </div>
            </div>

            <div className="panel flex flex-wrap items-center justify-between gap-2 md:gap-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    {orderFilter?.map((link, index) => (
                        <React.Fragment key={index}>
                            <div
                                onClick={() => setState({ activeTab: link })}
                                className={`cursor-pointer border-r px-1 py-2  font-bold md:px-4 ${
                                    link === state.activeTab ? 'border-primary text-primary' : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                                } dark:hover:text-primary-dark hover:text-primary`}
                            >
                                {link?.split(' ')?.map((word, i) => (
                                    <React.Fragment key={i}>
                                        <span className="text-md">{word}</span>
                                        {i !== link.split(' ').length - 1 && <span className=" "></span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-full md:w-auto">
                            <input
                                type="datetime-local"
                                value={state.from_date}
                                onChange={(e) => setState({ from_date: e.target.value })}
                                id="dateTimeCreated"
                                name="dateTimeCreated"
                                className="form-input w-full"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <input
                                type="datetime-local"
                                value={state.end_date}
                                onChange={(e) => setState({ end_date: e.target.value })}
                                id="dateTimeCreated"
                                name="dateTimeCreated"
                                className="form-input w-full"
                            />
                        </div>
                        <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => filterCustomDate()}>
                            Go
                        </button>

                        <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => exportToExcel()}>
                            {state.excelLoading ? <IconLoader className=" h-4 w-4 animate-spin" /> : 'Excel'}
                        </button>
                    </div>
                </div>

                <button type="button" className="btn btn-primary w-full sm:mt-4 md:w-auto lg:mt-1" onClick={() => clearFilter()}>
                    Clear
                </button>
            </div>

            {/* {ROLE.DM === state.role && (
                <div className="chart-container panel mb-2 mt-2">
                    {!state.chartsLoading && <ReactApexChart series={state?.series} options={state?.chartData?.options} type="bar" height={400} width={'100%'} />}
                </div>
            )} */}

            <div className="panel mt-2 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div
                    // className={`relative flex items-center  rounded-full border border-gray-300 dark:border-white-dark/30 sm:w-[${
                    //     state.role == 'ADMIN' ? '400px' : state.role == 'BDE' ? '400px' : '1000px'
                    // }] `}
                    className={`relative flex w-full items-center  rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3 `}
                >
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search by lead name"
                        className="form-input rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    {/* {ROLE.ADMIN == state.role && (
                        <>
                            <CustomSelect
                                options={state.bdmList}
                                value={state.bdm}
                                onChange={(e) => setState({ bdm: e, bde: null, roles: null, tm: null })}
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
                                onChange={(e) => setState({ roles: e, bde: null, tm: null })}
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
                                        value={state.tm}
                                        onChange={(e) => setState({ tm: e })}
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
                    )} */}
                    {
                        ROLE.TM == state.role || ROLE.DM === state.role ? (
                            <>
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
                                    className="w-full"
                                />
                                <CustomSelect
                                    value={state.assigned_to}
                                    onChange={(e) => setState({ assigned_to: e })}
                                    placeholder={'Assign To'}
                                    options={state.assignList}
                                    error={state.errors?.assigned_to}
                                    className="w-full"
                                    required
                                />
                            </>
                        ) : null
                        // ROLE.BDE == state.role && (
                        //     <CustomSelect
                        //         value={state.opportunity}
                        //         onChange={(e) => setState({ opportunity: e })}
                        //         placeholder={'Opportunity'}
                        //         options={state.opportunityList}
                        //         error={state.errors?.opportunity}
                        //         required
                        //     />
                        // )
                    }

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
                    <CustomSelect
                        value={state.opportunity}
                        onChange={(e) => setState({ opportunity: e })}
                        placeholder={'Opportunity'}
                        options={state.opportunityList}
                        error={state.errors?.opportunity}
                        required
                    />
                    {/* <button className="btn btn-primary w-full lg:w-auto" onClick={() => setState({ isOpen: true })}>
                        <IconFilter />
                    </button> */}
                </div>
            </div>

            {state.role !== ROLE.DM && (
                <div className="pb-2 pt-2">
                    <SimpleGrid
                        cols={state.role == ROLE.BDE || state.role == ROLE.BDM || state.role == ROLE.ADMIN ? 6 : 5}
                        spacing="sm"
                        breakpoints={[
                            { maxWidth: 768, cols: 2 },
                            { maxWidth: 576, cols: 1 },
                        ]}
                    >
                        {state.cardData.map((card: any, index: any) => (
                            <div className="panel">
                                <div className="mb-5 flex items-center font-semibold">
                                    <div className="grid h-6 w-6 shrink-0 place-content-center rounded-full md:h-8 md:w-8">
                                        <IconBitcoin />
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-sm  font-bold  text-dark dark:text-white-light lg:text-lg">{card.title}</h6>
                                        {/* <p className="text-xs text-white-dark">Bitcoin</p> */}
                                    </div>
                                </div>

                                {/* {ROLE.DM == state.role && (  
                            <div className="mb-5">{state.loading && <ReactApexChart series={bitcoin.series} options={bitcoin.options} type="line" height={45} width={'100%'} />}</div>
                            )} */}

                                <div className="flex items-center justify-between text-base font-bold">
                                    <div>
                                        <div className="text-sm font-normal ">{card.name1}</div>
                                        <div>
                                            <span className="text-xl font-bold  text-success">{card.todayCount ? card.todayCount : 0}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-normal "> {card.name2}</div>
                                        <div>
                                            <span className="text-xl font-bold text-success">{card.monthCount ? card.monthCount : 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </SimpleGrid>
                </div>
            )}

            {ROLE.ADMIN == state.role ? (
                <>
                    {!state?.dm && (state?.bdm || state?.roles || state?.bde || state?.card_lead_status) && (
                        <p className="flex items-center gap-2 text-sm font-semibold">
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
                        <div className="pb-2 ">
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
                    <div className="flex gap-2">
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
                    <div className="flex gap-2">
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
                    <div className="flex gap-2">
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

            {state.data?.length > 0 && (
                <>
                    <div className="flex items-center justify-end pb-2 pr-3">
                        <div className="rounded-lg bg-gray-300 p-1 font-semibold">{pageCounts(state.currentPage, state.totalRecords)}</div>
                    </div>
                </>
            )}

            <>
                <div>
                    <DataTable
                        className="table-responsive"
                        records={state.data}
                        fetching={state.loading1 || state.loading || state.subLoading}
                        loaderSize="lg"
                        loaderVariant="dots"
                        loaderColor="blue"
                        loaderBackgroundBlur={0}
                        // onRowClick={()=>tableRow(state.data)}
                        columns={[
                            {
                                accessor: 'lead',

                                title: `${ROLE.TM == state.role ? 'Company' : 'Lead'}`,
                                render: (row: any) => <div>{row?.lead?.name}</div>,
                            },
                            ...(state.role === ROLE.BDE || state.role === ROLE.BDM || state.role === ROLE.DM || state.role === ROLE.ADMIN
                                ? [
                                      {
                                          accessor: 'name',
                                          title: 'Opportunity',
                                          sortable: false,
                                          width: 150,
                                          render: (row) => (
                                              <div>
                                                  {row?.name?.name} {/* {row?.opportunity_keyword && `(${row?.opportunity_keyword})`} */}
                                              </div>
                                          ),
                                      },
                                  ]
                                : []),

                            {
                                accessor: 'contact_person',
                                title: 'Contact Person',
                            },

                            ...(state.role == ROLE.BDE || state.role == ROLE.TM ? [{ accessor: 'contact_number', title: 'Contact Number' }] : []),

                            { accessor: 'source', title: 'Source' },

                            { accessor: 'date', title: 'Created Date', width: 120 },
                            {
                                accessor: 'opportunity_status',
                                title: 'Opportunity Status',
                                render: (row) => (
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

                            // { accessor: 'status_date', title: `${ROLE.TM == state.role ? 'Follow Up' : 'Status Date'}` },
                            { accessor: 'updated_on', title: 'Updated Date' },
                            { accessor: 'closing_date', title: 'Closing Date' },

                            {
                                accessor: 'remark',
                                title: 'Remark ',
                                render: (row: any) => (
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
                                        {/* <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                                <button
                                                    type="button"
                                                    className="flex hover:text-primary"
                                                    onClick={() => {
                                                        state.expandedRow == row.lead?.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.lead?.id });
                                                    }}
                                                >
                                                    <IconNotesEdit />
                                                </button>
                                            </Tippy> */}

                                        <button
                                            type="button"
                                            className="flex hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(row.lead?.id);
                                            }}
                                        >
                                            <IconEye />
                                        </button>
                                        <button
                                            className="flex hover:text-info"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(row.lead?.id);
                                            }}
                                        >
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={state.taskList?.length}
                        recordsPerPage={state.pageSize}
                        minHeight={200}
                        page={null}
                        onPageChange={(p) => {}}
                        withBorder={true}
                        // sortStatus={sortStatus}
                        // onSortStatusChange={setSortStatus}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        onRowClick={({ id }) => {
                            if (state.expandedRow != id) {
                                setState({ expandedRow: id });
                                // router.push(`/update_contact?id=${id}`);
                            }
                        }}
                        rowExpansion={{
                            collapseProps: {
                                transitionDuration: 500,
                                animateOpacity: false,
                                transitionTimingFunction: 'ease-out',
                            },
                            allowMultiple: false,

                            content: ({ record, collapse }) => {
                                return (
                                    <>
                                        {state.expandedRow === record?.id ? (
                                            <div className="w-full bg-gray-50 px-4 py-2">
                                                <QuickEdit
                                                    id={state.expandedRow}
                                                    data={record}
                                                    collapse={() => {
                                                        collapse();
                                                    }}
                                                    statusList={state.statusList}
                                                    updateList={() => {
                                                        collapse();
                                                        setState({ expandedRow: null });
                                                        filterData(state?.currentPage);
                                                        countData();
                                                    }}
                                                    resetExpandedRow={() => {
                                                        setState({ expandedRow: null });
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </>
                                );
                            },
                        }}
                    />
                </div>

                <div className="mt-5 flex justify-center gap-3">
                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.count}
                        onPageChange={(page) => {
                            filterData(page);
                        }}
                        hasNext={state.next !== null}
                        hasPrevious={state.previous !== null}
                        recordsPerPage={10}
                    />
                </div>
            </>

            <SideMenu
                title="Filter"
                open={state.isOpen}
                close={() => setState({ isOpen: false })}
                cancelOnClick={() => clearFilter()}
                submitOnClick={() => filterData(state?.currentPage)}
                submitLoading={state.loading}
                canceTitle="Reset"
                renderComponent={() => (
                    <div>
                        <div className=" mb-5 mt-5 flex flex-col gap-4 md:mt-0  md:justify-between">
                            <CustomeDatePicker error={state.errors?.closing_date} value={state.opp_closing_date} placeholder="Date" title="Date" onChange={(e) => setState({ opp_closing_date: e })} />
                            <CustomSelect
                                title="Opportunity"
                                value={state.tags}
                                isMulti={true}
                                onChange={(e) => setState({ tags: e })}
                                placeholder={'Opportunity'}
                                options={state.tagList}
                                error={state.errors?.tags}
                            />
                            <CustomSelect
                                title="Status"
                                value={state.tags}
                                isMulti={true}
                                onChange={(e) => setState({ tags: e })}
                                placeholder={'Status'}
                                options={state.tagList}
                                error={state.errors?.tags}
                            />

                            {/*CustomSelect  */}
                        </div>
                    </div>
                )}
            />
        </div>
    );
};
export default PrivateRouter(Leads);
