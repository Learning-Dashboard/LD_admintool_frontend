import React, { useMemo } from "react";


export function useCategorySelectOptions(allCategories) {
  return useMemo(() => {
    const seenPatterns = new Set();
    const seenNames = new Set();
    const opts = [];
    for (const cat of allCategories) {
      if (cat.patternGroup) {
        if (!seenPatterns.has(cat.patternGroup)) {
          seenPatterns.add(cat.patternGroup);
          const namePart = cat.name.replace(/^\d+\s/, "");
          opts.push({
            displayName: `n ${namePart}`,
            value: JSON.stringify({ patternGroup: cat.patternGroup })
          });
        }
      } else {
        if (!seenNames.has(cat.name)) {
          seenNames.add(cat.name);
          opts.push({
            displayName: cat.name,
            value: JSON.stringify({ name: cat.name })
          });
        }
      }
    }
    return opts;
  }, [allCategories]);
}

function CategorySelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}>
      <option value="" disabled>-- Selecciona --</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.displayName}</option>
      ))}
    </select>
  );
}

export default CategorySelect;
