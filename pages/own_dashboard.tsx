'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { capitalizeFLetter, getDate } from '@/utils/functions.utils';
import Models from '@/imports/models.import';
import moment from 'moment';
import IconEye from '@/components/Icon/IconEye';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Modal from '@/common_component/modal';
import TaskCard from '@/components/TaskCard';
import IconSearch from '@/components/Icon/IconSearch';
import CustomeDatePicker from '@/common_component/datePicker';
import useDebounce from '@/common_component/useDebounce';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FunnelStage {
    stage: string;
    count: number;
}

interface DashboardState {
    page: number;
    currentPage: number;
    isOpenTaskView: boolean;
    loading: boolean;
    viewLoad: boolean;
    search: string;
    from_date: string | null;
    to_date: string | null;
    userId: string | null;
    taskList: any[];
    count: number;
    next: string | null;
    previous: string | null;
    taskDetails: any;
    conversationList: any[];
    popupHeight: string;
    salesByCategory: any;
    leadFunnelData: any;
    leadSourceData: any;
    dashboardData: any;
    counts: {
        total_contacts: number;
        total_leads: number;
        total_appointments: number;
        total_tasks: number;
        this_month_total_contacts: number;
        this_month_total_leads: number;
        this_month_total_appointments: number;
        this_month_total_tasks: number;
    };
    taskStats: {
        total_tasks: number;
        completed_tasks: number;
        pending_tasks: number;
        overdue_tasks: number;
        upcoming_tasks: number;
    };
}

