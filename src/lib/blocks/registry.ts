import { AnyBlockDescriptor, BlockType } from "./types";

const registry = new Map<BlockType, AnyBlockDescriptor>();

export function registerBlock(descriptor: AnyBlockDescriptor): void {
  registry.set(descriptor.type, descriptor);
}

export function getBlock(type: BlockType): AnyBlockDescriptor | undefined {
  return registry.get(type);
}

export function listBlocks(opts?: { readyOnly?: boolean }): AnyBlockDescriptor[] {
  const all = Array.from(registry.values());
  if (opts?.readyOnly) {
    return all.filter((d) => d.ready !== false);
  }
  return all;
}

export function listBlocksByCategory(
  category: AnyBlockDescriptor["category"],
): AnyBlockDescriptor[] {
  return listBlocks().filter((d) => d.category === category);
}

export { registry };
