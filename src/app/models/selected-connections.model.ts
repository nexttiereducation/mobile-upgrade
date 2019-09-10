import { uniqBy } from 'lodash';

import { ApiProvider } from './../providers/api.provider';

export class SelectedConnections {
  public count = 0;

  // count endpoint working will remove these
  public countManually?: boolean = false;
  public deselected = new Array<number>();
  public filter: string;
  public fromChart: boolean;
  public maxCount?: number;
  public selected = new Array<number>();
  public useDeselected = false;

  constructor(private api: ApiProvider) { }

  public clear(deselectedItems?: any[], retainCountSettings?: boolean) {
    for (let i = 0, deselectee: any; deselectee = deselectedItems[i]; ++i) {
      deselectee.isSelected = false;
    }
    this.useDeselected = false;
    this.selected = [];
    this.deselected = [];
    this.filter = ``;
    this.count = 0;
    if (!retainCountSettings) {
      this.maxCount = null;
      this.countManually = false;
    }
  }

  public findCount(filter: string) {
    this.filter = filter.replace(`?`, ``);
    this.updateSelectedCount();
  }

  public selectAll(filter: string, selectedItems: any[], loadMore?: boolean) {
    this.useDeselected = true;
    if (filter !== null) {
      this.filter = filter.replace(`?`, ``);
    }
    if (!loadMore) {
      this.deselected = [];
      this.updateSelectedCount();
    }
    for (let i = 0, selectee: any; selectee = selectedItems[i]; ++i) {
      selectee.isSelected = true;
      this.selected.push(selectee.object_id || selectee.id);
    }
    this.selected = uniqBy(this.selected, (selectedId) => selectedId);
  }

  public selectionChange(changedItemId: any, _useDeselected?: boolean) {
    const selectedIndex = this.selected.findIndex(c => c === changedItemId);
    const deselectedIndex = this.deselected.findIndex(c => c === changedItemId);
    if (selectedIndex > -1) {
      this.selected.splice(selectedIndex, 1);
      if (this.useDeselected) {
        this.deselected.push(changedItemId);
      }
      this.count--;
    } else {
      if (deselectedIndex > -1) {
        this.deselected.splice(deselectedIndex, 1);
      }
      this.selected.push(changedItemId);
      this.count++;
    }
  }

  private updateSelectedCount() {
    // need endpoint to accept application filter strings and return correct count
    if (this.countManually) {
      this.count = this.maxCount - this.deselected.length;
    } else {
      const body = {
        filters: this.filter ? [this.filter] : [],
        ids_to_ignore: this.deselected
      };
      this.api.post(`/stakeholder/bulk-update/count`, body)
        .map((response) => response.json())
        .subscribe(
          (data) => this.count = data.count,
          err => console.error(err)
        );
    }
  }
}
