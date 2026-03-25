import { type FC } from 'react';

interface InputProps {
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const InputBox: FC<InputProps> = ({ placeholder, value, onChange, className }) => {
    return (
        <input
            className={`w-full px-5 py-4 bg-neutral-800/50 border border-neutral-700/50 rounded-lg outline-none ring-1 ring-transparent focus:border-[#BF0D3E]/50 focus:ring-[#BF0D3E]/30 text-white placeholder-neutral-500 transition-all duration-200 text-lg ${className ?? ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default InputBox;
