import instance from '@/utils/axios.utils';

const contact = {
    list: (page, body = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contacts/?page=${page}&page_size=10&get_has_lead=false&achieved=False`;

              if (body?.userId) {
                url += `&user_id=${encodeURIComponent(body?.userId)}`;
            }

               if (body?.team == 'Yes') {
                url += `&teams=${encodeURIComponent(true)}`;
            }

            if (body?.search) {
                url += `&search=${encodeURIComponent(body?.search)}`;
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
            let url = `crm/contacts/?page=${page}&page_size=10&get_has_lead=false`;

             if (body?.userId) {
                url += `&user_id=${encodeURIComponent(body?.userId)}`;
            }

            if (body?.search) {
                url += `&search=${encodeURIComponent(body?.search)}`;
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
            let url = `crm/contacts/?is_archive=true&page=${page}&page_size=10&achieved=True`;
         

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
            let url = `crm/contacts/?page=${page}&page_size=10&achieved=true`;

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
            let url = `crm/contact_statuses/?is_active=true`;
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
            let url = `crm/contacts/${contactId}/`;
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
            let url = `crm/contacts/?lead=${leadId}`;
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
            let url = `crm/contacts/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                        reject(error.response.data);
                   
                });
        });
        return promise;
    },

    update: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contacts/${id}/`;

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
            let url = `crm/import_contacts/`;
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
            let url = `crm/contacts/${id}/`;

            instance()
                .delete(url)
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
