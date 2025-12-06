import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { translations } from '@/lib/i18n/context'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh_CN', label: '简体中文' },
  { code: 'zh_HK', label: '繁體中文' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const

interface LanguageSelectorProps {
  value: keyof typeof translations
  onChange: (value: keyof typeof translations) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="relative w-32">
      <Listbox value={value} onChange={onChange}>
        <ListboxButton className="relative w-full px-3 py-1.5 text-left border rounded-md bg-white dark:bg-gray-800 cursor-pointer text-sm">
          <span className="block truncate">
            {languages.find(lang => lang.code === value)?.label}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            <ChevronUpDownIcon
              className="h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <ListboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
          {languages.map((lang) => (
            <ListboxOption
              key={lang.code}
              value={lang.code}
              className={({ active, selected }) =>
                `relative cursor-pointer select-none py-1.5 px-3 ${active ? 'bg-primary/10 dark:bg-primary/20' : ''
                } ${selected ? 'bg-primary/20' : ''}`
              }
            >
              {({ selected }) => (
                <div className="flex items-center">
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {lang.label}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <CheckIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </span>
                  )}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  )
} 