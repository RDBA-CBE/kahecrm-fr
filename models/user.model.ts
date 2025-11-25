import instance from '@/utils/axios.utils';

const user = {
    userList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/?page=${page}/`;
            if (body.group) {
                url += `&group=${encodeURIComponent(body.group)}`;
            }

            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
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

    updateUser: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/${id}/`;
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

    addUser: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = 'leads/users/';
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

    getUserId: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/${id}/`;
            instance()
                .post(url)
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

    deleteUser: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/${id}/`;
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

    groupList : () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/groups/`;
           
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
};

export default user;
