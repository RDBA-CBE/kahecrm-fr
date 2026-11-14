import instance from '@/utils/axios.utils';
import initialTelecallerData from '@/data/telecallerSampleData.json';
import initialCounsellorData from '@/data/counsellorSampleData.json';
import initialAdmissionsData from '@/data/admissionsSampleData.json';

// In-memory persistent store for telecaller desk operations
const telecallerStore = {
    telecaller: { ...initialTelecallerData.telecaller },
    today_queue: [...(initialTelecallerData.today_queue || [])],
    my_contacts: [...(initialTelecallerData.my_contacts || [])],
    follow_ups: [...(initialTelecallerData.follow_ups || [])],
};

// In-memory persistent store for counsellor desk operations
const counsellorStore: any = {
    counsellor: { ...initialCounsellorData.counsellor },
    urgent_referrals: [...(initialCounsellorData.urgent_referrals || [])],
    scheduled_campus_visits: [...(initialCounsellorData.scheduled_campus_visits || [])],
    queue_items: [...(initialCounsellorData.queue_items || [])],
    analytics: { ...initialCounsellorData.analytics },
    students: [...(initialAdmissionsData || [])],
};

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
            if(body.ordering){
                url += `&ordering=${encodeURIComponent(body.ordering)}`;
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

    archive_list: (page, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contacts/?is_archive=true&page=${page}&page_size=10&achieved=True`;
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
            if(body.ordering){
                url += `&ordering=${encodeURIComponent(body.ordering)}`;
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

    // =========================================================================
    // TELECALLER DESK APIS (With live in-memory persistent store & param filtering)
    // =========================================================================
    telecaller: {
        dashboard: (params: any = {}) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let items = [...telecallerStore.today_queue];

                    // Search query
                    if (params?.search && String(params.search).trim()) {
                        const q = String(params.search).toLowerCase().trim();
                        items = items.filter((item) =>
                            [item.student_name, item.enquiry_id, item.phone, item.city, item.course_interest, item.next_action]
                                .filter(Boolean)
                                .some((val) => String(val).toLowerCase().includes(q))
                        );
                    }

                    // Tab filter ('all', 'overdue', 'today', 'retry', 'new')
                    const counts = {
                        all: telecallerStore.today_queue.length,
                        overdue: telecallerStore.today_queue.filter((i) => i.priority_type === 'overdue').length,
                        today: telecallerStore.today_queue.filter((i) => i.priority_type === 'today').length,
                        retry: telecallerStore.today_queue.filter((i) => i.priority_type === 'retry').length,
                        new: telecallerStore.today_queue.filter((i) => i.priority_type === 'new').length,
                    };

                    if (params?.tab && params.tab !== 'all' && params.tab !== 'All') {
                        const targetTab = String(params.tab).toLowerCase();
                        items = items.filter((item) => String(item.priority_type).toLowerCase() === targetTab);
                    }

                    const page = Number(params?.page) || 1;
                    const pageSize = Number(params?.page_size) || 5;
                    const startIndex = (page - 1) * pageSize;
                    const paginated = items.slice(startIndex, startIndex + pageSize);

                    resolve({
                        stats: {
                            due_today: counts.today,
                            overdue: counts.overdue,
                            retry_queue: counts.retry,
                            new_calls: counts.new,
                            my_contacts_count: telecallerStore.my_contacts.length,
                            follow_ups_count: telecallerStore.follow_ups.length,
                        },
                        counts,
                        data: paginated,
                        total_records: items.length,
                        page,
                        page_size: pageSize,
                    });
                }, 150);
            });
        },

        contacts: (params: any = {}) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let items = [...telecallerStore.my_contacts];

                    // Search query
                    if (params?.search && String(params.search).trim()) {
                        const q = String(params.search).toLowerCase().trim();
                        items = items.filter((item) =>
                            [item.student_name, item.enquiry_id, item.mobile, item.city, item.course_interest, item.stage]
                                .filter(Boolean)
                                .some((val) => String(val).toLowerCase().includes(q))
                        );
                    }

                    // Tab filter ('all', 'new', 'follow_ups', 'retry', 'closed')
                    const counts = {
                        all: telecallerStore.my_contacts.length,
                        new: telecallerStore.my_contacts.filter((i) => i.category === 'new').length,
                        follow_ups: telecallerStore.my_contacts.filter(
                            (i) => i.category === 'follow-ups' || i.category === 'follow_ups'
                        ).length,
                        retry: telecallerStore.my_contacts.filter((i) => i.category === 'retry').length,
                        closed: telecallerStore.my_contacts.filter((i) => i.category === 'closed').length,
                    };

                    if (params?.tab && params.tab !== 'all' && params.tab !== 'All') {
                        const targetTab = String(params.tab).toLowerCase().replace('_', '-');
                        items = items.filter((item) => {
                            const cat = String(item.category || '').toLowerCase().replace('_', '-');
                            return cat === targetTab;
                        });
                    }

                    const page = Number(params?.page) || 1;
                    const pageSize = Number(params?.page_size) || 5;
                    const startIndex = (page - 1) * pageSize;
                    const paginated = items.slice(startIndex, startIndex + pageSize);

                    resolve({
                        counts,
                        data: paginated,
                        total_records: items.length,
                        page,
                        page_size: pageSize,
                    });
                }, 150);
            });
        },

        followups: (params: any = {}) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let items = [...telecallerStore.follow_ups];

                    // Search query
                    if (params?.search && String(params.search).trim()) {
                        const q = String(params.search).toLowerCase().trim();
                        items = items.filter((item) =>
                            [item.student_name, item.enquiry_id, item.contact_number, item.city, item.last_call_notes]
                                .filter(Boolean)
                                .some((val) => String(val).toLowerCase().includes(q))
                        );
                    }

                    // Tab filter ('today', 'upcoming', 'overdue')
                    const counts = {
                        today: telecallerStore.follow_ups.filter((i) => i.status === 'today').length,
                        upcoming: telecallerStore.follow_ups.filter((i) => i.status === 'upcoming').length,
                        overdue: telecallerStore.follow_ups.filter((i) => i.status === 'overdue').length,
                    };

                    if (params?.tab && params.tab !== 'all' && params.tab !== 'All') {
                        const targetTab = String(params.tab).toLowerCase();
                        items = items.filter((item) => String(item.status).toLowerCase() === targetTab);
                    }

                    const page = Number(params?.page) || 1;
                    const pageSize = Number(params?.page_size) || 5;
                    const startIndex = (page - 1) * pageSize;
                    const paginated = items.slice(startIndex, startIndex + pageSize);

                    resolve({
                        counts,
                        data: paginated,
                        total_records: items.length,
                        page,
                        page_size: pageSize,
                    });
                }, 150);
            });
        },

        update_call: (id: string, payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Update in today_queue
                    const queueIdx = telecallerStore.today_queue.findIndex((i) => i.id === id || i.contact_id === id);
                    if (queueIdx !== -1) {
                        telecallerStore.today_queue[queueIdx] = {
                            ...telecallerStore.today_queue[queueIdx],
                            last_outcome: payload.outcome || telecallerStore.today_queue[queueIdx].last_outcome,
                            last_note: payload.notes || telecallerStore.today_queue[queueIdx].last_note,
                            next_action: payload.next_action || telecallerStore.today_queue[queueIdx].next_action,
                            stage: payload.stage || telecallerStore.today_queue[queueIdx].stage,
                        };
                    }

                    // Update in my_contacts
                    const contactIdx = telecallerStore.my_contacts.findIndex((i) => i.id === id || i.enquiry_id === id);
                    if (contactIdx !== -1) {
                        telecallerStore.my_contacts[contactIdx] = {
                            ...telecallerStore.my_contacts[contactIdx],
                            last_outcome: payload.outcome || telecallerStore.my_contacts[contactIdx].last_outcome,
                            stage: payload.stage || telecallerStore.my_contacts[contactIdx].stage,
                            next_action: payload.next_action || telecallerStore.my_contacts[contactIdx].next_action,
                        };
                    }

                    // If scheduled follow-up
                    if (payload.schedule_callback && payload.callback_date) {
                        const existingFlw = telecallerStore.follow_ups.find((f) => f.contact_id === id || f.id === id);
                        if (existingFlw) {
                            existingFlw.scheduled_date = payload.callback_date;
                            existingFlw.scheduled_time = payload.callback_time || '10:00 AM';
                            existingFlw.scheduled_date_time = `${payload.callback_date} @ ${payload.callback_time || '10:00 hrs'}`;
                            existingFlw.last_call_notes = payload.notes || existingFlw.last_call_notes;
                            existingFlw.outcome = payload.outcome || existingFlw.outcome;
                        } else {
                            telecallerStore.follow_ups.push({
                                id: `FLW-${Math.floor(100 + Math.random() * 900)}`,
                                contact_id: id,
                                student_name: payload.student_name || 'Candidate',
                                enquiry_id: id,
                                city: payload.city || 'Coimbatore',
                                contact_number: payload.phone || '+91 98421 98210',
                                last_call_notes: payload.notes || 'Follow-up scheduled.',
                                outcome: payload.outcome || 'Call Later',
                                scheduled_date: payload.callback_date,
                                scheduled_time: payload.callback_time || '10:00 AM',
                                scheduled_date_time: `${payload.callback_date} @ ${payload.callback_time || '10:00 hrs'}`,
                                assigned_telecaller: 'P. Malathi',
                                status: 'today',
                            });
                        }
                    }

                    resolve({ success: true, message: 'Call details updated successfully' });
                }, 150);
            });
        },

        reschedule_call: (id: string, payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const formatted = `${payload.date} @ ${payload.time || '11:00 hrs'}`;

                    // Update in today_queue
                    const queueItem = telecallerStore.today_queue.find((i) => i.id === id || i.contact_id === id);
                    if (queueItem) {
                        queueItem.scheduled_time = formatted;
                        queueItem.scheduled_date = payload.date;
                        if (payload.reason) queueItem.last_note = payload.reason;
                    }

                    // Update in follow_ups
                    const flwItem = telecallerStore.follow_ups.find((i) => i.id === id || i.contact_id === id);
                    if (flwItem) {
                        flwItem.scheduled_date_time = formatted;
                        flwItem.scheduled_date = payload.date;
                        flwItem.scheduled_time = payload.time || '11:00 AM';
                        if (payload.reason) flwItem.last_call_notes = payload.reason;
                    }

                    resolve({ success: true, message: 'Callback rescheduled successfully' });
                }, 150);
            });
        },

        add_contact: (payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const randomNum = Math.floor(100 + Math.random() * 900);
                    const newId = `ENQ-2026-0${randomNum}`;
                    const newContact = {
                        id: newId,
                        enquiry_id: newId,
                        student_name: payload.student_name,
                        sibling: Boolean(payload.sibling),
                        city: payload.city || 'Coimbatore',
                        mobile: payload.mobile,
                        parent_phone: payload.parent_phone || '-',
                        course_interest: payload.course_interest || 'Computer Science & Engineering',
                        institution: payload.institution || 'KAHE',
                        stage: payload.stage || 'Contacted',
                        last_outcome: payload.last_outcome || 'No outcome',
                        next_action: payload.next_action || 'Initial reachout scheduled',
                        scheduled_time: payload.scheduled_time || 'Today @ 10:00 AM',
                        date_of_birth: payload.date_of_birth || '2008-01-01',
                        father_name: payload.father_name || '',
                        mother_name: payload.mother_name || '',
                        category: 'new',
                    };

                    telecallerStore.my_contacts.unshift(newContact);
                    resolve({ success: true, data: newContact, message: 'Contact added successfully' });
                }, 150);
            });
        },

        complete_callback: (id: string) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const idx = telecallerStore.follow_ups.findIndex((i) => i.id === id || i.contact_id === id);
                    if (idx !== -1) {
                        telecallerStore.follow_ups.splice(idx, 1);
                    }
                    resolve({ success: true, message: 'Callback marked as completed' });
                }, 150);
            });
        },

        transfer_callback: (id: string, payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const flw = telecallerStore.follow_ups.find((i) => i.id === id || i.contact_id === id);
                    if (flw) {
                        flw.assigned_telecaller = payload.assigned_to || 'S. Saravanan (Senior Counsellor)';
                    }
                    resolve({ success: true, message: 'Callback transferred successfully' });
                }, 150);
            });
        },

        get_contact_detail: (id: string) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const found =
                        telecallerStore.today_queue.find((i) => i.id === id || i.contact_id === id) ||
                        telecallerStore.my_contacts.find((i) => i.id === id || i.enquiry_id === id) ||
                        telecallerStore.follow_ups.find((i) => i.id === id || i.contact_id === id);

                    resolve({ success: true, data: found || null });
                }, 100);
            });
        },
    },

    counsellor: {
        dashboard: (body: any = null) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Sync dynamic counts
                    const pendingCount = counsellorStore.queue_items.filter((q) => q.tab === 'pending').length;
                    const inProgressCount = counsellorStore.queue_items.filter((q) => q.tab === 'in_progress').length;
                    const visitsCount = counsellorStore.scheduled_campus_visits.length;
                    const interestedCount = counsellorStore.queue_items.filter((q) => q.current_stage === 'Applied' || q.current_stage === 'Admitted').length + 14;

                    const updatedCounsellor = {
                        ...counsellorStore.counsellor,
                        stats: {
                            referred_students: pendingCount + inProgressCount,
                            pending_counselling: pendingCount,
                            today_appointments: visitsCount,
                            interested_students: interestedCount,
                        },
                    };

                    resolve({
                        success: true,
                        counsellor: updatedCounsellor,
                        urgent_referrals: [...counsellorStore.urgent_referrals],
                        scheduled_campus_visits: [...counsellorStore.scheduled_campus_visits],
                    });
                }, 100);
            });
        },

        queue: (body: any = null) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let items = [...counsellorStore.queue_items];

                    // Filter by tab if specified
                    if (body?.tab && body.tab !== 'all') {
                        items = items.filter((item) => item.tab === body.tab);
                    }

                    // Filter by search
                    if (body?.search) {
                        const q = body.search.toLowerCase().trim();
                        items = items.filter(
                            (item) =>
                                item.student_name?.toLowerCase().includes(q) ||
                                item.enquiry_id?.toLowerCase().includes(q) ||
                                item.mobile?.includes(q) ||
                                item.city?.toLowerCase().includes(q) ||
                                item.target_programme?.toLowerCase().includes(q)
                        );
                    }

                    // Filter by priority
                    if (body?.priority && body.priority !== 'all') {
                        items = items.filter((item) => item.priority?.toLowerCase() === body.priority.toLowerCase());
                    }

                    const pendingCount = counsellorStore.queue_items.filter((q) => q.tab === 'pending').length;
                    const inProgressCount = counsellorStore.queue_items.filter((q) => q.tab === 'in_progress').length;
                    const completedCount = counsellorStore.queue_items.filter((q) => q.tab === 'completed').length;
                    const directCount = counsellorStore.queue_items.filter((q) => q.tab === 'direct').length;

                    const page = body?.page ? parseInt(body.page) : 1;
                    const pageSize = body?.page_size ? parseInt(body.page_size) : 10;
                    const total = items.length;
                    const totalPages = Math.ceil(total / pageSize) || 1;
                    const startIndex = (page - 1) * pageSize;
                    const paginated = items.slice(startIndex, startIndex + pageSize);

                    resolve({
                        success: true,
                        results: paginated,
                        total,
                        page,
                        page_size: pageSize,
                        total_pages: totalPages,
                        counts: {
                            pending: pendingCount,
                            in_progress: inProgressCount,
                            completed: completedCount,
                            direct: directCount,
                        },
                    });
                }, 120);
            });
        },

        update_session: (id: string, payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const item = counsellorStore.queue_items.find(
                        (q) => q.id === id || q.enquiry_id === id
                    );

                    if (item) {
                        if (payload.session_outcome) item.session_outcome = payload.session_outcome;
                        if (payload.stage) item.current_stage = payload.stage;
                        if (payload.notes) item.notes = payload.notes;

                        // Transition tab and status based on outcome / stage
                        if (payload.stage === 'Admitted' || payload.session_outcome === 'Spot Provisional Admission Offered') {
                            item.status = 'Completed';
                            item.tab = 'completed';
                        } else if (payload.stage === 'Applied' || payload.session_outcome === 'Campus Visit Scheduled') {
                            item.status = 'In Progress';
                            item.tab = 'in_progress';
                        } else if (payload.stage === 'Not Interested' || payload.session_outcome === 'Declined / Enrolled Elsewhere') {
                            item.status = 'Completed';
                            item.tab = 'completed';
                        }

                        // Also update urgent_referrals if it exists there
                        const urgentItem = counsellorStore.urgent_referrals.find(
                            (u) => u.id === id || u.student_id === id || u.student_name === item.student_name
                        );
                        if (urgentItem && (item.status === 'Completed' || item.status === 'In Progress')) {
                            // If completed, optionally update notes
                            urgentItem.notes = payload.notes || urgentItem.notes;
                        }
                    }

                    resolve({
                        success: true,
                        data: item,
                        message: 'Counselling session finalized successfully',
                    });
                }, 150);
            });
        },

        schedule_followup: (id: string, payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const student: any =
                        counsellorStore.queue_items.find((q: any) => q.id === id || q.enquiry_id === id) ||
                        counsellorStore.urgent_referrals.find((u: any) => u.id === id || u.student_id === id);

                    const studentName = student?.student_name || payload.student_name || 'Student';
                    const targetCourse = student?.target_programme || student?.target_course || 'Academic Course (KAHE)';

                    const newVisit = {
                        id: `VISIT-${Math.floor(100 + Math.random() * 900)}`,
                        student_id: student?.enquiry_id || student?.student_id || id,
                        student_name: studentName,
                        preferred_course: `${targetCourse} (KAHE)`,
                        visit_date: payload.followup_date || '2026-05-12',
                        visit_time: payload.followup_time || '11:00 AM',
                        location: payload.location || 'Admin Block, Eachanari',
                        status: 'Confirmed',
                        notes: payload.agenda_notes || '',
                    };

                    counsellorStore.scheduled_campus_visits.unshift(newVisit);

                    resolve({
                        success: true,
                        data: newVisit,
                        message: 'Consultation follow-up confirmed successfully',
                    });
                }, 150);
            });
        },

        request_assignment: (id: string, payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const item: any = counsellorStore.queue_items.find((q: any) => q.id === id || q.enquiry_id === id);
                    if (item) {
                        item.assignment_requested = true;
                        item.assignment_reason = payload.reason;
                        item.preferred_telecaller = payload.telecaller || 'P. Malathi';
                    }

                    resolve({
                        success: true,
                        message: 'Request submitted to central Admin queue for telecaller assignment',
                    });
                }, 150);
            });
        },

        add_contact: (payload: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const randomNum = Math.floor(100 + Math.random() * 900);
                    const newId = `ENQ-2026-0${randomNum}`;

                    const newEntry = {
                        id: `CQ-${randomNum}`,
                        enquiry_id: newId,
                        student_name: payload.student_name,
                        mobile: payload.mobile,
                        city: payload.city || 'Coimbatore',
                        qualification: payload.qualification || '12th Standard',
                        target_programme: payload.target_programme || 'Computer Science & Engineering',
                        institution: payload.institution || 'KAHE',
                        referred_by: 'Direct Walk-in',
                        referred_by_role: 'Direct Campus Enquiry',
                        referral_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                        referral_reason: payload.notes || 'Direct enquiry at counselling desk',
                        priority: payload.priority || 'Normal',
                        status: 'Pending',
                        tab: 'direct',
                        marks: payload.marks || 'Awaiting Results',
                        campus: 'KAHE - Main Campus, Eachanari',
                        current_stage: 'Counselling',
                        notes: payload.notes || '',
                        session_outcome: null,
                    };

                    counsellorStore.queue_items.unshift(newEntry);

                    resolve({
                        success: true,
                        data: newEntry,
                        message: 'Contact added directly to counselling queue',
                    });
                }, 150);
            });
        },

        student_profiles: (body: any = null) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let list = [...counsellorStore.students];

                    if (body?.search) {
                        const q = body.search.toLowerCase().trim();
                        list = list.filter(
                            (s: any) =>
                                s.student_name?.toLowerCase().includes(q) ||
                                s.enquiry_id?.toLowerCase().includes(q) ||
                                s.phone_number?.includes(q) ||
                                s.student_mobile?.includes(q) ||
                                s.city?.toLowerCase().includes(q) ||
                                s.target_course?.toLowerCase().includes(q) ||
                                s.course_interest?.toLowerCase().includes(q)
                        );
                    }

                    if (body?.city && body.city !== 'all') {
                        list = list.filter((s: any) => s.city?.toLowerCase() === body.city.toLowerCase());
                    }

                    if (body?.qualification && body.qualification !== 'all') {
                        list = list.filter((s: any) => (s.qualification || s.education_qualification)?.toLowerCase() === body.qualification.toLowerCase());
                    }

                    if (body?.telecaller && body.telecaller !== 'all') {
                        list = list.filter((s: any) => (s.assigned_to || s.assigned_staff)?.toLowerCase() === body.telecaller.toLowerCase());
                    }

                    if (body?.stage && body.stage !== 'all') {
                        list = list.filter((s: any) => (s.status || s.admission_stage)?.toLowerCase() === body.stage.toLowerCase());
                    }

                    const page = body?.page ? parseInt(body.page) : 1;
                    const pageSize = body?.page_size ? parseInt(body.page_size) : 10;
                    const total = list.length;
                    const totalPages = Math.ceil(total / pageSize) || 1;
                    const startIndex = (page - 1) * pageSize;
                    const paginated = list.slice(startIndex, startIndex + pageSize);

                    resolve({
                        success: true,
                        results: paginated,
                        total,
                        page,
                        page_size: pageSize,
                        total_pages: totalPages,
                    });
                }, 120);
            });
        },

        analytics: (body: any = null) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        analytics: counsellorStore.analytics,
                        stats: counsellorStore.counsellor.stats,
                    });
                }, 100);
            });
        },
    },
};

export default contact;
