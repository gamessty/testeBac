import { useRouter } from 'next/router';

export default function Page() {
    const router = useRouter();
    const { tab } = router.query;
    return (
        <div>
            <h1>Page {tab}</h1>
        </div>
    );
}