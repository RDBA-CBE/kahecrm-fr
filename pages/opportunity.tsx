import React, { useEffect } from 'react';
import CommonLoader from './elements/commonLoader';
import {  roundOff, showDeleteAlert, useSetState } from '@/utils/functions.utils';
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
import ViewLabel from '@/components/viewLabel';
import SideMenu from '@/common_component/sideMenu';
import OppCard from '@/components/oppCard';
import IconPlus from '@/components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { notifyError, notifySuccess } from '@/components/toast';

export default function Opportunity() {
    const router = useRouter();
    const id = router?.query?.id;

    const [state, setState] = useSetState({
        loading: false,
        data: {},
        isOpen: false,
        opportunityList: [],
    });

    useEffect(() => {
        getDate();
        getContactList();
    }, [id]);

    const getDate = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.opportunity.details(id);

            const find = res?.find((item) => item.id == 4);
            setState({
                loading: false,
                data: find,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getContactList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.opportunity.list(id);
            setState({ opportunityList: res });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const deleteOpp = async (id) => {
        showDeleteAlert(
            async () => {
                try {
                    // Call your delete API function here, e.g., await deleteOpportunity(id);
                    // Assume the delete operation is successful
                    notifySuccess("Opportunity deleted successfully.");
                    
                    // Optionally, you might want to update your state or list of opportunities here
    
                    // Show success alert
                    Swal.fire("Deleted!", "Your opportunity has been deleted.", "success");
                } catch (error) {
                    // Handle the error case
                    notifyError("An error occurred while deleting the opportunity.");
                    Swal.fire("Error!", "An error occurred while deleting the opportunity.", "error");
                }
            },
            () => {
                Swal.fire("Cancelled", "Your opportunity is safe :)", "info");
            },
            "Are you sure you want to delete this opportunity?"
        );
    };
    

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="relative h-[100vh]  overflow-scroll bg-[#dbe7ff] bg-cover p-2">
            <div className="panel  flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                    <h5 className="text-lg font-semibold dark:text-white-light">{`${state.data?.name} (Opportunity)`}</h5>
                </div>
            </div>
            <div className=" mt-4 grid grid-cols-12  gap-4">
                <div className=" col-span-12 flex flex-col   md:col-span-8">
                    <div className="panel flex flex-col gap-5 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                <IconUser className="text-[#82de69]" />
                            </div>
                            <div className=" " style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                Basic Information
                            </div>
                        </div>
                        <ViewLabel label={' Name'} value={state.data?.name} />
                        <ViewLabel label={' Owner'} value={state.data?.owner?.username} />
                        {state.data?.stage && <ViewLabel label={'Stage'} value={state.data?.stage?.stage} />}
                        {state.data?.probability_in_percentage && <ViewLabel label={'Probability In Percentage'} value={state.data?.probability_in_percentage} />}
                        {state.data?.lead && <ViewLabel label={'Lead'} value={state.data?.lead?.name} />}
                        {state.data?.currency_type?.currency_short && <ViewLabel label={'Currency Type'} value={state.data?.currency_type?.currency_short} />}
                        {state.data?.recurring_value_per_year && <ViewLabel label={'Recurring Value Per Year'} value={roundOff(state.data?.recurring_value_per_year)} />}
                        {state.data?.opportunity_value && <ViewLabel label={'Opportunity Value'} value={roundOff(state.data?.opportunity_value)} />}
                        {state.data?.tags?.length > 0 && <ViewLabel label={'Tags'} value={state.data.tags.map((item) => item?.tag).join(', ')} />}
                        {state.data?.closing_date && <ViewLabel label={'Closing Date'} value={state.data?.closing_date} />}
                        {state.data?.created_by && <ViewLabel label={'Created By'} value={state.data?.created_by?.username} />}
                        <ViewLabel label={'Status'} value={state.data?.is_active ? 'Active' : 'In Active'} />
                    </div>
                </div>

                <div className="panel col-span-12 flex flex-col gap-5 rounded-2xl md:col-span-4 ">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                <IconUser className="text-[#82de69]" />
                            </div>
                            <div className=" " style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                Contacts
                            </div>
                        </div>
                        <button type="button" className="btn btn-primary p-2" onClick={() => router.push('/createOpportunity')}>
                            <IconPlus />
                        </button>
                    </div>
                    <div>
                        {state.opportunityList?.map((item) => (
                            <div className="mt-3">
                                <OppCard name={item.name} stage={item?.stage?.stage} closeDate={item?.closing_date} active={item?.is_active} onPress={() => router.push(`/opportunity/${item.id}`)} onEdit={()=>{}} onDelete={()=>deleteOpp(item.id)}/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <SideMenu
                open={state.isOpen}
                close={() => setState({ isOpen: false })}
                title="NEW OPPORTUNITY"
                renderComponent={() => (
                    <div className="p-2">
                        <TextInput title="Lead Name" value={state.name} onChange={(e) => setState({ name: e })} placeholder={'Lead Name'} error={state.errors?.name} required />
                    </div>
                )}
            />
        </div>
    );
}
