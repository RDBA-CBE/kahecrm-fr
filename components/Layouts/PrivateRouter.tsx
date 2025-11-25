import CommonLoader from '@/pages/elements/commonLoader';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const PrivateRouter = (WrappedComponent: any) => {
    return (props: any) => {
        const router = useRouter();
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const token = localStorage.getItem('crmToken');

            if (!token) {
                const baseUrl = `${window.location.origin}/auth/signin`;
                router.replace(baseUrl);
            } else {
                setLoading(false);
            }
        }, [router]);

        if (loading) {
            return (
                <div>
                    <CommonLoader />
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
};

export default PrivateRouter;
