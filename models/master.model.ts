import updateLead from '@/pages/updateLead';
import instance from '@/utils/axios.utils';

const master = {
    college_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/colleges?page=${page}&page_size=10`;
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

    create_college: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/colleges/`;
            instance()
                .post(url, body)
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

    update_college: (body, id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/colleges/${id}/`;
            instance()
                .patch(url, body)
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

    delete_college: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/colleges/${id}/`;

            instance()
                .delete(url)
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

    course_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/courses/?page=${page}&page_size=10`;
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

    create_course: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/courses/`;
            instance()
                .post(url, body)
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

    update_course: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/courses/${id}/`;

            instance()
                .patch(url, data)
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

    delete_course: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/courses/${id}/`;
            instance()
                .delete(url)
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

    lead_cat_List: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/lead-source-categories/?page=${page}&page_size=50`;
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

    create_lead_cat: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/lead-source-categories/`;
            instance()
                .post(url, body)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response?.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    update_lead_cat: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/lead-source-categories/${id}/`;

            instance()
                .patch(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data?.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    delete_lead_cat: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/lead-source-categories/${id}/`;
            instance()
                .delete(url)
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

    lead_education_qua: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/qualifications/?page=${page}&page_size=10`;
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

    create_education_qua: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/qualifications/`;
            instance()
                .post(url, body)
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

    update_education_qua: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/qualifications/${id}/`;

            instance()
                .patch(url, data)
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

    delete_education_qua: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `college/qualifications/${id}/`;
            instance()
                .delete(url)
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

    //------- contact status start
    lead_status_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/?is_active=true&page=${page}&page_size=10`;
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

    create_lead_status: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/`;
            instance()
                .post(url, body)
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

    update_lead_status: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/${id}/`;

            instance()
                .patch(url, body)
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

    delete_lead_status: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/${id}/`;
            instance()
                .delete(url)
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

    contact_status_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/?is_active=true&page=${page}&page_size=10`;
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


    create_contact_status: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/`;
            instance()
                .post(url, body)
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

    update_contact_status: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/${id}/`;

            instance()
                .patch(url, body)
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

    delete_contact_status: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/${id}/`;
            instance()
                .delete(url)
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


    //------- contact status start
    getContactStatus: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/?is_active=true&page=${page}&page_size=10`;
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
    createContactStatus: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/`;
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

    updateContactStatus: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/${id}/`;

            instance()
                .patch(url, data)
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

    deleteContactStatus: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/contact_statuses/${id}/`;
            instance()
                .delete(url, { data })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log(error);

                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },
    //------- contact status end

    //------- Opportunity name start
    getOpportunityName: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity-name/?is_active=true&page=${page}&page_size=10`;
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

    createOpportunityName: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity-name/`;
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

    updateOpportunityName: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity-name/${id}/`;

            instance()
                .patch(url, data)
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

    deleteOpportunityName: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/opportunity-name/${id}/`;

            instance()
                .delete(url, { data })
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

    // Opportunity Name End

    //------- lead status start
    getleadStatus: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/?is_active=true&page=${page}&page_size=10`;
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

    createleadStatus: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/`;
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

    updateleadStatus: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/${id}/`;

            instance()
                .patch(url, data)
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

    deleteleadStatus: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_statuses/${id}/`;

            instance()
                .delete(url, { data })
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

    //------- departments start
    getdepartments: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/departments/?is_active=true&page=${page}&page_size=10`;
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
    createdepartments: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/departments/`;
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

    updatedepartments: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/departments/${id}/`;

            instance()
                .patch(url, data)
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

    deletedepartments: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/departments/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- departments end

    //------- Countries start
    getCountries: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/countries/?page=${page}&page_size=10`;
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
    createCountries: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/countries/`;
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

    updateCountries: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/countries/${id}/`;

            instance()
                .patch(url, data)
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

    deleteCountries: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/countries/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- Countries end

    //------- City start
    getCity: (body = null, page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/City/?page=${page}&page_size=10`;
            if (body?.search) {
                url += `&city_name=${encodeURIComponent(body?.search)}`;
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
    createCity: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/City/`;
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

    updateCity: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/City/${id}/`;

            instance()
                .patch(url, data)
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

    deleteCity: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/City/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- City end

    //------- salutations start
    getsalutation: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/salutations/?is_active=true`;
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
    createsalutation: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/salutations/`;
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

    updatesalutation: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/salutations/${id}/`;

            instance()
                .patch(url, data)
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

    deletesalutation: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/salutations/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- salutations end

    //------- lead source start
    getsources: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources/?is_active=true&page=${page}&page_size=10`;
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
    createsources: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources/`;
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

    updatesources: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources/${id}/`;

            instance()
                .patch(url, data)
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

    deletesources: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- lead source end

    //------- lead source from start
    getleadsourcefrom: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources_from/?is_active=true`;
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
    createleadsourcefrom: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources_from/`;
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

    updateleadsourcefrom: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources_from/${id}/`;

            instance()
                .patch(url, data)
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

    deleteleadsourcefrom: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/lead_sources_from/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- lead source from end

    //------- States start
    getStates: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/states/?page=${page}&page_size=10`;
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
    createStates: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/states/`;
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

    updateStates: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/states/${id}/`;

            instance()
                .patch(url, data)
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

    deleteStates: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/states/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- States end

    //------- verticals source from start
    getverticals: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/verticals/?is_active=true&page=${page}&page_size=10`;
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
    createverticals: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/verticals/`;
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

    updateverticals: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/verticals/${id}/`;

            instance()
                .patch(url, data)
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

    deleteverticals: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/verticals/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- verticals source end

    //------- focus segment from start
    getfocusesegment: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/focuse_segmant/?is_active=true&page=${page}&page_size=10`;
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
    createfocussegment: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/focuse_segmant/`;
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

    updatefocussegment: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/focuse_segmant/${id}/`;

            instance()
                .patch(url, data)
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

    deletefocussegment: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/focuse_segmant/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- focus segment end

    //------- marketsegmant from start
    getmarketsegment: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/market_segments/?is_active=true&page=${page}&page_size=10`;
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
    createmarketsegmant: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/market_segments/`;
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

    updatemarketsegmant: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/market_segments/${id}/`;

            instance()
                .patch(url, data)
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

    deletemarketsegmant: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/market_segments/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- marketsegmante end

    //------- tags  start
    gettags: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/tags/?is_active=true&page=${page}&page_size=10`;
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
    createtags: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/tags/`;
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

    updatetags: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/tags/${id}/`;

            instance()
                .patch(url, data)
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

    deletetags: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/tags/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- tags end

    //------- stages  start
    getstages: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/stages/?is_active=true&page=${page}&page_size=10`;
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
    createstages: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/stages/`;
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

    updatestages: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/stages/${id}/`;

            instance()
                .patch(url, data)
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

    deletestages: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/stages/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- stages end

    //------- log stages  start
    getlogstage: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log-stage/?is_active=true&page=${page}&page_size=10`;
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
    createlogstage: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log-stage/`;
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

    updatelogstage: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log-stage/${id}/`;

            instance()
                .patch(url, data)
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

    deletelogstage: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/log-stage/${id}/`;

            instance()
                .delete(url, { data })
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
    //------- log stages end

    //------- BDE  start
    getbdmteam: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/bdm_team/?page=${page}&page_size=10`;
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
    createbdmteam: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/bdm_team/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    updatebdmteam: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/bdm_team/${id}/`;

            instance()
                .patch(url, data)
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

    deletebdmteam: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/bdm_team/${id}/`;

            instance()
                .delete(url, { data })
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

    monthly_target: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/user-targets/`;
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

    target_history: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/monthly-targets/`;

            if (body?.user) {
                url += `?user=${encodeURIComponent(body.user)}`;
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

    create_target: (data) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/user-targets/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    update_target: (data, id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/user-targets/${id}/`;
            instance()
                .patch(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    delete_target: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/user-targets/${id}/`;
            instance()
                .delete(url)
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
    //------- bde end
};
export default master;
