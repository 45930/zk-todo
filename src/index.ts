import { Mina, shutdown, Field, isReady } from 'snarkyjs';
await isReady;

import { deploy, createItem, updateItem } from './todolist.zkapp.js'

import Item from './item.js';


let i = 0;
const todolist: Record<number, Record<string, string | Field | Item>> = {};

console.log('Deploying Todolist...');
const zkapp = await deploy();
console.log('Deployed...');

const Local = Mina.LocalBlockchain();
const accounts = Local.testAccounts;
console.log('EX1: User may create some tasks')
let tasks: Item[] = [
  new Item(
    accounts[0].publicKey,
    accounts[0].publicKey,
    'First Task',
    'TODO: Add Description'
  ),
  new Item(
    accounts[0].publicKey,
    accounts[0].publicKey,
    'Second Task',
    'TODO: Add Description'
  ),
  new Item(
    accounts[0].publicKey,
    accounts[1].publicKey,
    'Delegated Task',
    'I need you to do this task for me'
  ),
]

tasks.forEach(async (task) => {
  const itemHash = await createItem(task, 'M!na2022');
  todolist[i] = {
    status: 'CREATED',
    item: task,
    hash: itemHash
  }
})

console.log(`Current todolist: ${todolist}`);
shutdown();