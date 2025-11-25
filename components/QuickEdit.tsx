import React, { useEffect } from 'react';
import CustomSelect from './Select';
import { Dropdown, objIsEmpty, Success, useSetState } from '@/utils/functions.utils';
import IconLoader from './Icon/IconLoader';
import NumberInput from './NumberInput';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import moment from 'moment';

export default function QuickEdit(props) {
    const { collapse, data, statusList, updateList, id, resetExpandedRow } = props;
    const [state, setState] = useSetState({
        assignList: [],
        followUp: null,
        status: null,
        department: null,
        departmentList: [],
        assigned_to: null,
    });

    useEffect(() => {
        assignData();
        assignRole();
    }, []);

    useEffect(() => {
        if (state.assignRole) {
            if (state.assignRole?.value == 'owner') {
                ownerList();
            } else if (state.assignRole?.value == 'bdm') {
                bdmList();
            } else {
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

    const assignRole = async () => {
        try {
            let role = {};
            let res = data?.lead?.assigned_to;

            if (res !== null && res?.groups?.length > 0) {
                if (res?.groups[0] == 'Admin') {
                    role = { value: 'owner', label: 'Owner' };
                } else if (res?.groups[0] == 'BDM') {
                    role = { value: 'bdm', label: 'BDM' };
                } else if (res?.groups[0] == 'BDE') {
                    role = { value: 'bde', label: 'BDE' };
                } else {
                    role = null;
                }
                setState({ assignRole: role, loading: false });
            } else {
                setState({ assignRole: null });
            }
        } catch (error) {
            setState({ loading: false, assignRole: null });

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

    const assignData = async () => {
        try {
            setState({
                lead_status: !objIsEmpty(data?.allData?.lead_status) ? { value: data?.allData?.lead_status?.id, label: data?.allData?.lead_status?.name } : null,
                follow_up: data?.status_date ? moment(data?.status_date, 'DD-MM-YYYY').toDate() : null,
                assigned_to: !objIsEmpty(data?.lead?.assigned_to)
                    ? { value: data?.lead?.assigned_to?.id, label: data?.lead?.assigned_to?.first_name + ' ' + data?.lead?.assigned_to?.last_name }
                    : null,
                // department: { value: data?.allData?.primary_contact?.department?.id, label: data?.allData?.primary_contact?.department?.department },
            });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const updateLead = async () => {
        try {
            setState({ submitLoad: true });
            const body = {
                lead_status: state.lead_status?.value,
                assigned_to: state.assigned_to?.value,
                department: state.department?.value,
                status_date: state.follow_up ? moment(state.follow_up).format('YYYY-MM-DD') : null,
            };
            const res: any = await Models.lead.update(body, data?.lead?.id);
            setState({ submitLoad: false });
            Success("Lead updated successfully");
            updateList();
        } catch (error) {
            setState({ submitLoad: false });
        }
    };

    const cancelQuickEdit = () => {
        resetExpandedRow(); // Reset the expandedRow to null
        collapse(); // Collapse the row
    };

    return (
        <>
            <h2 className="flex pb-3 text-lg font-bold underline">QUICK EDIT</h2>
            <div className="w-full ">
                {/* Input Section */}
                <div className="flex gap-3 ">
                    {/* <CustomSelect
                        title="Last Status"
                        value={state.lead_status}
                        onChange={(e) => {
                            setState({ lead_status: e });
                        }}
                        placeholder="Last Status"
                        options={statusList}
                    /> */}

                    <CustomeDatePicker value={state.follow_up} placeholder="Follow up" title="Follow up" onChange={(e) => setState({ follow_up: e })} />
                    <CustomSelect
                        value={state.assignRole}
                        onChange={(e) => setState({ assignRole: e, assigned_to: '', assignList: [] })}
                        placeholder={'Choose Role'}
                        title={'Choose Role'}
                        options={[
                            { value: 'owner', label: 'Owner' },
                            { value: 'bdm', label: 'BDM' },
                            { value: 'bde', label: 'BDE' },
                        ]}
                    />
                    <CustomSelect
                        title="Assigned To"
                        value={state.assigned_to}
                        onChange={(e) => {
                            setState({ assigned_to: e });
                        }}
                        placeholder={'Assigned To'}
                        options={state.assignList}
                    />

                    {/* <CustomSelect
                        title="Status"
                        value={state.lead_status}
                        onChange={(e) => {
                            setState({ lead_status: e });
                        }}
                        placeholder="Status"
                        options={statusList}
                      
                    />  */}
                </div>

                {/* Button Section */}
                <div className="flex flex-col gap-3 pt-5 md:flex-row md:justify-end">
                    <button type="button" className="btn btn-outline-danger w-full border md:w-auto" onClick={cancelQuickEdit}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => updateLead()}>
                        {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
        </>
    );
}
