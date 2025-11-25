import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import { useRouter } from 'next/router';
import { Dropdown, Failure, Success, objIsEmpty, useSetState } from '@/utils/functions.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import CheckboxInput from '@/components/Checkbox';
import Models from '@/imports/models.import';
import CommonLoader from './elements/commonLoader';
import Breadcrumb from '@/common_component/breadcrumb';
import CustomeDatePicker from '@/common_component/datePicker';
import TextArea from '@/components/TextArea';

import moment from 'moment';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Validation } from '@/utils/imports.utils';
import CustomPhoneInput from '@/components/PhoneInput';

const UpdateContact = () => {
    const router = useRouter();

    const id = router?.query?.id;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Update Contact'));
    });

    const [state, setState] = useSetState({
        loading: false,
        name: null,
        focus_segment: null,
        lead_owner: '',
        phone_number: null,
        country: null,
        state: null,
        company_number: '',
        company_email: '',
        company_website: '',
        fax: '',
        annual_revenue: '',
        tags: [],
        market_segment: '',
        is_active: false,
        focusSegmentList: [],
        marketSegmentList: [],
        countryList: [],
        tagList: [],
        ownerList: [],
        stateList: [],
        createdByList: [],
        stateLoading: false,
        submitLoad: false,
        errors: null,
        created_by: null,
        verticalList: [],
        vertical: '',
        isOpenTask: false,
        isOpen: false,
        source_from: null,
        assignList: [],
        sourceList: [],
        sourceFromList: [],
        leadTypeList: [],
        leadManagerList: [],
        currentLeadPage: 1,
        is_archive: false,
        moveToLead: false,
        contactAssignRole: null,

        openSections: {
            personal: true,
            education: false,
            work: false,
            internal: false,
        },
    });

     useEffect(() => {
        getDetail();
       
    }, [id]);

    useEffect(() => {
        sourceList();
        countryList();
        collegeList();
        courseList();
        leadStatusList();
        contactStatusList();
        qualificationList();
    }, []);

    const getDetail = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.details(id);
            console.log('getDetail --->', res);
            setState({
                loading: false,

                student_name: res?.student_name,
                email: res?.email,
                phone_number: res?.phone_number,
                alternate_email: res?.alternate_email?.trim(),
                status:{value:res?.status?.id,label:res?.status?.status,
                    address:res?.address
}

                // country:res?.country,
                // state:res?.state,
                // city:res?.city,
                // pincode:res?.pincode,
                // address:res?.address,
                // parent_name:res?.parent_name,
                // parent_designation:res?.parent_designation,
                // siblings_count:res?.siblings_count,
                // education_qualification:res?.education_qualification,
                // graduation_year:res?.graduation_year,
                // board_name:res?.board_name,
                // school_name:res?.school_name,
                // tenth_marks:res?.tenth_marks,
                // twelfth_marks:res?.twelfth_marks,
                // ug_marks:res?.ug_marks,
                // entrance_exam_score:res?.entrance_exam_score,
                // preferred_location:res?.preferred_location,
                // best_time_to_contact:res?.best_time_to_contact,
                // interview_rating:res?.interview_rating,
                // internal_rating:res?.internal_rating,
                // annual_income:res?.annual_income,
                // personal_remark:res?.personal_remark,
                // source_detail:res?.source_detail,
                // score_in_subject:res?.score_in_subject,
                // relation_to_student:res?.relation_to_student,
                // status:res?.status
            });
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

    const collegeList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.college_list(1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ collegeList: dropdownList, loading: false, collegePage: 1, collegeHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const collegeLoadMore = async () => {
        try {
            setState({ collegeloadMore: true });
            const res: any = await Models.master.college_list(state.collegePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ collegeList: [...state.collegeList, ...dropdownList], collegeloadMore: false, collegePage: state.collegePage + 1, collegeHasNext: res.next });
        } catch (error) {
            setState({ collegeloadMore: false });
            console.log('error: ', error);
        }
    };

    const courseList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.course_list(1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ courseList: dropdownList, loading: false, coursePage: 1, courseHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const courseLoadMore = async () => {
        try {
            setState({ courseloadMore: true });
            const res: any = await Models.master.course_list(state.coursePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ courseList: [...state.courseList, ...dropdownList], courseloadMore: false, coursePage: state.coursePage + 1, courseHasNext: res.next });
        } catch (error) {
            setState({ courseloadMore: false });
            console.log('error: ', error);
        }
    };

    const qualificationList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_education_qua(1);
            const dropdownList = Dropdown(res.results, 'qualification');
            setState({ qualificationList: dropdownList, loading: false, qualificationPage: 1, qualificationHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const qualificationLoadMore = async () => {
        try {
            setState({ qualificationloadMore: true });
            const res: any = await Models.master.lead_education_qua(state.qualificationPage + 1);
            const dropdownList = Dropdown(res.results, 'qualification');
            setState({
                qualificationList: [...state.qualificationList, ...dropdownList],
                qualificationloadMore: false,
                qualificationPage: state.qualificationPage + 1,
                qualificationHasNext: res.next,
            });
        } catch (error) {
            setState({ qualificationloadMore: false });
            console.log('error: ', error);
        }
    };

    const leadStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_status_list(1);
            const dropdownList = Dropdown(res.results, 'name');
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
            const dropdownList = Dropdown(res.results, 'name');
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

    const contactStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.contact_status_list(1);
            const dropdownList = Dropdown(res.results, 'status');
            setState({ contactStatusList: dropdownList, loading: false, contactStatusPage: 1, contactStatusHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const contactStatusLoadMore = async () => {
        try {
            setState({ contactStatusloadMore: true });
            const res: any = await Models.master.contact_status_list(state.contactStatusPage + 1);
            const dropdownList = Dropdown(res.results, 'status');
            setState({
                contactStatusList: [...state.contactStatusList, ...dropdownList],
                contactStatusloadMore: false,
                contactStatusPage: state.contactStatusPage + 1,
                contactStatusHasNext: res.next,
            });
        } catch (error) {
            setState({ contactStatusloadMore: false });
            console.log('error: ', error);
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

    const handleSubmit = async () => {
        const buildContactPayload = {
            phone_number: state.phone_number,
            lead_source: state.lead_source?.value,
            remark: state.remark?.trim(),
            is_archive: !!state.is_archive,
            lead_status: state.lead_status?.value,
            assigned_to: state.assigned_to?.value,
            student_name: state.student_name?.trim(),
            email: state.email?.trim(),
            alternate_email: state.alternate_email?.trim(),
            secondary_phone_number: state.secondary_phone_number,
            parent_name: state.parent_name?.trim(),
            parent_designation: state.parent_designation?.trim(),
            siblings_count: state.siblings_count ? Number(state.siblings_count) : null,
            address: state.address?.trim(),
            city: state.city?.value,
            pincode: state.pincode?.trim(),
            education_qualification: state.education_qualification?.value,
            graduation_year: state.graduation_year ? Number(state.graduation_year) : null,
            board_name: state.board_name?.trim(),
            school_name: state.school_name?.trim(),
            tenth_marks: state.tenth_marks ? Number(state.tenth_marks) : null,
            twelfth_marks: state.twelfth_marks ? Number(state.twelfth_marks) : null,
            ug_marks: state.ug_marks ? Number(state.ug_marks) : null,
            entrance_exam_score: state.entrance_exam_score ? Number(state.entrance_exam_score) : null,
            colleges_interested: state.colleges_interested,
            courses_interested: state.courses_interested,
            preferred_location: state.preferred_location?.trim(),
            best_time_to_contact: state.best_time_to_contact ? moment(state.best_time_to_contact).format('YYYY-MM-DD HH:mm:ss') : null,
            interview_rating: state.interview_rating ? Number(state.interview_rating) : null,
            internal_rating: state.internal_rating ? Number(state.internal_rating) : null,
            annual_income: state.annual_income ? Number(state.annual_income) : null,
            personal_remark: state.personal_remark?.trim(),
            source_detail: state.source_detail,
            score_in_subject: state.score_in_subject,
            relation_to_student: state.relation_to_student,
            status: state.status?.value,
        };

        try {
            setState({ submitLoad: true });

            if (state.isMoveToLead) {
                const leadBody = {
                    colleges_interested: state.colleges_interested?.value,
                    courses_interested: state.courses_interested?.value,
                    lead_status: state.lead_status?.value,
                    assigned_to: state.assigned_to?.value,
                    lead_source: state.lead_source?.value,
                    preferred_location: state.preferred_location?.trim(),
                    best_time_to_contact: state.best_time_to_contact ? moment(state.best_time_to_contact).format('YYYY-MM-DD HH:mm:ss') : null,
                    source_detail: state.source_detail,
                };

                await Validation.createContactWithLead.validate(leadBody, { abortEarly: false });

                // await Models.contact.createWithLead({ ...buildContactPayload, ...leadBody });
                Success('Lead created successfully');
                router.push('/leads');
            } else {
                console.log('✌️buildContactPayload --->', buildContactPayload);

                await Validation.createContact.validate(buildContactPayload, { abortEarly: false });
                console.log('✌️buildContactPayload --->', buildContactPayload);

                const res = await Models.contact.update(buildContactPayload, id);
                console.log('✌️res --->', res);
                Success('Contact updated successfully');
                router.push('/contacts');
            }
        } catch (error) {
            if (error?.inner) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });
                console.log('validationErrors', validationErrors);
                setState({ errors: validationErrors });
            } else {
                Failure(error?.message || 'Something went wrong');
            }
        } finally {
            setState({ submitLoad: false });
        }
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/contacts' },
        { label: 'Update Contact', path: '' },
    ];

    const toggleSection = (sectionId) => {
        setState({
            openSections: {
                ...state.openSections,
                [sectionId]: !state.openSections[sectionId],
            },
        });
    };

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="relative h-auto  overflow-scroll bg-[#dbe7ff] bg-cover p-2">
            <Breadcrumb items={breadcrumbItems} />

            <div className="panel  flex  items-center justify-between gap-5 ">
                <div className="flex items-center gap-2">
                    <div className="flex h-[50px] w-[50px] overflow-hidden bg-white" style={{ borderRadius: 50 }}>
                        <img src="/assets/images/profile-1.jpeg" height={'100%'} width={'100%'} />
                    </div>
                    <div>
                        <h5 className="font-semibold " style={{ fontSize: '18px' }}>
                            Update Contact
                        </h5>
                        <div className="  " style={{ fontSize: '14px', color: 'grey' }}>
                            Your data journey starts here...
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-3 pt-3">
                {/* --- Personal Info Section --- */}
                <div className="panel overflow-hidden rounded-lg border">
                    <button type="button" onClick={() => toggleSection('personal')} className="flex w-full items-center justify-between bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100">
                        <div className="text-lg">Personal Information</div>
                        {state.openSections?.personal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {state.openSections?.personal && (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                            <TextInput
                                title="Student Name"
                                value={state.student_name}
                                onChange={(e) => setState({ student_name: e })}
                                placeholder={'Student Name'}
                                error={state.errors?.student_name}
                                required
                            />
                            <TextInput title="Email" value={state.email} onChange={(e) => setState({ email: e })} placeholder={'Email'} error={state.errors?.email} required />
                            <TextInput
                                title="Alternate Email"
                                value={state.alternate_email}
                                onChange={(e) => setState({ alternate_email: e })}
                                placeholder={'Alternate Email'}
                                error={state.errors?.alternate_email}
                            />
                            {/* <NumberInput
                                title="Phone Number"
                                value={state.phone_number}
                                onChange={(e) => setState({ phone_number: e })}
                                placeholder={'Phone Number'}
                                error={state.errors?.phone_number}
                                required
                            /> */}
                            <CustomPhoneInput
                                title={'Phone'}
                                placeholder={'Phone Number'}
                                value={state.phone_number}
                                onChange={(e) => setState({ phone_number: e, errors: { ...state.errors, phone_number: '' } })}
                                error={state.errors?.phone_number}
                                required
                            />
                            <NumberInput
                                title="Secondary Phone Number"
                                value={state.secondary_phone_number}
                                onChange={(e) => setState({ secondary_phone_number: e })}
                                placeholder={'Secondary Phone Number'}
                                error={state.errors?.secondary_phone_number}
                            />
                            <TextInput
                                title="Relation To Student"
                                value={state.relation_to_student}
                                onChange={(e) => setState({ relation_to_student: e })}
                                placeholder={'Relation To Student'}
                                error={state.errors?.relation_to_student}
                            />
                            <CustomSelect
                                title="Contact Status"
                                value={state.status}
                                onChange={(e) => setState({ status: e })}
                                placeholder={'Contact Status'}
                                options={state.contactStatusList}
                                error={state.errors?.status}
                            />
                            <TextInput title="Address" value={state.address} onChange={(e) => setState({ address: e })} placeholder={'Address'} error={state.errors?.address} />
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
                            />
                            <CustomSelect title="City" value={state.city} onChange={(e) => setState({ city: e })} placeholder={'City'} options={state.cityList} error={state.errors?.city} />
                            <NumberInput title="Pincode" value={state.pincode} onChange={(e) => setState({ pincode: e })} placeholder={'Pincode'} error={state.errors?.pincode} />
                        </div>
                    )}
                </div>

                {/* --- Family Info Section --- */}
                <div className="panel overflow-hidden rounded-lg border">
                    <button type="button" onClick={() => toggleSection('family')} className="flex w-full items-center justify-between bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100">
                        <div className="text-lg">Family Details</div>

                        {state.openSections?.family ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {state.openSections?.family && (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                            <TextInput title="Parent Name" value={state.parent_name} onChange={(e) => setState({ parent_name: e })} placeholder={'Parent Name'} error={state.errors?.parent_name} />
                            <TextInput
                                title="Parent Designation"
                                value={state.parent_designation}
                                onChange={(e) => setState({ parent_designation: e })}
                                placeholder={'Parent Designation'}
                                error={state.errors?.parent_designation}
                            />
                            <NumberInput
                                title="Annual Income"
                                value={state.annual_income}
                                onChange={(e) => setState({ annual_income: e })}
                                placeholder={'Annual Income'}
                                error={state.errors?.annual_income}
                            />
                            {/* <TextInput
                                        title="Father Name"
                                        value={state.father_name}
                                        onChange={(e) => setState({ father_name: e })}
                                        placeholder={'Father Name'}
                                        error={state.errors?.father_name}
                                    />
                                    <TextInput
                                        title="Mother Name"
                                        value={state.mother_name}
                                        onChange={(e) => setState({ mother_name: e })}
                                        placeholder={'Mother Name'}
                                        error={state.errors?.mother_name}
                                    /> */}
                            <NumberInput
                                title="Siblings Count"
                                value={state.siblings_count}
                                onChange={(e) => setState({ siblings_count: e })}
                                placeholder={'Siblings Count'}
                                error={state.errors?.siblings_count}
                            />
                        </div>
                    )}
                </div>

                {/* --- Education Section --- */}
                <div className="panel overflow-hidden rounded-lg border">
                    <button type="button" onClick={() => toggleSection('education')} className="flex w-full items-center justify-between bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100">
                        <span className="text-lg">Education Qualification</span>
                        {state.openSections?.education ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {state.openSections?.education && (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                            <CustomSelect
                                title="Qualification"
                                value={state.education_qualification}
                                onChange={(e) => setState({ education_qualification: e })}
                                placeholder={'Qualification'}
                                options={state.qualificationList}
                                error={state.errors?.education_qualification}
                                loadMore={() => qualificationLoadMore()}
                            />
                            <TextInput title="School Name" value={state.school_name} onChange={(e) => setState({ school_name: e })} placeholder={'School Name'} error={state.errors?.school_name} />
                            <TextInput title="Board Name" value={state.board_name} onChange={(e) => setState({ board_name: e })} placeholder={'Board Name'} error={state.errors?.board_name} />
                            <NumberInput
                                title="Graduation Year"
                                value={state.graduation_year}
                                onChange={(e) => setState({ graduation_year: e })}
                                placeholder={'Graduation Year'}
                                error={state.errors?.graduation_year}
                            />
                            <NumberInput title="10th Marks" value={state.tenth_marks} onChange={(e) => setState({ tenth_marks: e })} placeholder={'10th Marks'} error={state.errors?.tenth_marks} />
                            <NumberInput
                                title="12th Marks"
                                value={state.twelfth_marks}
                                onChange={(e) => setState({ twelfth_marks: e })}
                                placeholder={'12th Marks'}
                                error={state.errors?.twelfth_marks}
                            />
                            <NumberInput title="UG Marks" value={state.ug_marks} onChange={(e) => setState({ ug_marks: e })} placeholder={'UG Marks'} error={state.errors?.ug_marks} />
                            <NumberInput
                                title="Entrance Exam Score"
                                value={state.entrance_exam_score}
                                onChange={(e) => setState({ entrance_exam_score: e })}
                                placeholder={'Entrance Exam Score'}
                                error={state.errors?.entrance_exam_score}
                            />
                            <NumberInput
                                title="Score in Subjects"
                                value={state.score_in_subject}
                                onChange={(e) => setState({ score_in_subject: e })}
                                placeholder={'Score in Subjects'}
                                error={state.errors?.tenth_marks}
                            />
                        </div>
                    )}
                </div>

                {/* --- Internal / Other Section --- */}
                <div className="panel overflow-hidden rounded-lg border">
                    <button type="button" onClick={() => toggleSection('internal')} className="flex w-full items-center justify-between bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100">
                        <span className="text-lg">Internal Assessment & Remarks</span>
                        {state.openSections?.internal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {state.openSections?.internal && (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                            <NumberInput
                                title="Interview Rating"
                                value={state.interview_rating}
                                onChange={(e) => setState({ interview_rating: e })}
                                placeholder={'Interview Rating'}
                                error={state.errors?.interview_rating}
                            />
                            <NumberInput
                                title="Internal Rating"
                                value={state.internal_rating}
                                onChange={(e) => setState({ internal_rating: e })}
                                placeholder={'Internal Rating'}
                                error={state.errors?.internal_rating}
                            />

                            <TextArea title="Remark" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} error={state.errors?.remark} />
                            <TextArea
                                title="Personal Remark"
                                value={state.personal_remark}
                                onChange={(e) => setState({ personal_remark: e })}
                                placeholder={'Personal Remark'}
                                error={state.errors?.personal_remark}
                            />
                        </div>
                    )}
                </div>

                {/* --- Move To Lead Section --- */}
                <div className={`panel overflow-hidden rounded-lg border transition-all ${state.isMoveToLead ? 'border-blue-500 shadow-md ' : ''}`}>
                    <CheckboxInput
                        className="mt-2 w-full md:w-1/2 lg:w-3/4"
                        checked={state.isMoveToLead}
                        disabled={state.is_archive}
                        onChange={(val) => {
                            setState({ isMoveToLead: val });
                        }}
                        label="Move To Lead"
                    />

                    {state.isMoveToLead && (
                        <div className="space-y-6 bg-white p-4">
                            {/* Lead Basic Info */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <CustomSelect
                                    title="College"
                                    value={state.colleges_interested}
                                    onChange={(e) => setState({ colleges_interested: e })}
                                    placeholder={'College'}
                                    options={state.collegeList}
                                    loadMore={() => state.collegeHasNext && collegeLoadMore()}
                                    error={state.errors?.colleges_interested}
                                />

                                <CustomSelect
                                    title="Course"
                                    value={state.courses_interested}
                                    onChange={(e) => setState({ courses_interested: e })}
                                    placeholder={'Course'}
                                    options={state.courseList}
                                    loadMore={() => state.courseHasNext && courseLoadMore()}
                                    error={state.errors?.courses_interested}
                                />

                                <CustomSelect
                                    title="Lead Status"
                                    value={state.lead_status}
                                    onChange={(e) => setState({ lead_status: e })}
                                    placeholder={'Lead Status'}
                                    options={state.leadStatusList}
                                    error={state.errors?.status}
                                    loadMore={() => state.leadStatusHasNext && leadStatusLoadMore()}
                                />
                                <CustomSelect
                                    title="Assigned To"
                                    value={state.assigned_to}
                                    onChange={(e) => setState({ assigned_to: e })}
                                    placeholder={'Assigned To'}
                                    options={state.statusList}
                                    error={state.errors?.assigned_to}
                                />
                                <CustomSelect
                                    title="Lead Source "
                                    value={state.lead_source}
                                    onChange={(e) => setState({ lead_source: e })}
                                    placeholder={'Lead Source '}
                                    options={state.sourceList}
                                    error={state.errors?.lead_source}
                                    loadMore={() => state.sourceHasNext && sourceLoadMore()}
                                />

                                <TextInput
                                    title="Preferred Location"
                                    value={state.preferred_location}
                                    onChange={(e) => setState({ preferred_location: e })}
                                    placeholder={'Preferred Location'}
                                    error={state.errors?.preferred_location}
                                />

                                <CustomeDatePicker
                                    error={state.errors?.best_time_to_contact}
                                    value={state.best_time_to_contact}
                                    placeholder="Best Time to Contact"
                                    title="Best Time to Contact"
                                    onChange={(e) => setState({ best_time_to_contact: e })}
                                />
                                <TextArea
                                    title="Source Detail"
                                    value={state.source_detail}
                                    onChange={(e) => setState({ source_detail: e })}
                                    placeholder={'Source Detail'}
                                    error={state.errors?.personal_remark}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t pt-6">
                    <button type="button" onClick={() => {}} className="rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200">
                        Cancel
                    </button>
                    <button type="button" onClick={() => handleSubmit()} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        {state.isMoveToLead ? 'Create Lead' : 'Create Contact'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateContact;
