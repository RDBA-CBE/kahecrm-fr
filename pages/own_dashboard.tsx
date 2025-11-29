'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { capitalizeFLetter, getDate, useSetState } from '@/utils/functions.utils';
import Models from '@/imports/models.import';
import moment from 'moment';
import IconEye from '@/components/Icon/IconEye';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardCustomTabs() {
    const [activeTab, setActiveTab] = useState('summary');

        const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    

    const [state, setState] = useSetState({
        page: 1,
    });

    useEffect(() => {
        taskList(1);
    }, []);

    const taskList = async (page) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.task.list(body, page);
            // tableData(res, page);
            const data = res?.results?.map((item: any) => ({
                id: item?.id,
            }));
            setState({ loading: false, taskList: res?.results });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const tableData = (res: any, page: number) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                assignData: item?.assigned_to,
                leadData: { value: item.contact?.id, label: item?.contact?.student_name },
                contactData: { value: item.contact?.id, label: item.contact?.name },
                leadName: item.contact?.lead?.name,
                leadId: item.contact?.lead?.id,
                task: item?.task_type,
                contact: capitalizeFLetter(item?.contact?.student_name),
                created_at: item?.created_at ? moment(item?.created_at).format('DD-MM-YYYY a') : '',

                date: item?.task_date_time ? getDate(item?.task_date_time) : '',

                description: item?.task_detail ? item?.task_detail : '',
                assigned_to:
                    item?.assigned_to?.length > 0
                        ? item.assigned_to.map((detail) => `${capitalizeFLetter(detail?.first_name)} ${capitalizeFLetter(detail?.last_name)}`)?.join(', ')
                        : `${capitalizeFLetter(item.created_by?.first_name)} ${capitalizeFLetter(item.created_by?.last_name)}`,
            };
        });
        console.log('list --->', data);

        setState({
            currentPage: page,
            count: res?.count,
            next: res.next,
            previous: res.previous,
            taskList: data,
            totalRecords: res.count,
        });
    };

    const bodyData = () => {
        let body: any = {};
        const userString = localStorage.getItem('crmUser');
        const user = userString ? JSON.parse(userString) : null;

        if (user) {
            body.userId = user?.id;
        }

        return body;
    };

    // -------- SAMPLE COUNTS --------
    const counts = {
        totalContacts: 320,
        totalLeads: 150,
        totalAppointments: 45,
        totalTasks: 90,
    };

    // -------- LEAD STATUS (PIE) --------
    const leadStatusData = {
        series: [40, 30, 20, 10],
        options: {
            chart: { type: 'pie' },
            labels: ['New', 'In Progress', 'Follow-Up', 'Joined'],
            colors: ['#008FFB', '#FEB019', '#FF4560', '#00E396'],
            legend: { position: 'bottom' },
        },
    };

    // -------- LEAD SOURCE (BAR) --------
    const leadSourceData = {
        series: [{ name: 'Leads', data: [50, 30, 20, 10, 5] }],
        options: {
            chart: { type: 'bar' },
            plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
            colors: ['#775DD0'],
            xaxis: {
                categories: ['Website', 'Social Media', 'Referral', 'Walk-in', 'Other'],
            },
        },
    };

    // -------- MONTHLY LEADS (LINE) --------
    const monthlyLeadsData = {
        series: [{ name: 'Leads', data: [10, 20, 35, 50, 40, 60, 70, 55, 65, 80, 90, 100] }],
        options: {
            chart: { type: 'line' },
            stroke: { curve: 'smooth', width: 3 },
            colors: ['#FF5722'],
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
        },
    };

    // -------- FUNNEL --------
    const leadFunnelData = {
        series: [{ name: 'Leads', data: [40, 30, 20, 10] }],
        options: {
            chart: { type: 'bar' },
            plotOptions: { bar: { horizontal: true, distributed: true, barHeight: '60%' } },
            colors: ['#008FFB', '#FEB019', '#FF4560', '#00E396'],
            xaxis: { categories: ['New', 'In Progress', 'Follow-Up', 'Joined'] },
        },
    };

    // -------- ACTIVITY DATA --------
    const activityData = [
        {
            status: 'Open',
            due: '10/20/16',
            category: 'Student Message',
            description: 'Alison Grace writes: "Hi Mr. Constanza ...',
            createdBy: 'CRM Admin, 10/2/16 11:39 AM',
        },
        {
            status: 'Open',
            due: '10/20/16',
            category: 'Student Message',
            description: 'Alison Grace writes: "Hi Mr. Constanza ...',
            createdBy: 'CRM Admin, 10/2/16 11:39 AM',
        },
        {
            status: 'Open',
            due: '10/20/16',
            category: 'Student Message',
            description: 'Alison Grace writes: "Hi Mr. Constanza ...',
            createdBy: 'CRM Admin, 10/2/16 11:39 AM',
        },
    ];

    const salesByCategory: any = {
      series: [985, 737, 270],
      options: {
          chart: {
              type: 'donut',
              height: 460,
              fontFamily: 'Nunito, sans-serif',
          },
          dataLabels: {
              enabled: false,
          },
          stroke: {
              show: true,
              width: 25,
              colors: isDark ? '#0e1726' : '#fff',
          },
          colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
          legend: {
              position: 'bottom',
              horizontalAlign: 'center',
              fontSize: '14px',
              markers: {
                  width: 10,
                  height: 10,
                  offsetX: -2,
              },
              height: 50,
              offsetY: 20,
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
                          },
                          value: {
                              show: true,
                              fontSize: '26px',
                              color:  '#bfc9d4',
                              offsetY: 16,
                              formatter: (val: any) => {
                                  return val;
                              },
                          },
                          total: {
                              show: true,
                              label: 'Total',
                              color: '#888ea8',
                              fontSize: '29px',
                              formatter: (w: any) => {
                                  return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                      return a + b;
                                  }, 0);
                              },
                          },
                      },
                  },
              },
          },
          labels: ['Apparel', 'Sports', 'Others'],
          states: {
              hover: {
                  filter: {
                      type: 'none',
                      value: 0.15,
                  },
              },
              active: {
                  filter: {
                      type: 'none',
                      value: 0.15,
                  },
              },
          },
      },
  };

  const dailySales: any = {
    series: [
        {
            name: 'Sales',
            data: [44, 55, 41, 67, 22, 43, 21],
        },
        {
            name: 'Last Week',
            data: [13, 23, 20, 8, 13, 27, 33],
        },
    ],
    options: {
        chart: {
            height: 300,
            type: 'bar',
            fontFamily: 'Nunito, sans-serif',
            toolbar: {
                show: false,
            },
            stacked: true,
            stackType: '100%',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 1,
        },
        colors: ['#e2a03f', '#e0e6ed'],
        responsive: [
            {
                breakpoint: 480,
                options: {
                    legend: {
                        position: 'bottom',
                        offsetX: -10,
                        offsetY: 0,
                    },
                },
            },
        ],
        xaxis: {
            labels: {
                show: false,
            },
            categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        },
        yaxis: {
            show: false,
        },
        fill: {
            opacity: 1,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '25%',
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            padding: {
                top: 10,
                right: -20,
                bottom: -20,
                left: -20,
            },
        },
    },
};


    return (
        <div className=" p-4">
            {/* ---------- TABS NAV ---------- */}
            <div className="mb-6 flex justify-center">
                <div className="flex rounded-xl border-2 border-gray-300 bg-white p-1">
                    <button
                        className={`rounded-lg px-8 py-3 transition-all duration-200 ${activeTab === 'summary' ? 'bg-blue-600 font-semibold text-white ' : 'text-gray-600 hover:text-gray-800'}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        <span className="font-semibold">Summary</span>
                    </button>

                    <button
                        className={`rounded-lg px-8 py-3 transition-all duration-200 ${activeTab === 'charts' ? 'bg-blue-600 font-semibold text-white ' : 'text-gray-600 hover:text-gray-800'}`}
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
                        <CountCard title="Total Contacts" count={counts.totalContacts} icon={<BarChart3 />} />
                        <CountCard title="Total Leads" count={counts.totalLeads} icon={<TrendingUp />} />
                        <CountCard title="Appointments" count={counts.totalAppointments} icon={<PieChart />} />
                        <CountCard title="Tasks" count={counts.totalTasks} icon={<BarChart3 />} />
                    </div>

                    {/* Activity List - Replaced Table */}
                    <div className="mt-6 rounded-xl bg-white p-4 shadow">
                        <h3 className="mb-4 text-lg font-semibold">Tasks</h3>

                        <div className="space-y-4">
                            {state.taskList?.map((item, index) => (
                                <ActivityItem key={index} item={item} />
                            ))}
                        </div>
                        <div className="mt-5 flex justify-center gap-3">
                            <Pagination
                                currentPage={state.currentPage}
                                totalRecords={state.count}
                                onPageChange={(page) => {
                                    taskList(page);
                                    setState({ currentPage: page });
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
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-white p-4 shadow">
                            <h3 className="mb-2 font-semibold">Lead Status</h3>
                            {/* <ApexChart {...leadStatusData} type="pie" height={300} /> */}
                            <ApexChart series={salesByCategory.series} options={salesByCategory.options} type="donut" height={460} width={'100%'} />

                        </div>

                        <div className="rounded-xl bg-white p-4 shadow">
                            <h3 className="mb-2 font-semibold">Lead Source</h3>
                            <ApexChart series={dailySales.series} options={dailySales.options} type="bar" height={160} width={'100%'} />

                            {/* <ReactApexChart {...leadSourceData} type="bar" height={300} /> */}
                        </div>
                    </div>

                    {/* <div className="mt-4 rounded-xl bg-white p-4 shadow">
                        <h3 className="mb-2 font-semibold">Monthly Leads Trend</h3>
                        <ApexChart {...monthlyLeadsData} type="line" height={300} />
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-4 shadow">
                        <h3 className="mb-2 font-semibold">Lead Funnel</h3>
                        <ApexChart {...leadFunnelData} type="bar" height={300} />
                    </div> */}
                </div>
            )}
        </div>
    );
}

/* -------------------- COUNT CARD -------------------- */
function CountCard({ title, count, icon }) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <h2 className="mt-1 text-3xl font-bold">{count}</h2>
            </div>
            <div className="rounded-full bg-gray-100 p-3 text-blue-600">{icon}</div>
        </div>
    );
}

/* -------------------- ACTIVITY ITEM -------------------- */


function ActivityItem({ item }) {
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
      <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-7 md:gap-2">
              {/* STUDENT NAME */}
              <div className="flex flex-col">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">STUDENT NAME</span>
                  <span className="text-sm text-gray-700">{capitalizeFLetter(contactData?.student_name)}</span>
              </div>

              {/* CONTACT INFO */}
              <div className="flex flex-col">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">CONTACT INFO</span>
                  <div className="text-sm text-gray-700">
                      <div className="truncate">{contactData?.phone_number}</div>
                      <div className="truncate">{contactData?.email}</div>
                  </div>
              </div>

              {/* TASK STATUS */}
              <div className="flex flex-col">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">TASK STATUS</span>
                  <span className="w-fit rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {taskData?.task_type || 'To Do'}
                  </span>
              </div>

              {/* TASK DATE */}
              <div className="flex flex-col">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">TASK DATE</span>
                  <span className="text-sm text-gray-700">{taskDateTime}</span>
              </div>

              {/* ASSIGNED TO */}
              <div className="flex flex-col">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">ASSIGNED TO</span>
                  <span className="text-sm text-gray-700 truncate">{assignedUsers}</span>
              </div>

              {/* CREATED BY & DATE */}
              <div className="flex flex-col">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">CREATED</span>
                  <div className="text-sm text-gray-700">
                      <div className="truncate">{createdBy}</div>
                      <div className="text-xs text-gray-500">{createdDate}</div>
                  </div>
              </div>

              {/* REMARK & ACTION */}
              <div className="flex justify-between">
                  <div className="flex flex-col flex-1 min-w-0">
                      <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">REMARK</span>
                      <span className="text-sm text-gray-700 truncate">{taskData?.remark || 'No remarks'}</span>
                  </div>
                  <button className="ml-2 flex items-center justify-center rounded-lg p-1 pt-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600">
                      <IconEye className="h-4 w-4" />
                  </button>
              </div>
          </div>
      </div>
  );
}