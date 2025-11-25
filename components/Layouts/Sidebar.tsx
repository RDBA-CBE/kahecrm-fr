import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import IconCaretsDown from '@/components/Icon/IconCaretsDown';
import IconMenuDashboard from '@/components/Icon/Menu/IconMenuDashboard';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconMinus from '@/components/Icon/IconMinus';
import IconMenuChat from '@/components/Icon/Menu/IconMenuChat';
import IconMenuMailbox from '@/components/Icon/Menu/IconMenuMailbox';
import IconMenuTodo from '@/components/Icon/Menu/IconMenuTodo';
import IconMenuNotes from '@/components/Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '@/components/Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '@/components/Icon/Menu/IconMenuContacts';
import IconMenuInvoice from '@/components/Icon/Menu/IconMenuInvoice';
import IconMenuCalendar from '@/components/Icon/Menu/IconMenuCalendar';
import IconMenuComponents from '@/components/Icon/Menu/IconMenuComponents';
import IconMenuElements from '@/components/Icon/Menu/IconMenuElements';
import IconMenuCharts from '@/components/Icon/Menu/IconMenuCharts';
import IconMenuWidgets from '@/components/Icon/Menu/IconMenuWidgets';
import IconMenuFontIcons from '@/components/Icon/Menu/IconMenuFontIcons';
import IconMenuDragAndDrop from '@/components/Icon/Menu/IconMenuDragAndDrop';
import IconMenuTables from '@/components/Icon/Menu/IconMenuTables';
import IconMenuDatatables from '@/components/Icon/Menu/IconMenuDatatables';
import IconMenuForms from '@/components/Icon/Menu/IconMenuForms';
import IconMenuUsers from '@/components/Icon/Menu/IconMenuUsers';
import IconMenuPages from '@/components/Icon/Menu/IconMenuPages';
import IconMenuAuthentication from '@/components/Icon/Menu/IconMenuAuthentication';
import IconMenuDocumentation from '@/components/Icon/Menu/IconMenuDocumentation';
import IconSettings from '../Icon/IconSettings';
import IconReport from '../Icon/IconReport';
import IconOpportunity from '../Icon/IconOpportunity';
import IconLeads from '../Icon/IconLead';
import IconTask from '../Icon/IconTask';
import Models from '@/imports/models.import';
import { ROLE } from '@/utils/constant.utils';
import IconCalendar from '../Icon/IconCalendar';
import SideMenu from '@/common_component/sideMenu';
import { Dropdown, Success, useSetState } from '@/utils/functions.utils';
import { Validation } from '@/utils/imports.utils';
import moment from 'moment';
import * as Yup from 'yup';
import CustomSelect from '../Select';
import TextArea from '../TextArea';
import CustomeDatePicker from '@/common_component/datePicker';
import IconUserPlus from '../Icon/IconUserPlus';
import IconUser from '../Icon/IconUser';
import IconUsersGroup from '../Icon/IconUsersGroup';

