import type { Metadata } from 'next';
// import './globals.css';
import { HeaderNavigation } from '@/components/layout/HeaderNavStudents';
import { StudentProvider } from '@/hooks/useStudentContext';
import {AcademicProvider} from '@/hooks/useAcademicContext';
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
        <StudentProvider>
                <AcademicProvider>
            <div>
                {children}
            </div>
            </AcademicProvider>
        </StudentProvider>
    );
}
