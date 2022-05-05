import { Poseidon, Field } from "snarkyjs";

import Item from "./item";
import Permissions from "./permissions";


class Todolist {
  nextItemId = 1;
  items: Record<number, Item> = {}

  appendNewItem(item: Item): void {
    this.items[this.nextItemId] = item;
    this.nextItemId++;
  }

  updateItemDetails(itemId: number, newItem: Item): void {
    this.items[itemId] = newItem;
  }

  hash(): Field {
    let finalHash = Field(0);
    Object.values(this.items).forEach((item) => {
      finalHash = Poseidon.hash([finalHash, item.hash()]);
    });
    return finalHash;
  }

}

export default Todolist;
