import { ThemeToggle } from "@/components/theme-toggle";
import PlanoraLogo from "@/components/planora-wheel";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return ( 
        <main className="min-h-screen bg-background"> 
            <div className="mx-auto max-w-screen-2xl py-2">
                <nav className="flex justify-between items-center px-2">
                    <PlanoraLogo size={50} handWidth={3} duration="3s" />
                    <div className="w-8">
                        <ThemeToggle />
                    </div>
                    
                </nav>
                <div className="flex flex-col items-center justify-center">
                    {children}
                </div>
            </div>
        </main>
     );
}
 
export default AuthLayout;