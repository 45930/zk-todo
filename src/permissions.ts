import { CircuitValue, arrayProp, PublicKey } from "snarkyjs";


class Permissions extends CircuitValue {
  @arrayProp(PublicKey, 100) read: PublicKey[];
  @arrayProp(PublicKey, 100) update: PublicKey[];
  @arrayProp(PublicKey, 100) del: PublicKey[];

  constructor(read: PublicKey[], update: PublicKey[], del: PublicKey[]) {
    super();

    this.read = read;
    this.update = update;
    this.del = del;
  }
}

export default Permissions
