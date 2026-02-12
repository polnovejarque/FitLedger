

export const Logo = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <img
                src="/fitleader-logo.png"
                alt="FitLeader Logo"
                className="h-10 w-auto object-contain"
            />
        </div>
    );
};
