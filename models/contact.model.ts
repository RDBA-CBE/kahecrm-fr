import instance from '@/utils/axios.utils';

const contact = {
    list: (page, userId = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/contacts/?is_archive=false&page=${page}&page_size=10&lead_is_null=True`;
            if (userId) {
                url += `&created_by=${encodeURIComponent(userId)}`;
            }

            if (!userId) {
                url += `&team=${encodeURIComponent(true)}`;
            }

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

    filter: (page, body, userId = null) => {

        let promise = new Promise((resolve, reject) => {
            let url = `college/contacts/?page=${page}&page_size=10&is_archive=false&lead_is_null=True`;

            if (!userId && body.team) {
                if (body.team) {
                    url += `&team=${encodeURIComponent(body.team)}`;
                }
            }

            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body.status) {
                url += `&status=${encodeURIComponent(body.status)}`;
            }

            if (body.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }
            if (body.to_date) {
                url += `&to_date=${encodeURIComponent(body.to_date)}`;
            }
            if (body.bdm) {
                url += `&created_by=${encodeURIComponent(body.bdm)}`;
            } else if (body.bde) {
                url += `&created_by=${encodeURIComponent(body.bde)}`;
            } else if (body.dm) {
                url += `&created_by=${encodeURIComponent(body.dm)}`;
            } else if (body.tm) {
                url += `&created_by=${encodeURIComponent(body.tm)}`;
            } else if (body.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            } else if (userId) {
                url += `&created_by=${encodeURIComponent(userId)}`;
            }

            if (body.lead_source) {
                url += `&lead_source=${encodeURIComponent(body.lead_source)}`;
            }

            // if (body.status) {
            //     url += `&lead_status=${encodeURIComponent(body.status)}`;
            // }

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

    archive_list: (page, userId = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contacts/?is_archive=true&page=${page}&page_size=10&lead_is_null=True`;
            if (userId) {
                url += `&created_by=${encodeURIComponent(userId)}`;
            }

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

    archive_filter: (page, body, userId = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contacts/?page=${page}&page_size=10&is_archive=true&lead_is_null=True`;

            if (!userId && body.team) {
                if (body.team) {
                    url += `&team=${encodeURIComponent(body.team)}`;
                }
            }

            if (body.name) {
                url += `&name=${encodeURIComponent(body.name)}`;
            }
            if (body.status) {
                url += `&status=${encodeURIComponent(body.status)}`;
            }
            if (body.bdm) {
                url += `&created_by=${encodeURIComponent(body.bdm)}`;
            } else if (body.bde) {
                url += `&created_by=${encodeURIComponent(body.bde)}`;
            } else if (body.dm) {
                url += `&created_by=${encodeURIComponent(body.dm)}`;
            } else if (body.tm) {
                url += `&created_by=${encodeURIComponent(body.tm)}`;
            } else if (body.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            } else if (userId){
                url += `&created_by=${encodeURIComponent(userId)}`;
            }

            if (body.lead_source) {
                url += `&lead_source=${encodeURIComponent(body.lead_source)}`;
            }

            // if (body.status) {
            //     url += `&lead_status=${encodeURIComponent(body.status)}`;
            // }

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

    status: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/?is_active=true`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data?.results);
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

    details: (contactId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contacts/${contactId}`;
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

    listByLeadId: (leadId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contacts/?lead=${leadId}`;
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

    create: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/contacts/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response.data.company_name) {
                        reject(error.response.data.company_name[0]);
                    } else if (error.response.data.email_id) {
                        reject(error.response.data.email_id[0]);
                    } else if (error.response.data.phone_number) {
                        reject(error.response.data.phone_number[0]);
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
            let url = `leads/contacts/${id}/`;

            instance()
                .patch(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response.data.company_name) {
                        reject(error.response.data.company_name[0]);
                    } else if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    import: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/import_contacts/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    // console.log('✌️error --->', error);
                    //                     if (error.response) {
                    //                         reject(error.response.data);
                    //                     } else {
                    reject(error);
                    // }
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

    dropdowns: (type) => {
        let promise = new Promise((resolve, reject) => {
            let url = `contactdropdown/?type=${type}`;
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
};

export default contact;
