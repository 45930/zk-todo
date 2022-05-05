import { Mina, shutdown, Field, isReady } from 'snarkyjs';
await isReady;

import { deploy, createItem, updateItem } from './todolist.zkapp.js'

import Item from './item.js';


let i = 1;
const todolist: Record<number, Record<string, string | Field | Item>> = {};

console.log('Deploying Todolist...');
await deploy();
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

await Promise.all(tasks.map(async (task) => {
  const itemHash = await createItem(task, 'M!na2022');
  todolist[i] = {
    status: 'CREATED',
    item: task,
    hash: itemHash
  }
  i++;
}));

console.log(`Current todolist: ${JSON.stringify(todolist)}`);

console.log('EX2: User may update a task');

let todo = todolist[1];
let task = todo.item as Item;
let oldTask = new Item(
  task.owner,
  task.assignee,
  task.serializeTitle(),
  task.serializeDescription()
);
let oldTaskHash = task.hash();
task.update({ description: 'Updated Description' });
const hash = await updateItem(oldTask, oldTaskHash, 'M!na2022', task)
todolist[1] = {
  status: 'UPDATED',
  item: task,
  hash: hash,
  oldHash: todo.hash as Field,
}

console.log(`Current todolist: ${JSON.stringify(todolist)}`);

shutdown();