// src/components/FilterGender.tsx
import { GenderOption } from "@/types";

interface FilterGenderProps {
  selectedGender: string | null;
  setSelectedGender: (value: string) => void;
}

const genderOptions: GenderOption[] = [
  { value: "unisex", label: "Unisex" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
];

export default function FilterGender({ selectedGender, setSelectedGender }: FilterGenderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Giới tính</h3>
      <div className="flex flex-col gap-2 mt-2">
        {genderOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="gender"
              value={option.value}
              checked={selectedGender === option.value}
              onChange={() => setSelectedGender(option.value)}
              className="h-4 w-4 accent-black focus:ring-black"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}