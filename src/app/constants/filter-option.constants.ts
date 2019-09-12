import { FilterChecklistPage } from '@nte/pages/filter-checklist/filter-checklist';
import { FilterDistancePage } from '@nte/pages/filter-distance/filter-distance';
import { FilterProgramPage } from '@nte/pages/filter-program/filter-program';
import { FilterRangePage } from '@nte/pages/filter-range/filter-range';

export const OPTION_FILTER_TYPES = {
  default: FilterChecklistPage,
  'filter list': FilterChecklistPage,
  location: FilterDistancePage,
  'max-value': FilterRangePage,
  'search box': FilterProgramPage
};
