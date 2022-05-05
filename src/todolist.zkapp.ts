import {
  Field,
  SmartContract,
  UInt64,
  isReady,
  PrivateKey,
  Mina,
  Party,
  method,
  Encoding,
  Poseidon,
  PublicKey
} from 'snarkyjs';

await isReady;

import Item from './item.js';



export default class TodolistZKapp extends SmartContract {
  deploy({
    zkappKey
  }: {
    zkappKey: PrivateKey;
  }) {
    super.deploy({ zkappKey });
  }

  @method createItem(item: Item, itemHash: Field) {
    const calculatedItemHash = item.hash();
    calculatedItemHash.assertEquals(itemHash);
  }

  @method updateItem(oldItem: Item, oldItemHash: Field, newItem: Item, newItemHash: Field) {
    const expectedOldHash = oldItem.hash();
    expectedOldHash.assertEquals(oldItemHash);

    const calculatedNewItemHash = newItem.hash();
    calculatedNewItemHash.assertEquals(newItemHash);
  }
}

export async function deploy() {
  await isReady;

  Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  accounts = Local.testAccounts.map(account => account.privateKey);
  DEPLOYER_ACCOUNT = accounts[0];
  USER_ACCOUNT = accounts[1];

  zkappPrivateKey = PrivateKey.random();
  zkappAddress = zkappPrivateKey.toPublicKey();
  const zkapp = new TodolistZKapp(zkappAddress);

  const zkappInterface = {
    address: zkappAddress,
  };

  const tx = Local.transaction(DEPLOYER_ACCOUNT, () => {
    const p = Party.createSigned(DEPLOYER_ACCOUNT, { isSameAsFeePayer: true });

    p.balance.subInPlace(Mina.accountCreationFee());
    zkapp.deploy({ zkappKey: zkappPrivateKey });
  });
  await tx.send().wait();
  await Mina.getAccount(zkappAddress);

  return zkappInterface;
}

export async function createItem(item: Item, pw: string = ''): Promise<Field> {
  let tx = Mina.transaction(DEPLOYER_ACCOUNT, () => {
    const zkapp = new TodolistZKapp(zkappAddress);
    zkapp.createItem(item, item.hash());
  });
  try {
    await tx.send().wait();
    const pwFields = Encoding.Bijective.Fp.fromString(pw)
    return Poseidon.hash([item.hash(), ...pwFields])
  } catch (err) {
    return Field(0);
  }
}

export async function updateItem(oldItem: Item, oldItemHash: Field, pw: string = '', newItem: Item) {
  let tx = Mina.transaction(DEPLOYER_ACCOUNT, () => {
    const zkapp = new TodolistZKapp(zkappAddress);
    zkapp.updateItem(oldItem, oldItemHash, newItem, newItem.hash());
  });
  try {
    await tx.send().wait();
    const pwFields = Encoding.Bijective.Fp.fromString(pw)
    return Poseidon.hash([newItem.hash(), ...pwFields])
  } catch (err) {
    return Field(0);
  }
}

let Local;
let accounts: PrivateKey[];
let DEPLOYER_ACCOUNT: PrivateKey;
let USER_ACCOUNT: PrivateKey;
let ONE_MINA: UInt64;
let zkappPrivateKey: PrivateKey;
let zkappAddress: PublicKey;
