"use client";

interface IntensitySliderProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
}

export default function IntensitySlider({
    value,
    onChange,
    label = "Intensity",
}: IntensitySliderProps) {
    return (
        <div className="flex items-center gap-4 w-full max-w-md">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 flex-shrink-0">
                {label}
            </span>
            <div className="flex-1 relative">
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:shadow-primary/30
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
                    }}
                />
            </div>
            <span className="text-xs font-bold text-gray-700 w-8 text-right tabular-nums">
                {value}%
            </span>
        </div>
    );
}
