import instance from '@/utils/axios.utils';

const auth = {
    login: (data) => {
        let promise = new Promise((resolve, reject) => {
            let url = `accounts/login/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    userDetails: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/auth/user-college-leads/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },


    userById: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/${id}/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    update: (body,id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/${id}/`;
            instance()
                .patch(url,body)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },


    logOut: (data) => {
        let promise = new Promise((resolve, reject) => {
            let url = `logout/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },
};

export default auth;