const Sidebar = () => {
    const router = useRouter();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [role, setRole] = useState('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    const [state, setState] = useSetState({
        currentLeadPage: 1,
        assignList: [],
        assignRole: null,
    });

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        getUserDetails();
    }, [router.pathname]);

    useEffect(() => {
        if (state.assignRole) {
            if (state.assignRole?.value == 'owner') {
                ownerList();
            } else if (state.assignRole?.value == 'bdm') {
                bdmList();
            } else if (state.assignRole?.value == 'tm') {
                telecallerList();
            } else if (state.assignRole?.value == 'bde') {
                bdeList();
            }
        }
    }, [state.assignRole]);

    const ownerList = async () => {
        try {
            const res: any = await Models.lead.ownerList();
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

    const getUserDetails = async () => {
        try {
            const res: any = await Models.auth.userDetails();
console.log('✌️res --->', res);
            setRole(res?.designation);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const clearTaskData = () => {
        setState({
            isOpenTask: false,
            errors: '',
            lead: '',
            contact: '',
            task_date_time: '',
            remark: '',
            task_type: '',
            assigned_to: '',
            assignRole: null,
        });
    };

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const taskList = async () => {
        const res: any = await Models.task.list({}, 1);
        try {
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const createAndUpdateTask = async () => {
        try {
            setState({ taskLoading: true });

            const validateField = {
                lead: state.lead?.value,
                contact: state.contact?.value,
                task_type: state.task_type?.value,
                assigned_to: state.assigned_to,
                task_date_time: state.task_date_time,
                remark: state?.remark,
                assignRole: state.assignRole?.value,
            };
            await Validation.createTask.validate(validateField, {
                abortEarly: false,
            });

            const body: any = {
                task_detail: state.details,
                contact: state.contact?.value,
                task_type: state.task_type?.value,
                task_assignment: state.assigned_to?.map((item) => ({ assigned_to: item.value })),
                remark: state.remark,
            };
            if (state.task_date_time) {
                body.task_date_time = moment(state.task_date_time).format('YYYY-MM-DD');
            }
            const res: any = await Models.task.create(body);
            clearTaskData();
            setState({ taskLoading: false });
            Success(state.task_date_time ? 'Task created successfully' : 'Log created successfully');
            taskList();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message; // Set the error message for each field
                });
                setState({ errors: validationErrors, taskLoading: false });
            } else {
                setState({ taskLoading: false });
            }
        }
    };

    const getContactList = async (val) => {
        try {
            setState({ contactLoading: true });
            const res: any = await Models.contact.listByLeadId(val.value);
            const dropdown = Dropdown(res.results, 'name');
            setState({
                contactList: dropdown,
                contactCount: res?.count,
                contactNext: res.next,
                contactLoading: false,
            });
        } catch (error) {
            setState({ contactLoading: false });

            console.log('error: ', error);
        }
    };

    const leadListLoadMore = async () => {
        try {
            setState({ leadLoading: true });

            if (state.hasMoreLead) {
                const user = localStorage.getItem('crmUser');
                let userId = JSON.parse(user)?.id;

                // const res: any = await Models.lead.list(state.currentLeadPage + 1);
                const res: any = await Models.opportunity.meAndAssigned(userId, state.currentLeadPage);

                // const newOptions = Dropdown(res?.results, 'name');
                const dropdownList = res?.results?.map((item) => ({ value: item.id, label: item.lead?.name }));

                setState({
                    leadList: [...state.leadList, ...dropdownList],
                    hasMoreLead: res.next,
                    currentLeadPage: state.currentLeadPage + 1,
                });
            } else {
                setState({
                    leadList: state.leadList,
                });
            }
            setState({ leadLoading: false });
        } catch (error) {
            setState({ leadLoading: false });

            console.log('error: ', error);
        }
    };

    const assignList = async () => {
        try {
            const res: any = await Models.task.assigned_to();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const leadList = async () => {
        try {
            setState({ leadLoading: true });
            const user = localStorage.getItem('crmUser');
            if (user) {
                let userId = JSON.parse(user)?.id;

                const res: any = await Models.opportunity.meAndAssigned(userId, state.currentLeadPage);
                const dropdownList = res?.results?.map((item) => ({ value: item.id, label: item.lead?.name }));

                setState({
                    leadList: dropdownList,
                    hasMoreLead: res.next,
                    leadLoading: false,
                });
            }

            // const res: any = await Models.lead.list(state.currentLeadPage);
            // const dropdownList = Dropdown(res?.results, 'name');
            // setState({
            //     leadList: dropdownList,
            //     hasMoreLead: res.next,
            // });
        } catch (error) {
            setState({ leadLoading: false });

            console.log('error: ', error);
        }
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/repute_logo.jpeg" alt="logo" />
                            <span className="align-middle text-2xl font-semibold text-red-600 dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5">{t('REPUTE')}</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {(role == 'ADMIN' || role == 'BDM') && (
                                <>
                                    {/* <div
                                        className="flex items-center justify-between"
                                        onClick={() => {
                                            toggleMenu('own');
                                        }}
                                    >
                                        <div className="text-lg">Own</div>
                                        <div className={currentMenu !== 'own' ? '-rotate-90 rtl:rotate-90' : ''}>
                                            <IconCaretDown />
                                        </div>
                                    </div> */}

                                    {/* <li className="nav-item">
                                        <ul>
                                            <li className="nav-item">
                                                <Link href="/dashboards" className="group">
                                                    <div className="flex items-center">
                                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Dashboard')}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Calendar' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        router.push('calendar');
                                                        toggleMenu('Calendar');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Calendar')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Calendar' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'Calendar' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/tasks">{t('Task List')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                href="/tasks"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setState({ isOpenTask: true });
                                                                    assignList();
                                                                    leadList();
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                {t('Create Task')}
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Contacts' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        router.push('contacts');
                                                        toggleMenu('Contacts');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Contacts')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Contacts' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'Contacts' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/create_contact">{t('Create Contact')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/archive_contact">{t('Archive Contact')}</Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Leads' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        router.push('leads');
                                                        toggleMenu('Leads');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconLeads className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Leads')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Leads' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/create_lead">{t('Create Lead')}</Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                        </ul>
                                    </li> */}
                                    <div className="text-lg">Own</div>

                                    <li className="nav-item">
                                        <ul>
                                            <li className="nav-item">
                                                <Link href="/own_dashboard" className="group">
                                                    <div className="flex items-center">
                                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Calendars' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        toggleMenu('Calendars');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Task')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Calendars' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'Calendars' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/my_tasks">{t('My Tasks')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/my_assigned_task">{t('Assigned Tasks')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                href="/tasks"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setState({ isOpenTask: true });
                                                                    assignList();
                                                                    leadList();
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                {t('Create Task')}
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'my_contacts' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        // router.push('contacts');
                                                        toggleMenu('my_contacts');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Contacts')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'my_contacts' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'my_contacts' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/myContacts">{t('My Contacts')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/my_archive_contact">{t('Archive Contacts')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/create_contact">{t('Create Contact')}</Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'my_leads' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        // router.push('leads');
                                                        toggleMenu('my_leads');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconLeads className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Leads')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'my_leads' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'my_leads' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/my_leads">{t('My Leads')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/my_assign_lead">{t('Assigned Leads')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/create_contact">{t('Create Lead')}</Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>

                                                {/* <>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/leads">{t('All Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/assign-lead">{t('Assigned Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                </> */}
                                                {/* <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/create_contact">{t('Create Lead')}</Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight> */}
                                            </li>
                                            {/* {(role == 'ADMIN' || role == 'BDM') && (
                                                <li className="nav-item">
                                                    <Link href="/users/list" className="group">
                                                        <div className="flex items-center">
                                                            <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                            <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Users')}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            )} */}
                                        </ul>
                                    </li>

                                    <div className="text-lg">Team</div>

                                    <li className="nav-item">
                                        <ul>
                                            <li className="nav-item">
                                                <Link href="/dashboards" className="group">
                                                    <div className="flex items-center">
                                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Calendar' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        toggleMenu('Calendar');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Task')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Calendar' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'Calendar' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/tasks">{t('Tasks')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/assigned_task">{t('Assigned Tasks')}</Link>
                                                        </li>
                                                        {/* <li>
                                                            <Link
                                                                href="/tasks"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setState({ isOpenTask: true });
                                                                    assignList();
                                                                    leadList();
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                {t('Create Task')}
                                                            </Link>
                                                        </li> */}
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Contacts' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        // router.push('contacts');
                                                        toggleMenu('Contacts');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Contacts')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Contacts' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'Contacts' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/contacts">{t('Contacts')}</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="/archive_contact">{t('Archive Contacts')}</Link>
                                                        </li>
                                                        {/* <li>
                                                            <Link href="/create_contact">{t('Create Contact')}</Link>
                                                        </li> */}
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="menu nav-item">
                                                <button
                                                    type="button"
                                                    className={`${currentMenu === 'Leads' ? 'active' : ''} nav-link group w-full`}
                                                    onClick={() => {
                                                        // router.push('leads');
                                                        toggleMenu('Leads');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <IconLeads className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Leads')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'Leads' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/leads">{t('All Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/assign-lead">{t('Assigned Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                </>
                                                {/* <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-gray-500">
                                                        <li>
                                                            <Link href="/create_contact">{t('Create Leads')}</Link>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight> */}
                                            </li>
                                            {(role == 'ADMIN' || role == 'BDM') && (
                                                <li className="nav-item">
                                                    <Link href="/users/list" className="group">
                                                        <div className="flex items-center">
                                                            <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                            <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Users')}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            )}
                                        </ul>
                                    </li>
                                </>
                            )}
                            {(role == 'BDE' || role == 'TM') && (
                                <li className="nav-item">
                                    <ul>
                                        <li className="nav-item">
                                            <Link href="/dashboards" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'Calendar' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('Calendar');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Tasks')}</span>
                                                </div>

                                                <div className={currentMenu !== 'Calendar' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'Calendar' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/tasks">{t('My Tasks')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/assigned_task">{t('Assigned Tasks')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/tasks"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setState({ isOpenTask: true });
                                                                assignList();
                                                                leadList();
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            {t('Create Task')}
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'Contacts' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('Contacts');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Contacts')}</span>
                                                </div>

                                                <div className={currentMenu !== 'Contacts' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'Contacts' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/contacts">{t('My Contacts')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/archive_contact">{t('Archive Contact')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/create_contact">{t('Create Contact')}</Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'Leads' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('Leads');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <IconLeads className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Leads')}</span>
                                                </div>

                                                <div className={currentMenu !== 'Leads' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>
                                            {role == 'BDE' && (
                                                <>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/leads">{t('All Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/assign-lead">{t('Assigned Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                </>
                                            )}
                                            {role == 'TM' && (
                                                <>
                                                    <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/leads">{t('All Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight>
                                                    {/* <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                        <ul className="sub-menu text-gray-500">
                                                            <li>
                                                                <Link href="/assign-lead">{t('Assigned Leads')}</Link>
                                                            </li>
                                                        </ul>
                                                    </AnimateHeight> */}
                                                </>
                                            )}
                                            <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/create_contact">{t('Create Lead')}</Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                    </ul>
                                </li>
                            )}
                            {role == 'DM' && (
                                <li className="nav-item">
                                    <ul>
                                        <li className="nav-item">
                                            <Link href="/dashboards" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'Leads' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    // router.push('leads');
                                                    toggleMenu('Leads');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <IconLeads className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Leads')}</span>
                                                </div>

                                                <div className={currentMenu !== 'Leads' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>
                                            <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/leads">{t('All Leads')}</Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                            {/* <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/assign-lead">{t('Assigned Leads')}</Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight> */}
                                            <AnimateHeight duration={300} height={currentMenu === 'Leads' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/create_contact">{t('Create Lead')}</Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* ..............masters................... */}
                            {/* {(role == 'ADMIN' || role == 'BDM') && ( */}
                                <li className="menu nav-item">
                                    <button
                                        type="button"
                                        className={`${currentMenu === 'Masters' ? 'active' : ''} nav-link group w-full`}
                                        onClick={() => {
                                            // router.push('calendar');
                                            toggleMenu('Masters');
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                            <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Masters')}</span>
                                        </div>

                                        <div className={currentMenu !== 'Masters' ? '-rotate-90 rtl:rotate-90' : ''}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    {/* notifications */}
                                    <AnimateHeight duration={300} height={currentMenu === 'Masters' ? 'auto' : 0}>
                                        <ul className="sub-menu text-gray-500">
                                            {/* {role == 'ADMIN' && (
                                                <li>
                                                    <Link href="/monthly-target">{t('Monthly Target')}</Link>
                                                </li>
                                            )} */}

                                            <li>
                                                <Link href="/programme">{t('Programme')}</Link>
                                            </li>

                                            <li>
                                                <Link href="/college">{t('College')}</Link>
                                            </li>

                                            <li>
                                                <Link href="/education_qualification">{t('Education Qualification')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/lead_source_category">{t('Lead Source Category')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/lead-status">{t('Lead Status')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/contact-status">{t('Contact Status')}</Link>
                                            </li>

                                            {/* <li>
                                                <Link href="/opportunity-name">{t('Opportunity Name')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/opportunity-status">{t('Opportunity Status')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/department">{t('Department')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/vertical">{t('Verticals')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/focus-segments">{t('Company Segments')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/market-segmants">{t('Income Segment')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/tags">{t('Tags')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/contact-status">{t('Contact Status')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/stages">{t('Opportunity Stages')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/log-stages">{t('Log Stages')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/countries">{t('Countries')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/state">{t('State')}</Link>
                                            </li>
                                            <li>
                                                <Link href="/city">{t('City')}</Link>
                                            </li> */}
                                            {/* <li>
                                                            <Link
                                                                href="/salutation"
                                                                
                                                            >
                                                                {t('Salutation')}
                                                            </Link>
                                                        </li> */}
                                            {/* <li>
                                                <Link href="/lead-source">{t('Lead Source')}</Link>
                                            </li> */}
                                            {/* <li>
                                                            <Link
                                                                href="/lead-source-from"
                                                                
                                                            >
                                                                {t('Lead Source From')}
                                                            </Link>
                                                        </li> */}
                                            {/* <li>
                                                <Link href="/bdm">{t('BDM')}</Link>
                                            </li> */}
                                        </ul>
                                    </AnimateHeight>
                                </li>
                            {/* )} */}
                            <li className="nav-item">
                                <Link href="/notifications" className="group">
                                    <div className="flex items-center">
                                        <IconMenuChat className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Notifications')}</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>

            <SideMenu
                title="Create Task"
                open={state.isOpenTask}
                close={() => clearTaskData()}
                cancelOnClick={() => clearTaskData()}
                submitOnClick={() => createAndUpdateTask()}
                submitLoading={state.loading}
                canceTitle="Reset"
                renderComponent={() => (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-5 ">
                            <CustomSelect
                                title="Lead "
                                value={state.lead}
                                onChange={(e) => {
                                    if (e) {
                                        getContactList(e);
                                    }
                                    setState({ lead: e, contact: '' });
                                }}
                                placeholder={'Lead '}
                                options={state.leadList}
                                error={state.errors?.lead}
                                required
                                loadMore={() => leadListLoadMore()}
                                loading={state.leadLoading}
                            />
                            {/* {state.contactLoading?
                            
                        
                        } */}
                            <CustomSelect
                                title="Contact"
                                value={state.contact}
                                onChange={(e) => setState({ contact: e })}
                                placeholder={'Contact '}
                                options={state.contactList}
                                error={state.errors?.contact}
                                required
                                loading={state.contactLoading}
                            />
                        </div>

                        <CustomeDatePicker
                            value={state.task_date_time}
                            placeholder="Task Date"
                            title="Task Date"
                            onChange={(e) => setState({ task_date_time: e })}
                            error={state.errors?.task_date_time}
                            required
                        />
                        <CustomSelect
                            title="Task Type"
                            value={state.task_type}
                            onChange={(e) => setState({ task_type: e })}
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
                        {/* <CustomSelect
                            title="Assign To"
                            value={state.assigned_to}
                            onChange={(e) => setState({ assigned_to: e })}
                            placeholder={'Assign To'}
                            options={state.assignList}
                            error={state.errors?.assigned_to}
                            required
                            isMulti={true}
                        /> */}

                        <CustomSelect
                            value={state.assignRole}
                            onChange={(e) => setState({ assignRole: e, assigned_to: '', assignList: [] })}
                            placeholder={'Choose Role'}
                            title={'Choose Role'}
                            options={[
                                { value: 'owner', label: 'Owner' },
                                { value: 'bdm', label: 'BDM' },
                                { value: 'bde', label: 'BDE' },
                                { value: 'tm', label: 'TM' },
                            ]}
                            error={state.errors?.assignRole}
                            required
                        />
                        <CustomSelect
                            title="Assign To"
                            value={state.assigned_to}
                            onChange={(e) => setState({ assigned_to: e })}
                            placeholder={'Assign To'}
                            options={state.assignList}
                            error={state.errors?.assigned_to}
                            required
                            isMulti={true}
                        />

                        <TextArea height="150px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} error={state.errors?.remark} required />
                    </div>
                )}
            />
        </div>
    );
};

export default Sidebar;
