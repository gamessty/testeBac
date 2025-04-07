export default async function TestPage({
    params
}: Readonly<{ params: Promise<{ id: string }> }>) {
    const { id: testId } = await params;
    return (
        <>
            TBD. THE TEST ID IS: {testId}
        </>
    )
}