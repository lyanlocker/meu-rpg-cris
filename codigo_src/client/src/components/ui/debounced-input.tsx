import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
  debounce?: number;
  multiline?: boolean;
}

export function DebouncedInput({ 
  value: initialValue, 
  onChange, 
  debounce = 500, 
  multiline = false,
  className,
  ...props 
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value.toString());
      }
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, initialValue, debounce, onChange]);

  if (multiline) {
    return (
      <Textarea
        {...(props as any)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={className}
      />
    );
  }

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}
