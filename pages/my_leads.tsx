import IconBitcoin from '@/components/Icon/IconBitcoin';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import { Dropdown, Success, capitalizeFLetter, chartData, filterByDates, getDateRange, objIsEmpty, pageCounts, useSetState } from '@/utils/functions.utils';
import { Loader, SimpleGrid } from '@mantine/core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import IconTrash from '@/components/Icon/IconTrash';

const Leads = () => {
    const dispatch = useDispatch();

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

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        getData();
        userData();
        sourceList();
        leadList();
        leadStatusList();
    }, []);

    const deps = useMemo(
        () => ({
            activeTab: state.activeTab,
            search: debouncedSearch,
            assigned_to: state.assigned_to?.value,
            lead_source_category: state.lead_source_category?.value,
            lead_status: state.lead_status?.value,
            role: state.role,
            bdm: state.bdm?.value,
            bde: state.bde?.value,
            dm: state.dm?.value,
            tm: state.tm?.value,
            today: state?.today,
            month: state?.month,
            card_lead_status: state?.card_lead_status,
            from_date: state?.from_date,
            end_date: state?.end_date,
        }),
        [
            state.activeTab,
            debouncedSearch,
            state.assigned_to,
            state.lead_source_category,
            state.lead_status,
            state.role,
            state.bdm,
            state.bde,
            state.dm,
            state.tm,
            state?.today,
            state?.month,
            state?.card_lead_status,
            state.from_date,
            state.end_date,
        ]
    );

    useEffect(() => {
        const currentDeps = JSON.stringify(deps);

        if (isInitialLoad.current) {
            const page = redux?.leadIndex || state?.currentPage;
            if (redux?.leadIndex) {
                setState({ currentPage: redux.leadIndex });
            }
            leadList(page);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            leadList(1);
            // countData();
        }

        prevDeps.current = currentDeps;
    }, [deps]);

    useEffect(() => {
        setState({ from_date: '', end_date: '' });
    }, [state.activeTab]);

    useEffect(() => {
        if (state.from_date || state.end_date) {
            setState({ activeTab: 'Custom' });
        }
    }, [state.from_date, state.end_date]);

    const leadList = async (page = 1) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.lead.list(body, page, null);
            tableData(res);
            setState({ loading: false, count: res?.count, next: res?.next, previous: res?.previous, currentPage: page });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const sourceList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_cat_List(1);
            console.log('✌️res --->', res);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ sourceList: dropdownList, loading: false, sourcePage: 1, sourceHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const sourceLoadMore = async () => {
        try {
            setState({ sorceloadMore: true });
            const res: any = await Models.master.lead_cat_List(state.sourcePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ sourceList: [...state.sourceList, ...dropdownList], loading: false, sourcePage: state.sourcePage + 1, sourceHasNext: res.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const leadStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_status_list(1);
            const dropdownList = Dropdown(res.results, 'stage');

            setState({ leadStatusList: dropdownList, loading: false, leadStatusPage: 1, leadStatusHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const leadStatusLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            const res: any = await Models.master.lead_status_list(state.leadStatusPage + 1);
            const dropdownList = Dropdown(res.results, 'stage');

            setState({
                leadStatusList: [...state.leadStatusList, ...dropdownList],
                leadStatusloadMore: false,
                leadStatusPage: state.leadStatusPage + 1,
                leadStatusHasNext: res.next,
            });
        } catch (error) {
            setState({ leadStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const countData = async () => {
        try {
            setState({ chartLoading: true });
            let body = bodyData();

            const state = { role: 'BDE' }; // Example role
            const ROLE = { TM: 'TM', BDE: 'BDE', BDM: 'BDM', ADMIN: 'ADMIN' };

            const user: any = await Models.auth.userDetails();

            let res: any;

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

    const handleEdit = (id) => {
        dispatch(leadIndex(state.currentPage));
        router.push(`/updateLead?id=${id}`);
    };

    const handleView = (id) => {
        dispatch(leadIndex(state.currentPage));
        router.push(`/viewLead?id=${id}`);
    };

    const tableData = (res) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                allData: item,
                lead: item.lead,
                source: capitalizeFLetter(item.lead_source_category?.name) || '',
                date: item.created_at ? moment(item.created_at).format('DD-MM-YYYY') : '',
                contact_person: capitalizeFLetter(item.college_contact?.student_name) || '',
                lead_status: capitalizeFLetter(item.stage?.stage),
                status_date: item.status_date ? moment(item.status_date).format('DD-MM-YYYY') : null,
                remark: capitalizeFLetter(item.remark),
                assigned_to: item.assigned_to?.username,
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
                updated_on: item?.updated_at ? moment(item?.updated_at).format('DD-MM-YYYY') : '',
            };
        });
        console.log('✌️data --->', data);

        setState({ data: data, allData: res });
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
            console.log('userData --->', res);
            setState({ role: res?.designation, userId: res?.id });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const orderFilter = ['Year', 'Last Month', 'This Month', 'Last 7 Days', 'Custom'];

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

    const filterCustomDate = async () => {
        try {
            setState({ loading1: true });
            let body = bodyData();
            if (state.from_date) {
                body.from_date = moment(state.from_date).format('YYYY-MM-DD');
            }

            if (state.end_date) {
                body.end_date = moment(state.end_date).format('YYYY-MM-DD');
            }

            let response: any;

            // if (ROLE.ADMIN == state.role || ROLE.BDM == state.role) {
            //     response = await Models.opportunity.filters(body, state.currentPage);
            // } else {
            //     response = await Models.opportunity.filters(body, state.currentPage, state?.userId);
            // }

            // const response: any = await Models.opportunity.filters(body, state.currentPage);
            tableData(response);
            countData();
            setState({
                loading1: false,
                totalRecords: response.count,
                next: response.next,
                previous: response.previous,
                isOpen: false,
            });
        } catch (error) {
            setState({ loading1: false });

            console.log('error: ', error);
        }
    };

    const bodyData = () => {
        let body: any = {};

        const userString = localStorage.getItem('crmUser');
        const user = userString ? JSON.parse(userString) : null;

        body.my_leads = 'Yes';

        if (state.search) {
            body.search = state.search;
        }

        if (state.lead_source_category) {
            body.lead_source_category = state.lead_source_category?.value;
        }

        if (state.lead_status) {
            body.status = state.lead_status?.value;
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
        return body;
    };

    const handleRemove = (type) => {
        if (type == 'lead_source') {
            setState({ lead_source: null });
        } else if (type == 'lead_status') {
            setState({ lead_status: null });
        } else if (type == 'assigned_to') {
            setState({ assigned_to: null });
        }
    };

    const handleDelete = async (id) => {
        try {
            setState({ isDeleteLoading: true });
            const res = await Models.lead.delete(id);
            setState({ isDeleteLoading: false, isDeleteOpen: false });
            Success('Lead deleted successfully');
            leadList(state.currentPage);
        } catch (error) {
            setState({ isDeleteLoading: false });
            // Failure(error[0]);
            console.log('error: ', error);
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

                let response: any;

                // if (ROLE.ADMIN == state.role || ROLE.BDM == state.role) {
                //     response = await Models.opportunity.filtersByOwnLead(body, page);
                // } else {
                //     response = await Models.opportunity.filtersByOwnLead(body, page, userId);
                // }
                // const response: any = await Models.opportunity.filtersByOwnLead(body, page, userId);

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
                updated_on: item.updated_on ? moment(item.updated_on).format('DD-MM-YYYY') : null,
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
                    <h5 className="text-lg font-semibold"> {(state.role == ROLE.ADMIN || state.role == ROLE.BDM) && 'TEAM '}LEADS</h5>
                </div>

                {/* Button Section */}
                {state.role !== ROLE.ADMIN && state.role !== ROLE.BDM && (
                    <div className="flex">
                        <button type="button" className="btn btn-primary w-auto" onClick={() => router.push('/create_contact')}>
                            + Create
                        </button>
                    </div>
                )}
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
                        placeholder="Search ..."
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

                    <CustomSelect
                        value={state.lead_status}
                        onChange={(e) => setState({ lead_status: e })}
                        placeholder={'Lead Status'}
                        options={state.leadStatusList}
                        error={state.errors?.status}
                        loadMore={() => state.leadStatusHasNext && leadStatusLoadMore()}
                    />

                    {/* <CustomSelect
                        value={state.lead_status}
                        onChange={(e) => setState({ lead_status: e })}
                        placeholder={'Status'}
                        options={state.statusList}
                        error={state.errors?.lead_status}
                        className="w-full"
                        required
                    /> */}

                    <CustomSelect
                        value={state.lead_source_category}
                        onChange={(e) => setState({ lead_source_category: e })}
                        placeholder={'Lead Source Category'}
                        options={state.sourceList}
                        loadMore={() => state.sourceHasNext && sourceLoadMore()}
                    />
                </div>
            </div>

            <>
                <div className="flex items-center justify-end pb-2 pr-3">
                    <div className="rounded-lg bg-gray-300 p-1 font-semibold">{pageCounts(state.currentPage, state.totalRecords)}</div>
                </div>
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
                                accessor: 'contact_person',
                                title: 'Contact Person',
                            },

                            { accessor: 'source', title: 'Source' },

                            { accessor: 'date', title: 'Created Date', width: 120 },
                            {
                                accessor: 'lead_status',
                                title: 'Lead Status',
                            },

                            // { accessor: 'status_date', title: `${ROLE.TM == state.role ? 'Follow Up' : 'Status Date'}` },

                            { accessor: 'updated_on', title: 'Updated Date' },

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
                                                handleView(row?.id);
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

                                        <button
                                            className="flex hover:text-info"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(row?.id);
                                            }}
                                        >
                                            <IconTrash className="h-4.5 w-4.5" />
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
                                                        leadList(state?.currentPage);
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
                            leadList(page);
                        }}
                        hasNext={state.next !== null}
                        hasPrevious={state.previous !== null}
                        recordsPerPage={10}
                    />
                </div>
            </>
        </div>
    );
};
export default PrivateRouter(Leads);
