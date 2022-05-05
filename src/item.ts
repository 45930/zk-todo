import { CircuitValue, Encoding, arrayProp, prop, PublicKey, Field, Poseidon } from "snarkyjs";

class Item extends CircuitValue {
  @prop owner: PublicKey;
  @prop assignee: PublicKey;
  @prop isDone: Boolean;
  @prop title: Field;
  @prop description: Field;

  constructor(
    owner: PublicKey,
    assignee: PublicKey,
    title: string,
    description: string
  ) {
    super();

    this.owner = owner;
    this.assignee = assignee;
    this.isDone = new Boolean(false);
    this.title = Encoding.Bijective.Fp.fromString(title)[0];
    this.description = Encoding.Bijective.Fp.fromString(description)[0];
  }

  serializeTitle(): string {
    return Encoding.Bijective.Fp.toString([this.title]);
  }

  serializeDescription(): string {
    return Encoding.Bijective.Fp.toString([this.description]);
  }

  update(updates: Record<string, string>) {
    // TODO: add the rest
    if (Object.hasOwn(updates, 'description')) {
      this.description = Encoding.Bijective.Fp.fromString(updates.description)[0];
    }
  }

  hash(): Field {
    // TODO: Something better than this
    return Poseidon.hash([this.title, this.description])
  }
}

export default Item;
