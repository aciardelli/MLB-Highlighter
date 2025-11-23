import { type FC } from 'react';

interface InputProps {
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox: FC<InputProps> = ({ placeholder, value, onChange }) => {
    return (
        <input 
            className="w-full px-6 py-4 bg-stone-100 border-2 border-[#BF0D3E] rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#BF0D3E] focus:border-[#BF0D3E] text-stone-900 placeholder-stone-500 transition-all duration-200 text-lg"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default InputBox;
