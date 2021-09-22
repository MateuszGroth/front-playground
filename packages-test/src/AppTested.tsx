export default function AppTested() {
    return (
        <div className="app">
            <header className="app-header"></header>
            <main className="app-main">
                <TestedButton label="test" />
            </main>
        </div>
    );
}

export const TestedButton = ({ label }: { label: string }) => {
    return <button data-testid="button">{label}</button>;
};