export default function DashboardCustomTabs() {
    const [activeTab, setActiveTab] = useState('summary');
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    // Initialize state properly
    const [state, setState] = useState<DashboardState>({
        page: 1,
        currentPage: 1,
        isOpenTaskView: false,
        loading: false,
        viewLoad: false,
        search: '',
        from_date: null,
        to_date: null,
        userId: null,
        taskList: [],
        count: 0,
        next: null,
        previous: null,
        taskDetails: null,
        conversationList: [],
        popupHeight: '500px',
        salesByCategory: null,
        leadFunnelData: null,
        leadSourceData: null,
        dashboardData: null,
        counts: {
            total_contacts: 0,
            total_leads: 0,
            total_appointments: 0,
            total_tasks: 0,
            this_month_total_contacts: 0,
            this_month_total_leads: 0,
            this_month_total_appointments: 0,
            this_month_total_tasks: 0,
        },
        taskStats: {
            total_tasks: 0,
            completed_tasks: 0,
            pending_tasks: 0,
            overdue_tasks: 0,
            upcoming_tasks: 0,
        },
    });

    // Safe state update function
    const updateState = (newState: Partial<DashboardState>) => {
        setState((prevState) => ({
            ...prevState,
            ...newState,
        }));
    };

    useEffect(() => {
        taskList(1);
        dasboardData(1);
    }, []);

    const taskList = async (page: number) => {
        try {
            updateState({ loading: true });
            const body = bodyData();
            const res: any = await Models.task.list(body, page);
            updateState({
                loading: false,
                taskList: Array.isArray(res?.results) ? res.results : [],
                count: res?.count || 0,
                currentPage: page,
            });
        } catch (error) {
            updateState({ loading: false });
            console.log('error: ', error);
        }
    };

    const dasboardData = async (page: number) => {
        try {
            updateState({ loading: true });
            const res: any = await Models.lead.dashbaord(null);
            console.log('dasboardData --->', res);

            // Safely extract data from API response
            const countsData = res?.data?.find((item: any) => item?.counts)?.counts || {};
            const taskStatsData = res?.data?.find((item: any) => item?.task_list)?.task_list || {};
            const chartsData = res?.charts || {};

            // Create safe default options for donut chart
            const getDefaultDonutOptions = (isDark: boolean) => ({
                chart: {
                    type: 'donut' as const,
                    height: 460,
                    fontFamily: 'Nunito, sans-serif',
                    toolbar: {
                        show: false,
                    },
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: isDark ? '#0e1726' : '#fff',
                },
                colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#00E396', '#775DD0'] : ['#008FFB', '#FEB019', '#FF4560', '#00E396', '#775DD0'],
                legend: {
                    position: 'bottom' as const,
                    horizontalAlign: 'center' as const,
                    fontSize: '14px',
                    markers: {
                        width: 10,
                        height: 10,
                        offsetX: -2,
                    },
                    height: 50,
                    offsetY: 20,
                    itemMargin: {
                        horizontal: 10,
                        vertical: 5,
                    },
                    onItemClick: {
                        toggleDataSeries: true,
                    },
                    onItemHover: {
                        highlightDataSeries: true,
                    },
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%',
                            background: 'transparent',
                            labels: {
                                show: true,
                                name: {
                                    show: true,
                                    fontSize: '29px',
                                    offsetY: -10,
                                    formatter: function (val: string) {
                                        return val;
                                    },
                                },
                                value: {
                                    show: true,
                                    fontSize: '26px',
                                    color: isDark ? '#bfc9d4' : '#373d3f',
                                    offsetY: 16,
                                    formatter: function (val: string) {
                                        return val;
                                    },
                                },
                                total: {
                                    show: true,
                                    showAlways: true,
                                    label: 'Total',
                                    color: isDark ? '#888ea8' : '#373d3f',
                                    fontSize: '29px',
                                    formatter: function (w: any) {
                                        return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                    },
                                },
                            },
                        },
                    },
                },
                labels: ['No Data Available'],
                states: {
                    hover: {
                        filter: {
                            type: 'none' as const,
                            value: 0.15,
                        },
                    },
                    active: {
                        filter: {
                            type: 'none' as const,
                            value: 0.15,
                        },
                    },
                },
                grid: {
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
                tooltip: {
                    enabled: true,
                    y: {
                        formatter: function (val: number) {
                            return val.toString();
                        },
                    },
                },
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                height: 300,
                            },
                            legend: {
                                position: 'bottom' as const,
                            },
                        },
                    },
                ],
            });

            // Sales by Category with safe defaults
            const leadStatusData = Array.isArray(chartsData?.lead_status) ? chartsData.lead_status : [];
            // Make sure your salesByCategory is properly structured
            const salesByCategory = {
                series: leadStatusData.length > 0 ? leadStatusData.map((item: any) => item?.value || 0) : [1],
                options: {
                    ...getDefaultDonutOptions(isDark),
                    labels: leadStatusData.length > 0 ? leadStatusData.map((item: any) => item?.label || 'Unknown') : ['No Data Available'],
                    colors:
                        leadStatusData.length > 0
                            ? isDark
                                ? ['#5c1ac3', '#e2a03f', '#e7515a', '#00E396', '#775DD0']
                                : ['#008FFB', '#FEB019', '#FF4560', '#00E396', '#775DD0']
                            : isDark
                            ? ['#5c1ac3']
                            : ['#008FFB'],
                },
            };
            console.log('✌️salesByCategory --->', salesByCategory);

            // Lead Funnel Data with safe defaults
            const leadFunnelDataArray = Array.isArray(chartsData?.lead_funnel) ? chartsData.lead_funnel : [];
            const leadFunnelData = {
                series: [
                    {
                        name: 'Leads',
                        data: leadFunnelDataArray.map((item: any) => item?.count || 0),
                    },
                ],
                options: {
                    chart: {
                        type: 'bar' as const,
                        height: 350,
                        toolbar: { show: false },
                        animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                        },
                    },
                    plotOptions: {
                        bar: {
                            horizontal: true,
                            distributed: true,
                            barHeight: '60%',
                            borderRadius: 4,
                        },
                    },
                    colors: ['#008FFB', '#FEB019', '#FF4560', '#00E396', '#775DD0'],
                    xaxis: {
                        categories: leadFunnelDataArray.map((item: any) => item?.stage || 'Unknown'),
                        labels: { show: true },
                    },
                    yaxis: { labels: { show: true } },
                    grid: { show: true, borderColor: isDark ? '#191e3a' : '#e0e6ed', strokeDashArray: 0 },
                    dataLabels: {
                        enabled: true,
                        style: {
                            colors: ['#fff'],
                        },
                    },
                    legend: { show: false },
                },
            };

            // Lead Source Bar Chart
            const leadSourceDataArray = Array.isArray(chartsData?.lead_source) ? chartsData.lead_source : [];
            const leadSourceData = {
                series: [
                    {
                        name: 'Leads',
                        data: leadSourceDataArray.map((item: any) => item?.value || 0),
                    },
                ],
                options: {
                    chart: {
                        type: 'bar' as const,
                        height: 350,
                        toolbar: { show: false },
                        animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                        },
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 6,
                            columnWidth: '40%',
                            distributed: false,
                        },
                    },
                    colors: [isDark ? '#5c1ac3' : '#008FFB'],
                    xaxis: {
                        categories: leadSourceDataArray.map((item: any) => item?.label || 'Unknown'),
                        labels: {
                            style: {
                                colors: isDark ? '#bfc9d4' : '#373d3f',
                            },
                        },
                    },
                    yaxis: {
                        labels: {
                            style: {
                                colors: isDark ? '#bfc9d4' : '#373d3f',
                            },
                        },
                    },
                    grid: {
                        borderColor: isDark ? '#191e3a' : '#e0e6ed',
                        strokeDashArray: 4,
                    },
                    dataLabels: {
                        enabled: false,
                    },
                },
            };

            updateState({
                loading: false,
                salesByCategory,
                leadFunnelData,
                leadSourceData,
                counts: {
                    total_contacts: countsData.total_contacts || 0,
                    total_leads: countsData.total_leads || 0,
                    total_appointments: countsData.total_appointments || 0,
                    total_tasks: countsData.total_tasks || 0,
                    this_month_total_contacts: countsData.this_month_total_contacts || 0,
                    this_month_total_leads: countsData.this_month_total_leads || 0,
                    this_month_total_appointments: countsData.this_month_total_appointments || 0,
                    this_month_total_tasks: countsData.this_month_total_tasks || 0,
                },
                taskStats: {
                    total_tasks: taskStatsData.total_tasks || 0,
                    completed_tasks: taskStatsData.completed_tasks || 0,
                    pending_tasks: taskStatsData.pending_tasks || 0,
                    overdue_tasks: taskStatsData.overdue_tasks || 0,
                    upcoming_tasks: taskStatsData.upcoming_tasks || 0,
                },
                dashboardData: res,
            });
        } catch (error) {
            updateState({ loading: false });
            console.log('error: ', error);
        }
    };

    const debouncedSearch = useDebounce(state.search, 1000);

    useEffect(() => {
        taskList(state.currentPage);
    }, [debouncedSearch, state.from_date, state.to_date, state.userId]);

    const bodyData = () => {
        let body: any = {};

        const userString = localStorage.getItem('crmUser');
        const user = userString ? JSON.parse(userString) : null;

        if (user) {
            body.userId = user?.id;
        }

        if (state.search) {
            body.search = debouncedSearch;
        }
        if (state.from_date) {
            body.task_date_time_after = moment(state.from_date).format('YYYY-MM-DD');
        }
        if (state.to_date) {
            body.task_date_time_before = moment(state.to_date).format('YYYY-MM-DD');
        }

        return body;
    };

    const taskDetails = async (row: any) => {
        try {
            updateState({ viewLoad: true });
            const res = await Models.task.details(row?.id);
            const conversationList: any = await Models.task.get_reply_task_messages(row?.id);
            updateState({
                taskDetails: res,
                isOpenTaskView: true,
                conversationList: Array.isArray(conversationList) ? conversationList : [],
            });
            taskList(state.currentPage);
            updateState({ viewLoad: false });
        } catch (error) {
            updateState({ viewLoad: false });
            console.log('✌️error --->', error);
        }
    };

    const renderFunnelChart = (data: FunnelStage[]) => {
        if (!Array.isArray(data) || data.length === 0) {
            return <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">No funnel data available</div>;
        }

        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
        const maxCount = Math.max(...data.map((item) => item.count), 1);

        return (
            <div className="space-y-4">
                {data.map((item, index) => {
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const width = Math.max(percentage, 10);

                    return (
                        <div key={index}>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium dark:text-white-light">{item.stage}</span>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{item.count}</span>
                            </div>
                            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="flex h-full items-center justify-center rounded-lg font-semibold text-white transition-all duration-300"
                                    style={{
                                        width: `${width}%`,
                                        backgroundColor: colors[index % colors.length],
                                    }}
                                >
                                    {item.count > 0 && <span className="text-xs">{item.count}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4">
            {/* ---------- TABS NAV ---------- */}
            <div className="mb-6 flex justify-center">
                <div className="flex rounded-xl border-2 border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-800">
                    <button
                        className={`rounded-lg px-8 py-3 transition-all duration-200 ${
                            activeTab === 'summary' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                        onClick={() => setActiveTab('summary')}
                    >
                        <span className="font-semibold">Summary</span>
                    </button>
                    <button
                        className={`rounded-lg px-8 py-3 transition-all duration-200 ${
                            activeTab === 'charts' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                        onClick={() => setActiveTab('charts')}
                    >
                        <span className="font-semibold">Charts</span>
                    </button>
                </div>
            </div>

            {/* ---------- SUMMARY TAB ---------- */}
            {activeTab === 'summary' && (
                <div>
                    {/* Count Cards */}
                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <CountCard title="Total Contacts" count={state.counts.total_contacts} thisMonthCount={state.counts.this_month_total_contacts} icon={<Users className="h-6 w-6" />} />
                        <CountCard title="Total Leads" count={state.counts.total_leads} thisMonthCount={state.counts.this_month_total_leads} icon={<TrendingUp className="h-6 w-6" />} />
                        <CountCard title="Appointments" count={state.counts.total_appointments} thisMonthCount={state.counts.this_month_total_appointments} icon={<Calendar className="h-6 w-6" />} />
                        <CountCard title="Tasks" count={state.counts.total_tasks} thisMonthCount={state.counts.this_month_total_tasks} icon={<Target className="h-6 w-6" />} />
                    </div>

                    {/* Task Statistics Cards */}
                    {/* <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
                        <StatCard 
                            title="Total Tasks" 
                            count={state.taskStats.total_tasks} 
                            color="blue"
                        />
                        <StatCard 
                            title="Completed" 
                            count={state.taskStats.completed_tasks} 
                            color="green"
                        />
                        <StatCard 
                            title="Pending" 
                            count={state.taskStats.pending_tasks} 
                            color="yellow"
                        />
                        <StatCard 
                            title="Overdue" 
                            count={state.taskStats.overdue_tasks} 
                            color="red"
                        />
                        <StatCard 
                            title="Upcoming" 
                            count={state.taskStats.upcoming_tasks} 
                            color="purple"
                        />
                    </div> */}

                    {/* Activity List */}
                    <div className="mt-6 rounded-xl bg-white p-4 shadow dark:bg-gray-800">
                        <h3 className="mb-2 text-lg font-semibold dark:text-white-light">Tasks</h3>
                        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search Bar */}
                            <div className="relative flex w-full max-w-full items-center rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3">
                                <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                                    <IconSearch className="h-6 w-6 font-bold" />
                                </button>
                                <input
                                    type="text"
                                    value={state.search}
                                    onChange={(e) => updateState({ search: e.target.value })}
                                    placeholder="Search by student name"
                                    className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                                <CustomeDatePicker value={state.from_date} placeholder="From Date" onChange={(e) => updateState({ from_date: e })} className="w-full md:w-1/2 lg:w-1/4" />
                                <CustomeDatePicker value={state.to_date} placeholder="To Date" onChange={(e) => updateState({ to_date: e })} className="w-full md:w-1/2 lg:w-1/4" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {Array.isArray(state.taskList) && state.taskList.length > 0 ? (
                                state.taskList.map((item, index) => <ActivityItem key={index} item={item} taskDetails={() => taskDetails(item)} />)
                            ) : (
                                <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">No tasks found</div>
                            )}
                        </div>
                        <div className="mt-5 flex justify-center gap-3">
                            <Pagination
                                currentPage={state.currentPage}
                                totalRecords={state.count}
                                onPageChange={(page) => {
                                    taskList(page);
                                    updateState({ currentPage: page });
                                }}
                                hasNext={state.next !== null}
                                hasPrevious={state.previous !== null}
                                recordsPerPage={10}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- CHARTS TAB ---------- */}
            {activeTab === 'charts' && (
                <div>
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Lead Status Donut Chart */}
                        {/* <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold dark:text-white-light">Lead Status</h3>
                            {state.salesByCategory?.series?.length > 0 && state.salesByCategory?.options?.labels?.length > 0 ? (
                                <ApexChart series={state.salesByCategory?.series} options={state.salesByCategory?.options} type="donut" height={460} width={'100%'} />
                            ) : (
                                <div className="flex h-80 items-center justify-center text-gray-500 dark:text-gray-400">No chart data available</div>
                            )}
                        </div> */}

                        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold dark:text-white-light">Lead Source</h3>
                            {state.leadSourceData?.series?.[0]?.data?.length > 0 ? (
                                <ApexChart series={state.leadSourceData.series} options={state.leadSourceData.options} type="bar" height={350} width={'100%'} />
                            ) : (
                                <div className="flex h-80 items-center justify-center text-gray-500 dark:text-gray-400">No chart data available</div>
                            )}
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800 lg:col-span-2">
                            <h3 className="mb-4 text-lg font-semibold dark:text-white-light">Lead Funnel</h3>
                            {state.leadFunnelData?.series?.[0]?.data?.length > 0 ? (
                                renderFunnelChart(
                                    state.leadFunnelData.series[0].data.map((count: number, index: number) => ({
                                        stage: state.leadFunnelData.options.xaxis.categories[index] || `Stage ${index + 1}`,
                                        count,
                                    }))
                                )
                            ) : (
                                <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">No funnel data available</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal
                open={state.isOpenTaskView}
                addHeader={'Task Details'}
                height={state.popupHeight}
                close={() => updateState({ isOpenTaskView: false, taskDetails: null })}
                renderComponent={() => <TaskCard task={state.taskDetails} conversationList={state.conversationList} btn={false} />}
            />
        </div>
    );
}

/* -------------------- COUNT CARD -------------------- */
function CountCard({ title, count, thisMonthCount, icon }) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <h2 className="mt-1 text-3xl font-bold dark:text-white-light">{count}</h2>
                <p className="text-md mt-1 text-gray-500 dark:text-gray-400">
                    This Month: <span className="font-semibold text-green-600">{thisMonthCount}</span>
                </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">{icon}</div>
        </div>
    );
}

/* -------------------- STAT CARD -------------------- */
function StatCard({ title, count, color }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
        green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
        red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    };

    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow dark:bg-gray-800">
            <div className={`rounded-full p-3 ${colorClasses[color]}`}>
                <span className="text-lg font-bold">{count}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        </div>
    );
}

/* -------------------- ACTIVITY ITEM -------------------- */
function ActivityItem({ item, taskDetails }) {
    const taskData = item;
    const contactData = item?.contact;

    // Format date and time
    const taskDateTime = taskData?.task_date_time ? moment(taskData.task_date_time).format('DD-MM-YYYY HH:mm') : '';
    const createdDate = taskData?.created_at ? moment(taskData.created_at).format('DD-MM-YYYY HH:mm') : '';

    // Get assigned users
    const assignedUsers =
        taskData?.assigned_to?.length > 0
            ? taskData.assigned_to.map((user) => `${capitalizeFLetter(user?.first_name)} ${capitalizeFLetter(user?.last_name)}`)?.join(', ')
            : `${capitalizeFLetter(taskData.created_by?.first_name)} ${capitalizeFLetter(taskData.created_by?.last_name)}`;

    // Get created by user
    const createdBy = `${capitalizeFLetter(taskData.created_by?.first_name)} ${capitalizeFLetter(taskData.created_by?.last_name)}`;

    return (
        <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-7 md:gap-2">
                {/* STUDENT NAME */}
                <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">STUDENT NAME</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{capitalizeFLetter(contactData?.student_name)}</span>
                </div>

                {/* CONTACT INFO */}
                <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">CONTACT INFO</span>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        <div className="truncate">{contactData?.phone_number}</div>
                        <div className="truncate">{contactData?.email}</div>
                    </div>
                </div>

                {/* TASK STATUS */}
                <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">TASK STATUS</span>
                    <span className="w-fit rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">{taskData?.task_type || 'To Do'}</span>
                </div>

                {/* TASK DATE */}
                <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">TASK DATE</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{taskDateTime}</span>
                </div>

                {/* ASSIGNED TO */}
                <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">ASSIGNED TO</span>
                    <span className="truncate text-sm text-gray-700 dark:text-gray-300">{assignedUsers}</span>
                </div>

                {/* CREATED BY & DATE */}
                <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">CREATED</span>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        <div className="truncate">{createdBy}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{createdDate}</div>
                    </div>
                </div>

                {/* REMARK & ACTION */}
                <div className="flex justify-between">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">REMARK</span>
                        <span className="truncate text-sm text-gray-700 dark:text-gray-300">{taskData?.remark || 'No remarks'}</span>
                    </div>
                    <button
                        className="ml-2 flex items-center justify-center rounded-lg p-1 pt-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                        onClick={() => taskDetails()}
                    >
                        <IconEye className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
