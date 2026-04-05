import type { Metadata } from 'next';
// import './globals.css';
export const metadata: Metadata = {
    title: 'Graduation Project - Student Affairs',
    description: 'Student Affairs Section of the Graduation Project',
}; 

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
                <div>
                    {children}
                </div>
    );
}
