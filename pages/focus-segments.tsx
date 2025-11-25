import { Fragment, useEffect, useState } from 'react';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconMobile from '@/components/Icon/IconMobile';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import { useRouter } from 'next/router';
import QuickEdit from '@/components/QuickEdit';
import { Dialog, Transition } from '@headlessui/react';
import IconCode from '@/components/Icon/IconCode';
import IconX from '@/components/Icon/IconX';
import IconTrash from '@/components/Icon/IconTrash';
import Models from '@/imports/models.import';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import { Success, useSetState } from '@/utils/functions.utils';
import * as Yup from 'yup';
import { Validation } from '@/utils/imports.utils';
import IconBell from '@/components/Icon/IconBell';
import CustomSelect from '@/components/Select';
import { Dropdown } from '@/utils/functions.utils';
import Modal from '@/common_component/modal';
import IconLoader from '@/components/Icon/IconLoader';
import TextInput from '@/components/TextInput';
import Pagination from '@/components/Pagination';

const FocusSegmets = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const router = useRouter();

    const [state, setState] = useSetState({
        state: [],
        loading: false,
        role: '',
        currentPage: 1,
        totalRecords: 0,
        next: null,
        previous: null,
        allData: null,
        expandedRow: null,
        data: [],
        create: '',
        modalManage: false,
        pageSize: 5,
        EditId: null,
        errors: {},
        logLoad: false,
        vertical: null,
        focus: '',
        verticalList: [],
        focusList: [],
        focus_segment: '',
        submitLoad: false,
        isDeleteOpen: false,
        isOpen: false,
        isDeleteLoad: false,
    });

    useEffect(() => {
        getMasterData(state.currentPage);
        verticalList();
    }, []);

    // useEffect(() => {
    //     getMasterData(state.currentPage);
    // }, [state.currentPage]);

    const getMasterData = async (page) => {
        try {
            setState({ loading: true });
            const response: any = await Models.master.getfocusesegment(page);
            tableData(response);
            setState({
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const tableData = (res: any) => {
        const Data: any = res?.results?.map((item: any) => {
            return {
                ...item,
                allData: item,
                focus_segment: item.focus_segment,
                vertical: item?.vertical?.vertical,
            };
        });

        setState({ data: Data, allData: res, totalRecords: res.count, next: res.next, previous: res.previous ,count:res?.count});
    };

    const clearLogData = () => {
        setState({
            EditId: '',
            focus_segment: '',
            submitLoad: false,
            errors: {},
            isOpen: false,
            isDeleteOpen: false,
            isDeleteLoad: false,
            vertical: '',
        });
    };

    const handleCreateAndUpdate = async () => {
        try {
            setState({ submitLoad: true });
            const body = {
                focus_segment: state?.focus_segment,
                vertical: state.vertical?.value,
            };
            await Validation.Createfocussegment.validate(body, { abortEarly: false });
            if (state.EditId) {
                await Models.master.updatefocussegment(body, state.EditId);
                Success('Focus Segment Updated successfully');
            } else {
                await Models.master.createfocussegment(body);
                Success('Focus Segment created successfully');
            }
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ errors: validationErrors });
                setState({ submitLoad: false });
            } else {
                console.log('Error: ', error?.message);
                setState({ submitLoad: false });
            }
            setState({ submitLoad: false });
        }
    };

    const handleDelete = async () => {
        try {
            setState({ isDeleteLoad: true });
            const body = {
                is_active: 'False',
            };

            await Models.master.deletefocussegment(body, state.EditId);
            Success('Focus Segment Deleted successfully');
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            setState({ isDeleteLoad: false });
        }
    };

    const getFocusSegmentList = async (verticalData: any) => {
        try {
            setState({ logLoad: true });
            const res: any = await Models.master.getverticals(verticalData?.value);
            let focusList: [];
            if (res?.results?.length > 0) {
                focusList = res?.results?.map((item) => ({ value: item?.id, label: item?.focus_segment }));
            }

            setState({ focusList: focusList });
        } catch (error) {
            setState({ logLoad: false });
        }
    };

    const verticalList = async () => {
        try {
            setState({ logLoad: true });
            const response: any = await Models.master.getverticals(1);
            const dropdownList = Dropdown(response.results, 'vertical');
            setState({ verticalList: dropdownList, logLoad: false });
        } catch (error) {
            setState({ logLoad: false });
        }
    };

    const handleNextPage = () => {
        if (state.next) {
            setState({ currentPage: state.currentPage + 1 });
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            setState({ currentPage: state.currentPage - 1 });
        }
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Company Segments</h5>
                </div>

                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, focus_segment: '', isOpen: true, vertical: '' });
                        }}
                    >
                        + Create
                    </button>
                </div>
            </div>

            {state.data?.length > 0 ? (
                <>
                    <div className="flex items-center justify-end pb-2 pr-3">
                        <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                            {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                        </div>
                    </div>
                    <div>
                        <DataTable
                            className="table-responsive"
                            records={state.data}
                            columns={[
                                {
                                    accessor: 'focus_segment',
                                    title: 'Name',
                                },

                                {
                                    accessor: 'vertical',
                                    title: 'Vertical',
                                },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <div className=" flex w-max items-center gap-4">
                                            <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                                <button
                                                    type="button"
                                                    className="flex hover:text-primary"
                                                    onClick={() => {
                                                        setState({
                                                            modalManage: true,
                                                            EditId: row.id,
                                                            focus_segment: row.focus_segment,
                                                            isOpen: true,
                                                            vertical: { value: row?.allData?.vertical?.id, label: row?.allData?.vertical?.vertical },
                                                        });
                                                    }}
                                                >
                                                    <IconNotesEdit />
                                                </button>
                                            </Tippy>

                                            <button
                                                className="flex hover:text-info"
                                                onClick={() => {
                                                    setState({
                                                        modalManage: true,
                                                        EditId: row.id,
                                                        isDeleteOpen: true,

                                                        // create:""
                                                    });
                                                }}
                                            >
                                                <IconTrash className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={state.data?.length}
                            recordsPerPage={state.pageSize}
                            minHeight={200}
                            page={null}
                            onPageChange={(p) => {}}
                            withBorder={true}
                            styles={{
                                root: {
                                    overflowX: 'auto', // Enable horizontal scroll
                                },
                            }}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                    {/* <div className="mt-5 flex justify-end gap-3">
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
                                getMasterData(page);
                                setState({ currentPage: page });
                            }}
                            hasNext={state.next !== null}
                            hasPrevious={state.previous !== null}
                            recordsPerPage={10}
                        />
                    </div>
                </>
            ) : (
                <div className="mt-20 flex items-center justify-center">No Record Found</div>
            )}

            <Modal
                open={state.isOpen}
                height={350}
                addHeader={state.EditId ? 'Update Company Segment' : 'Create Company Segment'}
                close={() => setState({ isOpen: false, focus_segment: '', errors: {}, vertical: '' })}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 p-5">
                        <CustomSelect
                            title="Vertical"
                            placeholder="Vertical"
                            value={state.vertical}
                            onChange={(e) => {
                                if (e) {
                                    setState({ vertical: e });
                                } else {
                                    setState({ vertical: '' });
                                }
                            }}
                            options={state.verticalList}
                            error={state.errors?.vertical}
                            required
                        />
                        <TextInput
                            title={'Focus segment name'}
                            placeholder={'Focus segment name'}
                            value={state.focus_segment}
                            onChange={(e) => setState({ focus_segment: e })}
                            error={state.errors?.focus_segment}
                            required
                        />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, focus_segment: '', errors: {} })}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                onClick={() => {
                                    handleCreateAndUpdate();
                                }}
                            >
                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : state.modalManage ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}
            />

            <Modal
                open={state.isDeleteOpen}
                close={() => setState({ isDeleteOpen: false, focus_segment: '', vertical: '' })}
                renderComponent={() => (
                    <div className="p-5">
                        <div className="text-sm text-dark">
                            <p style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.5' }}>Are You Sure, Do You want to delete? This process cannot be Reverted.</p>
                        </div>
                        <div className="mt-0 flex items-center justify-end">
                            <button type="button" onClick={() => setState({ isDeleteOpen: false, focus_segment: '', vertical: '' })} className="btn btn-outline-danger">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleDelete();
                                }}
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                            >
                                {state.isDeleteLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default FocusSegmets;
