import instance from '@/utils/axios.utils';

const lead = {
    list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead/?page=${page}&page_size=10`;
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

    logList: (leadId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log/?include_opportunity=${leadId}`;
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

    excludeOpplogList: (leadId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log/?lead=${leadId}`;
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

    logOppoList: (leadId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log/?opportunity=${leadId}`;
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

    logFilterList: (leadId, logStatus) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log/?include_opportunity=${leadId}&log_type=${logStatus}`;
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

    opplogFilterList: (oppId, logStatus) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log/?opportunity=${oppId}&log_type=${logStatus}`;
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

    leadStageList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `/leads/stages/?is_active=true`;
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
    stageList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log-stage/?is_active=true`;
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

    oppStageList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/stages/`;
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

    filter: (body: any, page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead/?page=${page}&page_size=10`;

            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body.lead_source) {
                url += `&lead_source=${encodeURIComponent(body.lead_source)}`;
            }
            if (body.opportunity) {
                url += `&opportunity=${encodeURIComponent(body.opportunity)}`;
            }
            if (body.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            }
            if (body.status) {
                url += `&lead_status=${encodeURIComponent(body.status)}`;
            }
            if (body.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }
            if (body.end_date) {
                url += `&to_date=${encodeURIComponent(body.end_date)}`;
            }

            if (body.bdm) {
                url += `&bdm=${encodeURIComponent(body.bdm)}`;
            }
            if (body.bde) {
                url += `&bde=${encodeURIComponent(body.bde)}`;
            }
            if (body.dm) {
                url += `&created_by=${encodeURIComponent(body.dm)}`;
            }
            if (body.tm) {
                url += `&created_by=${encodeURIComponent(body.tm)}`;
            }
            if (body.filterCard1) {
            }
            if (body.filterCard2) {
            }
            instance()
                .get(url, body)
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
            let url = `leads/lead/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response.data.name) {
                        reject(error.response.data.name[0]);
                    } else if (error.response) {
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
            let url = `leads/lead/${id}/`;

            instance()
                .patch(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response.data.name) {
                        reject(error.response.data.name[0]);
                    } else if (error.response) {
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
            let url = `leads/lead/${id}/`;
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

    leadAssign: (leadId: any, data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `lead/${leadId}/assign/`;
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

    verticalList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/verticals/?is_active=true`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data.results);
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

    bdmAndBDE: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users_for_lead/`;
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

    ownerList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/get_owner_user/`;
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

    bdmList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/get_lead_owner/`;
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

    bdeList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/get_bde_user/`;
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

    departmentList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/departments/?is_active=true`;
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

    leadManager: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/get_lead_owner/`;
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

    bdmBasedBde: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `/leads/bdm_bde_team/?bdm_user=${id}`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response?.data?.message) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    dmList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `/leads/get_dm_user/`;
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

    leadCount: (body: any, userId = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_status_count?page=${1}`;

            if (!userId && body.team) {
                if (body.team) {
                    url += `&team=${encodeURIComponent(body.team)}`;
                }
            }

            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body.lead_source) {
                url += `&lead_source=${encodeURIComponent(body.lead_source)}`;
            }
            if (body.opportunity) {
                url += `&name=${encodeURIComponent(body.opportunity)}`;
            }
            if (body.status) {
                url += `&opportunity_status=${encodeURIComponent(body.status)}`;
            }
            if (body.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }
            if (body.end_date) {
                url += `&to_date=${encodeURIComponent(body.end_date)}`;
            }

            if (body.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            } else if (body.bdm) {
                url += `&created_by=${encodeURIComponent(body.bdm)}`;
            } else if (body.bde) {
                url += `&created_by=${encodeURIComponent(body.bde)}`;
            } else if (body.dm) {
                url += `&created_by=${encodeURIComponent(body.dm)}`;
            } else if (body.tm) {
                url += `&created_by=${encodeURIComponent(body.tm)}`;
            }
            //  else if(userId) {
            //     url += `&created_by=${userId}`;
            // }
            else if (userId || body.assigned_to) {
                if (body.created_by) {
                    url += `&created_by=${encodeURIComponent(body.created_by)}`;
                }
                else{
                    url += `&created_by=${encodeURIComponent(userId)}`;
                }
            }
            // console.log('✌️url --->', url);

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

    assignLeadCount: (body: any, userId = null) => {

        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_status_count?page=${1}`;

            if (!userId && body.team) {
                if (body.team) {
                    url += `&team=${encodeURIComponent(body.team)}`;
                }
            }
            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body.lead_source) {
                url += `&lead_source=${encodeURIComponent(body.lead_source)}`;
            }
            if (body.opportunity) {
                url += `&name=${encodeURIComponent(body.opportunity)}`;
            }
            if (body.status) {
                url += `&opportunity_status=${encodeURIComponent(body.status)}`;
            }
            if (body.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }
            if (body.end_date) {
                url += `&to_date=${encodeURIComponent(body.end_date)}`;
            }
            if (body.assigned_to) {

                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            } else if (body.bdm) {
                url += `&assigned_to=${encodeURIComponent(body.bdm)}`;
            } else if (body.bde) {
                url += `&assigned_to=${encodeURIComponent(body.bde)}`;
            } else if (body.dm) {
                url += `&assigned_to=${encodeURIComponent(body.dm)}`;
            } else if (body.tm) {
                url += `&assigned_to=${encodeURIComponent(body.tm)}`;
            }
            else if (userId){
                url += `&assigned_to=${userId}`;
            }

          
                if (body.assigned_leads == 'Yes') {
                url += `&assigned_leads=${encodeURIComponent(true)}`;
            }
           

            // if (body.assigned_leads == 'Yes') {
            //     url += `&assigned_leads=${encodeURIComponent(true)}`;
            // }

            if (body.today && body?.card_lead_status) {
                url += `&today=${encodeURIComponent(body.today)}`;
            }
            if (body.month && body?.card_lead_status) {
                url += `&month=${encodeURIComponent(body.month)}`;
            }

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

    leadGraph: (from_date, to_date) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/dm_graph_counts?from_date=${from_date}&to_date=${to_date}`;
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

    GetDropdown: (urls: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/${urls}/?is_active=true`;
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

    GetDropdownTwo: (urls: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/${urls}/?is_active=true`;
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

    GetDropdownThree: (urls: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/${urls}/?is_active=true&ordering=country_name`;
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

    sourceList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources/?is_active=true`;
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

    statusList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/?is_active=true`;
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

    opportunityList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `/leads/opportunity/`;
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

    sourceFromList: (sourceId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources_from/?lead_source_id=${sourceId}`;
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

    focusIdBasedVericalList: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/focuse_segmant/?vertical=${id}`;
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

    focusSegmentList: (verticalId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/focuse_segmant/?vertical=${verticalId}&is_active=true`;
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

    stateList: (countryId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/states/?country=${countryId}`;
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

    stateListOne: (countryId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/states/?country=${countryId}&ordering=state_name`;
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

    cityList: (stateId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/City/?state=${stateId}`;
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

    cityListOne: (stateId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/City/?state=${stateId}&ordering=city_name`;
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

export default lead;
