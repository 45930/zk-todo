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
  deploy(args: any) {
    super.deploy(args);
  }

  @method createItem(item: Item, pw: string = '') {
    return Poseidon.hash([item.hash(), ...Encoding.Bijective.Fp.fromString(pw)]);
  }

  @method updateItem(oldItem: Item, oldItemHash: Field, pw: string = '', newItem: Item) {
    // Establish your right to update this item
    const expectedHash = Poseidon.hash([oldItem.hash(), ...Encoding.Bijective.Fp.fromString(pw)])
    expectedHash.assertEquals(oldItemHash);

    return Poseidon.hash([newItem.hash(), ...Encoding.Bijective.Fp.fromString(pw), oldItemHash]);
  }
}

export async function deploy() {
  zkappPrivateKey = PrivateKey.random();
  zkappAddress = zkappPrivateKey.toPublicKey();
  const zkapp = new TodolistZKapp(zkappAddress);

  const zkappInterface = {
    address: zkappAddress,
  };

  const tx = Mina.transaction(DEPLOYER_ACCOUNT, async () => {
    const p = await Party.createSigned(USER_ACCOUNT);

    p.balance.subInPlace(ONE_MINA);
    await zkapp.deploy({ zkappKey: zkappPrivateKey });
    zkapp.balance.addInPlace(ONE_MINA);
  });
  await tx.send().wait();
  await Mina.getAccount(zkappAddress);

  return zkappInterface;
}

export async function createItem(item: Item, pw: string = ''): Promise<Field> {
  let resp = Field(0);
  let tx = Mina.transaction(DEPLOYER_ACCOUNT, () => {
    const zkapp = new TodolistZKapp(zkappAddress);
    resp = zkapp.createItem(item, pw);
  });
  try {
    await tx.send().wait();
    return resp;
  } catch (err) {
    return Field(0);
  }
}

export async function updateItem(oldItem: Item, oldItemHash: Field, pw: string = '', newItem: Item) {
  let resp = Field(0);
  let tx = Mina.transaction(DEPLOYER_ACCOUNT, () => {
    const zkapp = new TodolistZKapp(zkappAddress);
    resp = zkapp.updateItem(oldItem, oldItemHash, pw, newItem);
  });
  try {
    await tx.send().wait();
    return resp;
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

isReady.then(() => {
  Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  accounts = Local.testAccounts.map(account => account.privateKey);
  DEPLOYER_ACCOUNT = accounts[0];
  USER_ACCOUNT = accounts[1];
  ONE_MINA = UInt64.fromNumber(1000000);
})
