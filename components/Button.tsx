import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "px-8 py-4 rounded-none font-sans text-lg tracking-wide transition-all duration-300 ease-in-out flex items-center justify-center gap-2 min-w-[200px]";
  
  const variants = {
    primary: "bg-lumar-green text-white hover:bg-[#6d9660] shadow-lg active:transform active:scale-95",
    outline: "border-2 border-lumar-dark text-lumar-dark hover:bg-lumar-dark hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg active:transform active:scale-95"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Laden...
        </>
      ) : children}
    </button>
  );
};