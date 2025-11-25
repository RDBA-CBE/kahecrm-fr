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
import Modal from '@/common_component/modal';
import IconLoader from '@/components/Icon/IconLoader';
import TextInput from '@/components/TextInput';
import Pagination from '@/components/Pagination';

const LeadStatus = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

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
        lead_status: '',
        modalManage: false,
        pageSize: 5,
        EditId: null,
        errors: {},
        logLoad: false,
        isOpen: false,
        submitLoad: false,
        isDeleteOpen: false,
        isDeleteLoad: false,
    });

    useEffect(() => {
        getMasterData(state.currentPage);
    }, []);

    // useEffect(() => {
    //     getMasterData(state.currentPage);
    // }, [state.currentPage]);

    const getMasterData = async (page) => {
        try {
            setState({ loading: true });
            const response: any = await Models.master.getleadStatus(page);

            tableData(response);
            setState({
                loading: false,
                currentPage: page
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const tableData = (res: any) => {
        const Data: any = res.results?.map((item: any) => {
            return {
                ...item,
                allData: item,
                name: item.name,
            };
        });

        setState({ data: Data, allData: res, totalRecords: res.count, next: res.next, previous: res.previous, count: res?.count });
    };

    const clearLogData = () => {
        setState({
            // isOpenLog: false,
            submitLoad: false,
            EditId: '',
            lead_status: '',
            isOpen: false,
            isDeleteOpen: false,
            isDeleteLoad: false,
            errors: {},
            name: '',
        });
    };

    const handleCreateAndUpdate = async () => {
        try {
            setState({ submitLoad: true });
            const body = {
                name: state?.name,
            };

            await Validation.CreateLeadStatus.validate(body, { abortEarly: false });

            if (state.EditId) {
                await Models.master.updateleadStatus(body, state.EditId);
                Success('Opportunity Status updated successfully');
            } else {
                await Models.master.createleadStatus(body);
                Success('Opportunity Status created successfully');
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
        const body = {
            is_active: 'False',
        };
        // await Models.master.updateleadStatus(body, state.EditId);
        await Models.master.deleteleadStatus(body, state.EditId).then((res) => {
            Success('Opportunity Status Deleted successfully');
            clearLogData();
            getMasterData(state.currentPage);
        });
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
                {/* Title Section */}
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Opportunity Status</h5>
                </div>

                {/* <div className="mb-5"> */}
                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, name: '', isOpen: true });
                        }}
                    >
                        + Create
                    </button>
                </div>

                {/* </div> */}
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
                                // {
                                //     accessor: 'id',
                                //     width: 70,
                                //     // ,
                                //     title: 'ID',
                                //     render: (row, index) => (
                                //         <>
                                //             <div className="">{row.id}</div>
                                //         </>
                                //     ),
                                // },

                                {
                                    accessor: 'name',
                                    // width: 170,
                                    // ,
                                    title: 'Opportunity Status',
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
                                                        setState({ modalManage: true, EditId: row.id, name: row.name, isOpen: true });
                                                    }}
                                                    // onClick={() => {
                                                    //     state.expandedRow == row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                                    //     console.log("onclick",state.expandedRow);

                                                    // }}
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
                                                        // create:row.name
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

            {/* <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{state.modalManage ? 'Update Opportunity Status' : 'Create Opportunity Status'} </div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <input
                                            type="text"
                                            value={state.create}
                                            onChange={(e) => {
                                                setState({ create: e.target.value });
                                                //  console.log(state.create);
                                            }}
                                            placeholder={state.modalManage ? 'Update' : 'Create'}
                                            style={{ border: '1px solid black', width: '100%', height: '40px', borderRadius: '8px', padding: '5px' }}
                                        />
                                        <div className="mt-8 flex items-center justify-end">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModal1(false)}>
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                                onClick={() => {
                                                    setModal1(false);
                                                    handleCreateAndUpdate();
                                                }}
                                            >
                                                {state.modalManage ? 'Update' : 'Create'}
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}

            <Modal
                open={state.isOpen}
                addHeader={state.EditId ? 'Update Opportunity Status' : 'Create Opportunity Status'}
                close={() => setState({ isOpen: false, name: '', errors: {} })}
                renderComponent={() => (
                    <div className="p-5">
                        <TextInput title={'Name'} placeholder={'Name'} value={state.name} onChange={(e) => setState({ name: e })} error={state.errors?.name} required />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, name: '', errors: {} })}>
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
                close={() => setState({ isDeleteOpen: false, department: '' })}
                renderComponent={() => (
                    <div className="p-5">
                        <div className="text-sm text-dark">
                            <p style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.5' }}>Are You Sure, Do You want to delete? This process cannot be Reverted.</p>
                        </div>
                        <div className="mt-0 flex items-center justify-end">
                            <button type="button" onClick={() => setState({ isDeleteOpen: false })} className="btn btn-outline-danger">
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

export default LeadStatus;
