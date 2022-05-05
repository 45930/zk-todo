import { CircuitValue, Encoding, arrayProp, prop, PublicKey, Field, Poseidon } from "snarkyjs";

class Item extends CircuitValue {
  @prop owner: PublicKey;
  @prop assignee: PublicKey;
  @prop isDone: Boolean;
  @arrayProp(Field, 5) title: Field[];
  @arrayProp(Field, 100) description: Field[];

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
    this.title = Encoding.Bijective.Fp.fromString(title);
    this.description = Encoding.Bijective.Fp.fromString(description);
  }

  serializeTitle(): string {
    return Encoding.Bijective.Fp.toString(this.title);
  }

  serializeDescription(): string {
    return Encoding.Bijective.Fp.toString(this.description);
  }

  hash(): Field {
    // TODO: Something better than this
    return Poseidon.hash([...this.title, ...this.description])
  }
}

export default Item;
