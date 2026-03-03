// TODO: re-add NodeProviderSelector UI component when ready
export type NodeProvider = {
  name: string;
  address: `0x${string}`;
};

// TODO: update default provider address
export const nodeProviders: NodeProvider[] = [
  {
    name: "idOS Node",
    address: "0x4Bfcc302AA00c8f9bD04eBfBbd8C28762285292a",
  },
  {
    name: "Near Node",
    address: "0x1dafeB42aD85ECc7EBF80410d3a3F5ADA06d153A",
  },
  {
    name: "Ripple Node",
    address: "0x8Da270863C2fD726c28eCeB4C2763d0746e63920",
  },
  {
    name: "Tezos Node",
    address: "0x4DE22ae3e2AD8CE21d878c104C2bc9bE4f8529BB",
  },
];
