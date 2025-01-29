"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Option {
  value: string;
  label: string;
  [key: string]: string;
}

interface SearchableSelectProps {
  options: Option[];
  name?: string;
  value: string;
  onChange: (value: Option |  string) => void;
  onAddOption?: (option: Option) => void;
  onDeleteOption?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  optionLabelKey?: keyof Option;
  optionValueKey?: keyof Option;
}

export function SearchableSelect({
  options,
  name,
  value,
  onChange,
  onAddOption,
  onDeleteOption,
  placeholder = "Select an option...",
  emptyMessage = "No option found.",
  loading = false,
  disabled = false,
  optionLabelKey = "label",
  optionValueKey = "value",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [newOption, setNewOption] = React.useState<Option>({ value: "", label: "" });

  const handleAddOption = () => {
    if (newOption.value && newOption.label && onAddOption) {
      onAddOption(newOption);
      setNewOption({ value: "", label: "" });
      setAddDialogOpen(false);
    }
  };

  const handleDeleteOption = () => {
    if (value && onDeleteOption) {
      onDeleteOption(value);
      onChange("");
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value ? options.find((option) => option?.[optionValueKey] === value)?.[optionLabelKey] : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {loading ? (
                  <CommandItem disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </CommandItem>
                ) : (
                  options.map((option) => (
                    <CommandItem
                      key={option?.[optionValueKey]}
                      value={option?.[optionValueKey]}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : option);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", value === option?.[optionValueKey] ? "opacity-100" : "opacity-0")}
                      />
                      {option?.[optionLabelKey]}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
            {onAddOption && (
              <CommandGroup>
                <CommandItem onSelect={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add new option
                </CommandItem>
              </CommandGroup>
            )}
            {onDeleteOption && (
              <CommandGroup>
                <CommandItem onSelect={() => setDeleteDialogOpen(true)} disabled={!value}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete selected option
                </CommandItem>
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {onAddOption && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Option</DialogTitle>
              <DialogDescription>Enter the details for the new option.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    name={name}
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <div className="col-span-3">
                  <Input
                    id="value"
                    name={name}
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddOption}>
                Add Option
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {onDeleteOption && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Option</DialogTitle>
              <DialogDescription>Are you sure you want to delete the selected option?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteOption}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
