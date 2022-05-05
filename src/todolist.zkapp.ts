import { Field, SmartContract, state, State, method } from 'snarkyjs';
import Todolist from './todolist';

const todolist = new Todolist();

export default class TodolistZKapp extends SmartContract {
  @state(Field) listHash = State<Field>();

  deploy(args: unknown) {
    super.deploy(args);
    this.listHash.set(Field(0));
  }

  @method update(oldList: Todolist, newList: Todolist) {
    const currentState = this.listHash.get();
    console.assert(oldList.hash().equals(currentState))

    this.listHash.set(newList.hash());
  }
}
