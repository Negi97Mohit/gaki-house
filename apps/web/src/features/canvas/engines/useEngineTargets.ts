import { useState, useEffect, useMemo } from 'react';

export const useEngineTargets = (selectedIds: string[]) => {
  const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setTargets([]);
      return;
    }

    const els = selectedIds
      .map(id => document.querySelector(`[data-engine-id="${id}"]`) as HTMLElement | SVGElement)
      .filter((el): el is HTMLElement | SVGElement => el !== null);

    setTargets(els);
  }, [selectedIds]);

  return targets;
};
