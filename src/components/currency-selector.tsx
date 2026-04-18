"use client";

import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CURRENCIES, Currency } from "@/lib/currencies";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onValueChange,
  placeholder = "Select currency...",
  className,
  disabled,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCurrency = CURRENCIES.find((currency) => currency.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-10 px-3", className)} 
          disabled={disabled}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedCurrency ? (
              <>
                {selectedCurrency.countryCode !== "EU" ? (
                  <ReactCountryFlag 
                    countryCode={selectedCurrency.countryCode} 
                    svg 
                    style={{ width: '18px', height: '13px', flexShrink: 0 }}
                    title={selectedCurrency.country}
                  />
                ) : (
                  <div className="w-[18px] h-[13px] bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">€</span>
                  </div>
                )}
                <span className="font-medium text-sm truncate">{selectedCurrency.code}</span>
                <span className="text-gray-500 text-sm truncate hidden sm:inline">
                  ({selectedCurrency.symbol})
                </span>
              </>
            ) : (
              <span className="text-gray-500 text-sm truncate">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0" 
        align="start"
        sideOffset={5}
      >
        <Command>
          <CommandInput placeholder="Search currency..." className="h-10" />
          <CommandList className="max-h-[250px] overflow-y-auto custom-scrollbar">
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup className="overflow-y-auto">
              {CURRENCIES.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name} ${currency.country} ${currency.symbol}`}
                  onSelect={() => {
                    onValueChange(currency.code);
                    setOpen(false);
                  }}
                  className="py-2" 
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      {currency.countryCode !== "EU" ? (
                        <ReactCountryFlag 
                          countryCode={currency.countryCode} 
                          svg 
                          style={{ width: '18px', height: '13px', flexShrink: 0 }}
                          className="flex-shrink-0"
                        />
                      ) : (
                        <div className="w-[18px] h-[13px] bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">€</span>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{currency.code}</span>
                          <span className="text-sm text-gray-600 truncate">{currency.symbol}</span>
                        </div>
                        <span className="text-xs text-gray-500 truncate">
                          {currency.name}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0 ml-2",
                        value === currency.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}