import { Defense } from './Defense.svelte';

export class PhysicDefense extends Defense {}

Defense.registerDefenseClass(PhysicDefense);
