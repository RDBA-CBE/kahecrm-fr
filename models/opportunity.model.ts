import instance from '@/utils/axios.utils';

const opportunity = {
    list: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/${id}`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    meAndAssigned: (id, page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/?page=${page}&user_id=${id}`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    allList: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/?page=${page}&page_size=10`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    listByLeadId: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/lead_id/${id}/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    filters: (data: any, page: any, userId = null) => {


        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/?page=${page}&page_size=10`;
            if (!userId && data.team) {
                if (data.team) {
                    url += `&team=${encodeURIComponent(data.team)}`;
                }
            }

            if (data.display_date_source) {
                url += `&display_date_source=${encodeURIComponent(data.display_date_source)}`;
            }

            if (data.search) {
                url += `&search=${encodeURIComponent(data.search)}`;
            }
            if (data.lead_source) {
                url += `&lead_source=${encodeURIComponent(data.lead_source)}`;
            }
            if (data.opportunity) {
                url += `&name=${encodeURIComponent(data.opportunity)}`;
            }
            if (data.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(data.assigned_to)}`;
            }
            if (data.status) {
                url += `&opportunity_status=${encodeURIComponent(data.status)}`;
            }
            if (data.from_date) {
                url += `&from_date=${encodeURIComponent(data.from_date)}`;
            }
            if (data.end_date) {
                url += `&to_date=${encodeURIComponent(data.end_date)}`;
            }

            if (data.bdm) {
                url += `&bdm=${encodeURIComponent(data.bdm)}`;
            }
            if (data.bde) {
                url += `&bde=${encodeURIComponent(data.bde)}`;
            }
            if (data.dm) {
                url += `&created_by=${encodeURIComponent(data.dm)}`;
            }
            if (data.tm) {
                url += `&created_by=${encodeURIComponent(data.tm)}`;
            }

            if (userId || data.assigned_to) {
                if (data.created_by) {
                    url += `&created_by=${encodeURIComponent(data.created_by)}`;
                }
            }

            if (data.today && data?.card_lead_status) {
                url += `&today=${encodeURIComponent(data.today)}&opporunity_status=${encodeURIComponent(data.opporunity_status)}`;
            }
            if (data.month && data?.card_lead_status) {
                url += `&month=${encodeURIComponent(data.month)}&opporunity_status=${encodeURIComponent(data.opporunity_status)}`;
            }
            instance()
                .get(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    filtersByAssignLead: (data: any, page: any, userId = '') => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/?page=${page}&page_size=10`;

            if (!userId && data.team) {
                if (data.team) {
                    url += `&team=${encodeURIComponent(data.team)}`;
                }
            }

            if (data.display_date_source) {
                url += `&display_date_source=${encodeURIComponent(data.display_date_source)}`;
            }

            if (data.search) {
                url += `&search=${encodeURIComponent(data.search)}`;
            }
            if (data.lead_source) {
                url += `&lead_source=${encodeURIComponent(data.lead_source)}`;
            }
            if (data.opportunity) {
                url += `&name=${encodeURIComponent(data.opportunity)}`;
            }

            if (data.status) {
                url += `&opportunity_status=${encodeURIComponent(data.status)}`;
            }
            if (data.from_date) {
                url += `&from_date=${encodeURIComponent(data.from_date)}`;
            }
            if (data.end_date) {
                url += `&to_date=${encodeURIComponent(data.end_date)}`;
            }
            if (data.bdm) {
                url += `&assigned_to=${encodeURIComponent(data.bdm)}`;
            } else if (data.bde) {
                url += `&assigned_to=${encodeURIComponent(data.bde)}`;
            } else if (data.dm) {
                url += `&assigned_to=${encodeURIComponent(data.dm)}`;
            } else if (data.tm) {
                url += `&assigned_to=${encodeURIComponent(data.tm)}`;
            } else if (userId) {
                url += `&assigned_to=${userId}`;
            }
            if (data.today && data?.card_lead_status) {
                url += `&today=${encodeURIComponent(data.today)}&opportunity_status=${encodeURIComponent(data.opporunity_status)}`;
            } else if (data.month && data?.card_lead_status) {
                url += `&month=${encodeURIComponent(data.month)}&opportunity_status=${encodeURIComponent(data.opporunity_status)}`;
            }

            if (data.assigned_leads == 'Yes') {
                url += `&assigned_leads=${encodeURIComponent(true)}`;
            }
            instance()
                .get(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    filtersByOwnLead: (data: any, page: any, userId = '') => {
    
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/?page=${page}&page_size=10`;
            if ( data.team) {
                if (data.team) {
                    url += `&team=${encodeURIComponent(data.team)}`;
                }
            }

            if (data.display_date_source) {
                url += `&display_date_source=${encodeURIComponent(data.display_date_source)}`;
            }

            if (data.search) {
                url += `&search=${encodeURIComponent(data.search)}`;
            }
            if (data.lead_source) {
                url += `&lead_source=${encodeURIComponent(data.lead_source)}`;
            }
            if (data.opportunity) {
                url += `&name=${encodeURIComponent(data.opportunity)}`;
            }

            if (data.status) {
                url += `&opportunity_status=${encodeURIComponent(data.status)}`;
            }
            if (data.from_date) {
                url += `&from_date=${encodeURIComponent(data.from_date)}`;
            }
            if (data.end_date) {
                url += `&to_date=${encodeURIComponent(data.end_date)}`;
            }
            if (data.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(data.assigned_to)}`;
            } else if (data.bdm) {
                url += `&created_by=${encodeURIComponent(data.bdm)}`;
            } else if (data.bde) {
                url += `&created_by=${encodeURIComponent(data.bde)}`;
            } else if (data.dm) {
                url += `&created_by=${encodeURIComponent(data.dm)}`;
            } else if (data.tm) {
                url += `&created_by=${encodeURIComponent(data.tm)}`;
            } else if (userId) {
                url += `&created_by=${userId}`;
            }
            if (data.today && data?.card_lead_status) {
                url += `&today=${encodeURIComponent(data.today)}&opportunity_status=${encodeURIComponent(data.opporunity_status)}`;
            } else if (data.month && data?.card_lead_status) {
                url += `&month=${encodeURIComponent(data.month)}&opportunity_status=${encodeURIComponent(data.opporunity_status)}`;
            }

            if (data.opportunity_status) {
                url += `&opportunity_status=${encodeURIComponent(data.opportunity_status)}`;
            }
            instance()
                .get(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    dashboardLead: (data: any, page: any, userId :any = null) => {

        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/?page=${page}&page_size=10`;
            
            url += `&display_date_source=${encodeURIComponent(true)}`;

            if (data.userid){
                 url += `&user_id=${encodeURIComponent(data.userid)}`;
            }

            if (!userId && data.team) {
                if (data.team) {
                    url += `&team=${encodeURIComponent(data.team)}`;
                }
            }

            if (data.search) {
                url += `&search=${encodeURIComponent(data.search)}`;
            }
            if (data.lead_source) {
                url += `&lead_source=${encodeURIComponent(data.lead_source)}`;
            }
            if (data.opportunity) {
                url += `&name=${encodeURIComponent(data.opportunity)}`;
            }

            if (data.status) {
                url += `&opportunity_status=${encodeURIComponent(data.status)}`;
            }
            if (data.from_date) {
                url += `&from_date=${encodeURIComponent(data.from_date)}`;
            }
            if (data.end_date) {
                url += `&to_date=${encodeURIComponent(data.end_date)}`;
            }
            if (data.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(data.assigned_to)}`;
            }
            else if (data.bde) {
                url += `&bde=${encodeURIComponent(data.bde)}`;
            } else if (data.dm) {
                url += `&created_by=${encodeURIComponent(data.dm)}`;
            } else if (data.tm) {
                url += `&created_by=${encodeURIComponent(data.tm)}`;
            } else if (data.bdm) {
                url += `&bdm=${encodeURIComponent(data.bdm)}`;
            }
            else if (userId) {
                url += `&created_by=${userId}`;
            }

            if (data.today && data?.card_lead_status) {
                url += `&today=${encodeURIComponent(data.today)}&opportunity_status=${encodeURIComponent(data.opporunity_status)}`;
            } else if (data.month && data?.card_lead_status) {
                url += `&month=${encodeURIComponent(data.month)}&opportunity_status=${encodeURIComponent(data.opporunity_status)}`;
            }

            if (data.opportunity_status) {
                url += `&opportunity_status=${encodeURIComponent(data.opportunity_status)}`;
            }
            instance()
                .get(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    filter: (data: any, page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunities/?page=${page}&page_size=10`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    create: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/`;
            instance()
                .post(url, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Explicitly setting Content-Type for multipart form data
                    },
                })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    createNote: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/add_note/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    updateNote: (data: any, noteId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `notes/${noteId}/`;
            instance()
                .put(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    getProbabilityPercentage: (stageId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `stage/${stageId}/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    notesListById: (opportunityId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/${opportunityId}/notes/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    stageHistoryList: (opportunityId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/stage_history/${opportunityId}/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    update: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/${id}/`;

            instance()
                .patch(url, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Explicitly setting Content-Type for multipart form data
                    },
                })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    delete: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `lead/delete/${id}/`;

            instance()
                .put(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    details: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity/${id}/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    dropdowns: (type) => {
        let promise = new Promise((resolve, reject) => {
            let url = `dropdown/?type=${type}`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    oppDropdowns: (type) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/drop-down/?type=${type}`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    stateList: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `dropdown/state/${id}/?type=state`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    uploadFile: (file: any) => {
        let promise = new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            let url = '/hdd/upload_file';
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data; charset=utf-8;',
                },
            };
            instance()
                .post(url, formData, config)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },
};

export default opportunity;
