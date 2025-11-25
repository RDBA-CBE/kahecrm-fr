import IconBitcoin from '@/components/Icon/IconBitcoin';
import IconPlus from '@/components/Icon/IconPlus';
import FullCalendar from '@fullcalendar/react';
import { Card, SimpleGrid, Text, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import CustomfullCalender from '@/common_component/fullCalender';
import { Models, PrivateRouter } from '@/utils/imports.utils';
import { Dropdown, formatIndianRupees, formatMonthYear, getColorScheme, getDateRange, objIsEmpty, pageCounts, useSetState } from '@/utils/functions.utils';
import { ROLE } from '@/utils/constant.utils';
import AdvancedMonthWiseLeadTable from '@/components/monthwiseTable';
import AdminDashboard from '@/components/DashboardCard';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import IconX from '@/components/Icon/IconX';
import CustomSelect from '@/components/Select';
import IconSearch from '@/components/Icon/IconSearch';
import UserTargetCard from '@/components/UserTargetCard';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import moment from 'moment';
import useDebounce from '@/common_component/useDebounce';
import { useRouter } from 'next/router';
import Pagination from '@/components/Pagination';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Dashboards = () => {
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();

    const [state, setState] = useSetState({
        state: [],
        activeTab: '',
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
        cardData: [],
        chartLoading: false,
        sourceList: [],
        assignList: [],
        expandedRow: null,
        coloumns: [],
        group: '',
        leadList: [],
        userCardData: [],
        bdm: null,
        filterMonth: null,
        // data:
    });

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        setIsMounted(true);
        getRole();
        bdmList();
        dmList();
        statusList();
        sourceList();
        getOpportunityList();
    }, []);

    useEffect(() => {
        if (state.roles?.value == 'BDE') {
            bdeList();
        } else {
            telecallerList();
        }
    }, [state.roles]);

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

    useEffect(() => {
        if (state.tm?.value || state.bde?.value || state.bdm?.value || state.dm?.value) {
            userCardData();
        } else {
            setState({ userCardData: [] });
        }
    }, [state.tm, state.dm, state.bde, state.bdm]);

    useEffect(() => {
        leadList(1);
    }, [
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
        state.filterMonth,
    ]);

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

    const getRole = async () => {
        try {
            const res: any = await Models.auth.userDetails();
            setState({ role: res?.designation, userId: res?.id });

            let role: any = null;
            if (res?.designation == ROLE.ADMIN) {
                // setState({role : ROLE.ADMIN})
                // setState({ bdm: { value: 10, label: `Manikandan G` } });
                // role = {
                //     bdm: 10,
                // };
            } else if (res?.designation != ROLE.BDM) {
                if (res?.designation == ROLE.BDE) {
                    setState({ bde: { value: res?.id, label: `${res?.first_name} ${res?.last_name}` } });
                    role = {
                        bde: res?.id,
                    };
                }

                if (res?.designation == ROLE.TM) {
                    setState({ tm: { value: res?.id, label: `${res?.first_name} ${res?.last_name}` } });
                    role = {
                        tm: res?.id,
                    };
                }

                if (res?.designation == ROLE.DM) {
                    setState({ dm: { value: res?.id, label: `${res?.first_name} ${res?.last_name}` } });
                    role = {
                        dm: res?.id,
                    };
                }
            }
            adminCardData();
            leadList(1, role, res?.designation);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const adminCardData = async () => {
        try {
            setState({ loading: true });
            const body = {
                team: 'Yes',
            };
            const res: any = await Models.report.adminCardData(body);
            // const mergedData = res?.map((item) => ({
            //     ...item,
            //     colorScheme: getColorScheme(item.type),
            // }));

            const mergedData = res?.map((item) => {
                let subtitle = '';
                if (item.type === 'prevMonth' || item.type === 'currentMonth') {
                    subtitle = formatMonthYear(item.start_date); // e.g., "November 2025"
                } else {
                    const start = formatMonthYear(item.start_date);
                    const end = formatMonthYear(item.end_date);
                    subtitle = `${start} - ${end}`; // e.g., "October 2025 - December 2025"
                }
                return {
                    ...item,
                    subtitle,
                    colorScheme: getColorScheme(item.title),
                };
            });

            setState({ adminCardData: mergedData, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const userCardData = async () => {
        try {
            setState({ loading: true });
            const body = cardBodyData();
            const res: any = await Models.report.adminCardData(body);
            // const mergedData = res?.map((item) => ({
            //     ...item,
            //     colorScheme: getColorScheme(item.type),
            // }));

            const mergedData = res?.map((item) => {
                let subtitle = '';
                if (item.type === 'prevMonth' || item.type === 'currentMonth') {
                    subtitle = formatMonthYear(item.start_date); // e.g., "November 2025"
                } else {
                    const start = formatMonthYear(item.start_date);
                    const end = formatMonthYear(item.end_date);
                    subtitle = `${start} - ${end}`; // e.g., "October 2025 - December 2025"
                }
                return {
                    ...item,
                    subtitle,
                    colorScheme: getColorScheme(item.title),
                };
            });
            setState({ userCardData: mergedData, loading: false });
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

    const leadList = async (page, role = null, userRole = null) => {
        //  console.log("role.bdm", role.bdm);

        try {
            setState({ loading: true });
            let body = bodyData();

            if (role) {
                body = {
                    ...body,
                    ...role,
                };
                if (role.bdm) body.bdm = role.bdm;
                if (role.bde) body.bde = role.bde;
                if (role.tm) body.tm = role.tm;
                if (role.dm) body.dm = role.dm;
            }


            const res: any = await Models.auth.userDetails();

            // Use userRole parameter if provided, otherwise use state.role
            const currentRole = userRole || state.role;

            let response: any;

            if (ROLE.ADMIN == currentRole || ROLE.BDM == currentRole) {
                response = await Models.opportunity.dashboardLead(body, page);
            } else {
                response = await Models.opportunity.dashboardLead(body, page, res?.id);
            }

            // const response: any = await Models.opportunity.dashboardLead(body, page, res?.id);
            tableData(response?.results, currentRole);
            setState({
                loading: false,
                totalRecords: response.count,
                next: response.next,
                previous: response.previous,
                isOpen: false,
                currentPage: page,
                count: response?.count,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const bodyData = () => {
        let body: any = {};

        body.team = true;

        body.display_date_source = true;

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
        if (state.bde) {
            body.bde = state.bde?.value;
        }
        if (state.dm) {
            body.dm = state.dm?.value;
        }
        if (state.tm) {
            body.tm = state.tm?.value;
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
        } else {
            body.created_by = state.userId;
        }

        if (state.filterMonth?.value == 'Year') {
            let date = getDateRange('Year');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.filterMonth?.value == 'Last Month') {
            let date = getDateRange('lastMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.filterMonth?.value == 'This Month') {
            let date = getDateRange('thisMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }
        if (state.filterMonth?.value == 'Last 7 Days') {
            let date = getDateRange('last7Days');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        // body.opportunity_status = 34;

        return body;
    };

    const cardBodyData = () => {
        const body: any = {};

        body.team = 'Yes';

        if (state.tm?.value) {
            body.user_id = state.tm?.value;
        } else if (state.bde?.value) {
            body.user_id = state.bde?.value;
        } else if (state.bdm?.value) {
            body.user_id = state.bdm?.value;
        } else if (state.dm?.value) {
            body.user_id = state.dm?.value;
        }
        return body;
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
                // assigned_to: item.assigned_to?.username,
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
                created_by: `${item?.created_by?.first_name} ${item?.created_by?.last_name}`,
                assigned_to: item?.lead?.assigned_to?.first_name ? `${item?.lead?.assigned_to?.first_name} ${item?.lead?.assigned_to?.last_name}` : '',
                updated_on: item.updated_on ? moment(item.updated_on).format('DD-MM-YYYY') : '',
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
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },

                    { accessor: 'remark', title: 'Remark' },

                    // {
                    //     accessor: 'actions',
                    //     title: 'Actions',
                    //     render: (row: any) => (
                    //         <div className="mx-auto flex w-max items-center gap-4">
                    //             <Tippy content="Assign To" className="rounded-lg bg-black p-1 text-sm text-white">
                    //                 <button type="button" className="flex hover:text-primary" onClick={() => setState({ isOpenAssign: true, leadId: row.lead?.id })}>
                    //                     <IconUserPlus />
                    //                 </button>
                    //             </Tippy>
                    //             <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.lead?.id}`)}>
                    //                 <IconEye />
                    //             </button>
                    //             <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.lead?.id}`)}>
                    //                 <IconEdit className="h-4.5 w-4.5" />
                    //             </button>
                    //         </div>
                    //     ),
                    //     style: {
                    //         position: 'sticky',
                    //         right: 0,
                    //         background: '#fff',
                    //         zIndex: 2,
                    //     },
                    // },
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
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark' },
                    // {
                    //     accessor: 'actions',
                    //     title: 'Actions',
                    //     render: (row: any) => (
                    //         <div className="mx-auto flex w-max items-center gap-4">
                    //             <Tippy content="Assign To" className="rounded-lg bg-black p-1 text-sm text-white">
                    //                 <button type="button" className="flex hover:text-primary" onClick={() => setState({ isOpenAssign: true, leadId: row.id })}>
                    //                     <IconUserPlus />
                    //                 </button>
                    //             </Tippy>
                    //             <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                    //                 <IconEye />
                    //             </button>
                    //             <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                    //                 <IconEdit className="h-4.5 w-4.5" />
                    //             </button>
                    //         </div>
                    //     ),
                    //     style: {
                    //         position: 'sticky',
                    //         right: 0,
                    //         background: '#fff',
                    //         zIndex: 2,
                    //     },
                    // },
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
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark' },
                    // {
                    //     accessor: 'actions',
                    //     title: 'Actions',
                    //     render: (row: any) => (
                    //         <div className="mx-auto flex w-max items-center gap-4">
                    //             <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                    //                 <button
                    //                     type="button"
                    //                     className="flex hover:text-primary"
                    //                     onClick={() => {
                    //                         state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                    //                     }}
                    //                 >
                    //                     <IconNotesEdit />
                    //                 </button>
                    //             </Tippy>

                    //             <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                    //                 <IconEye />
                    //             </button>
                    //             <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                    //                 <IconEdit className="h-4.5 w-4.5" />
                    //             </button>
                    //         </div>
                    //     ),
                    // },
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
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark ' },
                    // {
                    //     accessor: 'actions',
                    //     title: 'Actions',
                    //     render: (row: any) => (
                    //         <div className="mx-auto flex w-max items-center gap-4">
                    //             <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                    //                 <button
                    //                     type="button"
                    //                     className="flex hover:text-primary"
                    //                     onClick={() => {
                    //                         state.expandedRow == row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                    //                     }}
                    //                 >
                    //                     <IconNotesEdit />
                    //                 </button>
                    //             </Tippy>

                    //             <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                    //                 <IconEye />
                    //             </button>
                    //             <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                    //                 <IconEdit className="h-4.5 w-4.5" />
                    //             </button>
                    //         </div>
                    //     ),
                    // },
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
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark' },

                    // {
                    //     accessor: 'actions',
                    //     title: 'Actions',
                    //     render: (row: any) => (
                    //         <div className="mx-auto flex w-max items-center gap-4">
                    //             <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                    //                 <button
                    //                     type="button"
                    //                     className="flex hover:text-primary"
                    //                     onClick={() => {
                    //                         state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                    //                     }}
                    //                 >
                    //                     <IconNotesEdit />
                    //                 </button>
                    //             </Tippy>

                    //             <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                    //                 <IconEye />
                    //             </button>
                    //             <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                    //                 <IconEdit className="h-4.5 w-4.5" />
                    //             </button>
                    //         </div>
                    //     ),
                    //     style: {
                    //         position: 'sticky', // Sticky position
                    //         right: 0, // Fix to the right side
                    //         background: '#fff', // Background color for better visibility
                    //         zIndex: 2, // Ensure it's above other elements
                    //     },
                    // },
                ];
                break;

            default:
                console.warn('Invalid role provided!');
                break;
        }
        setState({ data: data, allData: res, columns: columns });
    };

    const leadSourceChart = {
        series: [45, 25, 15, 10, 5],
        options: {
            chart: { type: 'donut', height: '100px' },
            labels: ['Website', 'Social Media', 'Referrals', 'Ads', 'Others'],
            colors: ['#1B998B', '#E84855', '#F9C22E', '#A8C686', '#374785'],
        },
    };
    const pipelineValueByStageChart = {
        series: [25, 35, 20, 20],
        options: {
            chart: { type: 'pie' },
            labels: ['Retails', 'AutoMobile', 'IT', 'Education'],
            colors: ['#FFC107', '#03A9F4', '#8BC34A', '#FF5722'],
        },
    };

    const customerFeedbackChart = {
        series: [{ name: 'Feedback', data: [80, 70, 90, 85, 75] }],

        options: {
            chart: {
                height: 350, // Adjust the height for the bar chart
                type: 'bar', // Define the chart type
                sparkline: {
                    enabled: false, // Not using sparkline here, as it's a bar chart
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                },
            },
            stroke: {
                width: 2,
                colors: ['transparent'],
            },

            xaxis: { categories: ['Follow Up', 'In Progress', 'Follow Up', 'In Progress', 'Follow Up'] },

            yaxis: {
                title: {
                    text: 'Count',
                },
            },
            colors: ['#00E396', '#008FFB'], // Colors for the bars
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
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 300, // Adjust for smaller screens
                        },
                    },
                },
            ],
        },
    };

    const LeadStatus = {
        series: [
            {
                name: 'Feedback',
                data: [80, 70, 90, 85, 75],
            },
        ],
        options: {
            chart: {
                type: 'bar',
            },
            xaxis: {
                categories: ['New', 'Follow Up', 'In Progress', 'Qualified', 'Contacted'],
            },
            colors: ['#FF5733', '#33FF57', '#3357FF', '#FFC300', '#8E44AD'], // Assign different colors to bars
            plotOptions: {
                bar: {
                    distributed: true, // Enables individual bar colors
                },
            },
        },
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

    const handleNextPage = () => {
        if (state.next) {
            const newPage = state.currentPage + 1;
            leadList(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            const newPage = state.currentPage - 1;
            leadList(newPage);
        }
    };

    const handleClick = (data) => {
        let userId = null;
        if (state.tm) {
            userId = state.tm?.value;
        } else if (state.dm) {
            userId = state.dm?.value;
        } else if (state.bde) {
            userId = state.bde?.value;
        } else if (state.bdm) {
            userId = state.bdm?.value;
        }

        if (userId) {
            if (data?.type == 'financialYear') {
                router.push(`/UserTargetYear?type=${'financial'}&user_id=${userId}`);
            } else if (data?.type == 'PhysicalYear') {
                router.push(`/UserTargetYear?type=${'physical'}&user_id=${userId}`);
            }
        } else {
            if (data?.type == 'financialYear') {
                router.push(`/targetYear?type=${'financial'}`);
            } else if (data?.type == 'PhysicalYear') {
                router.push(`/targetYear?type=${'physical'}`);
            }
        }
    };

    return (
        <div className="p-2">
            <div className="panel bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{'Repute Digital Bussiness Agency'}</h1>
                        <p className="text-blue-100">
                            {state.role} Dashboard - {'2025'}
                        </p>
                    </div>
                    <div className="text-right">
                        <Text size="sm" className="text-blue-100">
                            Last Updated
                        </Text>
                        <Text fw={500}>{new Date().toLocaleDateString()}</Text>
                    </div>
                </div>
            </div>
            <div className="panel mb-3 mt-3 flex flex items-center items-center justify-between gap-5 pl-3">
                <h5 className="text-lg font-semibold">Team Monthly Target</h5>
            </div>
            <div className="">
                <AdminDashboard cardData={state.adminCardData} />
            </div>

            <div className="panel mt-2 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className={`relative flex w-full items-center  rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3 `}>
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
                    {ROLE.ADMIN == state.role && (
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
                    )}
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

                    {/* {(ROLE.BDE == state.role || ROLE.TM == state.role || ROLE.DM === state.role) && ()}*/}
                    <CustomSelect
                        value={state.lead_source}
                        onChange={(e) => setState({ lead_source: e })}
                        placeholder={'Source'}
                        options={state.sourceList}
                        error={state.errors?.lead_source}
                        className="w-full"
                        required
                    />
                    {/* )}*/}

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

                    {/* {ROLE.BDE == state.role && ( */}

                    {/* // )}/ */}
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
                                    <div onClick={() => {}} className="cursor-pointer">
                                        <div className="text-sm font-normal ">{card.name1}</div>
                                        <div>
                                            <span className="text-xl font-bold  text-success">{card.todayCount ? card.todayCount : 0}</span>
                                        </div>
                                    </div>
                                    <div onClick={() => {}} className="cursor-pointer">
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
            {(ROLE.BDM == state.role || ROLE.ADMIN == state.role) && state.userCardData?.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {state.userCardData?.map((card, index) => (
                        <UserTargetCard
                            key={card.type}
                            data={card}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                            handleClick={() => {
                                handleClick(card);
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="mt-3 flex items-center justify-end pb-2 pr-3">
                    <CustomSelect
                        options={[
                            {
                                label: 'This Month',
                                value: 'This Month',
                            },
                            {
                                label: 'Last 7 Days',
                                value: 'Last 7 Days',
                            },
                            {
                                label: 'Last Month',
                                value: 'Last Month',
                            },
                            {
                                label: 'Year',
                                value: 'Year',
                            },
                        ]}
                        value={state.filterMonth}
                        onChange={(e) => setState({ filterMonth: e })}
                        isMulti={false}
                        placeholder="Select Duration"
                        className="w-full "
                    />
                </div>
                {state.data?.length > 0 && (
                    <div className="mt-3 flex items-center justify-end pb-2 pr-3">
                        <div className="rounded-lg bg-gray-300 p-1 font-semibold">{pageCounts(state.currentPage, state.totalRecords)}</div>
                    </div>
                )}
            </div>

            <>
                <div>
                    <DataTable
                        className="table-responsive"
                        records={state.data}
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

                            { accessor: 'created_by', title: 'Created By' },
                            { accessor: 'assigned_to', title: 'Assigned To' },

                            {
                                accessor: 'remark',
                                title: 'Remark ',
                                render: (row: any) => (
                                    <Tippy content={row?.remark} placement="top" className="rounded-lg bg-black p-1 text-sm text-white">
                                        <div>{row?.remark?.length > 20 ? `${row.remark.slice(0, 20)}...` : row?.remark}</div>
                                    </Tippy>
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
                    />
                </div>
                <div className="mt-5 flex justify-center gap-3">
                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.count}
                        onPageChange={(page) => {
                            leadList(page);

                            setState({ currentPage: page });
                        }}
                        hasNext={state.next !== null}
                        hasPrevious={state.previous !== null}
                        recordsPerPage={10}
                    />
                </div>
            </>

            {/* <div className="mt-2">
                <SimpleGrid
                    cols={4}
                    spacing="sm"
                    breakpoints={[
                        { maxWidth: 768, cols: 2 },
                        { maxWidth: 576, cols: 1 },
                    ]}
                >
                    {TeleData.map((card, index) => (
                        <div className="panel flex items-center gap-4 p-4" key={index}>
                            <div className={`flex h-20 w-20  shrink-0 items-center justify-center rounded-full text-[60px]`}>{card.icon}</div>

                            <div className="flex-1 text-right">
                                <h6 className="text-xl font-bold text-dark dark:text-white-light">{card.monthCount}</h6>
                                <h6 className="text-lg  text-dark dark:text-white-light">{card.title}</h6>
                                <h6 className="text-md  text-gray-400 dark:text-white-light">{'Months'}</h6>

                                <div className="mt-2 flex justify-between text-base font-bold">
                              
                                </div>
                            </div>
                        </div>
                    ))}
                </SimpleGrid>
            </div> */}
            {/* <div className="mt-2 pb-2  ">
                <SimpleGrid
                    cols={5}
                    spacing="sm"
                    breakpoints={[
                        { maxWidth: 768, cols: 2 },
                        { maxWidth: 576, cols: 1 },
                    ]}
                >
                    {state.cardData.map((card: any, index: any) => (
                        <div className="panel">
                            <div className="mb-5 flex items-center font-semibold">
                                <div className="grid h-10 w-10 shrink-0 place-content-center rounded-full">
                                    <IconBitcoin />
                                </div>
                                <div className="ltr:ml-2 rtl:mr-2">
                                    <h6 className="text-lg font-bold text-dark dark:text-white-light">{card.title}</h6>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-base font-bold">
                                <div>
                                    <div className="text-sm font-normal ">{card.name1}</div>
                                    <div>
                                        <span className="text-xl font-bold  text-success">{card.todayCount}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-normal "> {card.name2}</div>
                                    <div>
                                        <span className="text-xl font-bold text-success">{card.monthCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </SimpleGrid>
            </div> */}
            {/* <SimpleGrid cols={2} spacing="lg" className="mt-2">
                <Card shadow="sm" radius="lg">
                    <Title size={'16px'}>Estimated Revenue</Title>
                    <div className="pb-2 pt-2">
                        <hr className="h-2" />
                    </div>
                    {isMounted && <ReactApexChart options={customerFeedbackChart.options} series={customerFeedbackChart.series} type="bar" height={320} width={'100%'} />}

                </Card>
                <Card shadow="sm" radius="lg">
                    <Title size={'16px'}>Lead Status</Title>
                    <div className="pb-2 pt-2">
                        <hr className="h-2" />
                    </div>
                    {isMounted && <ReactApexChart options={LeadStatus.options} series={LeadStatus.series} type="bar" height={320} width={'100%'} />}

                </Card>
             

                <Card shadow="sm" radius="lg">
                    <Title size={'16px'}>Lead By Source </Title>
                    <div className="pb-2 pt-2">
                        <hr className="h-2" />
                    </div>
                    {isMounted && <ReactApexChart options={leadSourceChart.options} series={leadSourceChart.series} type="donut" height={320} width={'100%'} />}
                </Card>

                <Card shadow="sm" radius="lg">
                    <Title size={'16px'}>Lead By Company segment</Title>
                    <div className="pb-2 pt-2">
                        <hr className="h-2" />
                    </div>
                    {isMounted && <ReactApexChart options={pipelineValueByStageChart.options} series={pipelineValueByStageChart.series} type="pie" height={320} width={'100%'} />}
                </Card>
            </SimpleGrid> */}
        </div>
    );
};
export default PrivateRouter(Dashboards);
