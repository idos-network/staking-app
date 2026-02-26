export type VestingEntry = {
  contract: `0x${string}`;
  allocation: number;
};

// Owner address → list of vesting contracts with their allocations.
// Keys are case-sensitive — use checksummed addresses.
export const VESTING_BY_OWNER: Record<string, VestingEntry[]> = {
  "0x38F69935d956CfA59AEe22FF6450A6eBee85A4A4": [
    {
      contract: "0x2a7858931b509ac9107404f7EE018707326e8039",
      allocation: 50_000,
    },
  ],
  "0x0c1502ECE1F8823a16511a9580b0391E3B598f1f": [
    {
      contract: "0xe691c8dfE586193aCFD050D70C76531fd719a962",
      allocation: 20_000,
    },
  ],
  "0xB3323641c53aCFb6Df3291D6ee8369d6d1604B8E": [
    {
      contract: "0x3149dcFEcdE1eDC0474Eb09B673c94C7D58Ae4da",
      allocation: 50_000,
    },
  ],
  "0x5f0B8F97679f4F64ac4a8B679f6A77282a94DB06": [
    {
      contract: "0x6569b018fDd1D47764654A8231376f6185a85d6D",
      allocation: 283_879,
    },
    {
      contract: "0x76b272A6d3f500379DB63c14913fc92246c52d19",
      allocation: 1_892_523,
    },
    {
      contract: "0x0a327a697B801950C71278659F2d105C3E5B9885",
      allocation: 304_400,
    },
    {
      contract: "0x4c67A5A7fe00073F6F9f732F5b62aa00047C6380",
      allocation: 1_522_000,
    },
  ],
  "0x7530941E545C74085d462E684412F35593f749D6": [
    {
      contract: "0xE98aCFD7D9aF4d5dc3250c920d108Ca5A36a2646",
      allocation: 11_682_243,
    },
  ],
  "0x68E8F17117E0400bf907eD6213d418FE7D12db34": [
    {
      contract: "0x9A661572C7CFa780326E44621dCcC6bc298E4793",
      allocation: 500_000,
    },
  ],
  "0x883938C3D0178C21D6DC35C28Bb2F342e56bC180": [
    {
      contract: "0xfC0bEb2772369b834d2C764C0f08E2e99EE6b335",
      allocation: 254_700,
    },
  ],
  "0xa98DA5B36593A9A6E9667d162aF9d0ce70943b4A": [
    {
      contract: "0xe1eE8f731787ED8C837755EbD13eaFEd0C2AaA41",
      allocation: 175_000,
    },
  ],
  "0x7C0fef6c18e8494FFE2669eF691c4E5e8877717F": [
    {
      contract: "0x10A8d76Ce2224AE0b3E1fd85eFE9D6f9306391F1",
      allocation: 160_000,
    },
  ],
  "0x9D9167849Eb0946656FF85Ff9E40a7B0B7a30549": [
    {
      contract: "0xdf24F4Ca9984807577d13f5ef24eD26e5AFc7083",
      allocation: 50_000,
    },
  ],
  "0x70bdE14a67f6cCaCe6d27F07b58c96c6c6Bf9dC3": [
    {
      contract: "0x4e070B8c883954DBd36e86433989ABe1016398c5",
      allocation: 80_000,
    },
  ],
  "0x57143Bb2c201B43bD26B4Be705a4f09f295421e1": [
    {
      contract: "0xA33916c552e5C2c0c7eeC006541994F0c320b196",
      allocation: 40_000,
    },
  ],
  "0x9aE3739595D74f4a632F440872743FA15B27B3E8": [
    {
      contract: "0xBe750bB45088F9f784178014211D3843F5Df9579",
      allocation: 80_000,
    },
  ],
  "0xF44c1356407cc390350d60298eDa558E4B14a5ae": [
    {
      contract: "0x0E76638c60bC91aF9B345cb6aDeFce83b81d476E",
      allocation: 20_000,
    },
  ],
  "0x3A4eF55fc5A0333a216A4Cabf11C974DcdA9EAD7": [
    {
      contract: "0xaB8990e9B8a73599Cd50cA7786BC1854fe106484",
      allocation: 60_000,
    },
  ],
  "0xb05b1B3d3722B73Bb2E4DA8Ecb280Cd484B0469d": [
    {
      contract: "0xba2574ceD333788C901B799C84955d548E22ac8e",
      allocation: 120_000,
    },
  ],
  "0x333Fb10911383F0a2FeB08d937763e72aA6a3191": [
    {
      contract: "0x329F47e548C0cd687e014eE7A7Dcd5198E971705",
      allocation: 10_000,
    },
  ],
  "0x3879E5eD51507404990e808ec341194FA66d0467": [
    {
      contract: "0x97E27bA55e409D09d467C29953A16284C866304D",
      allocation: 80_000,
    },
  ],
  "0x749E7333FC2b1997E546835b6F8353c628121E5a": [
    {
      contract: "0x48Fb081aEeDB1a0a6143E716a839b94e927f82bE",
      allocation: 200_000,
    },
  ],
  "0x74De77Ba8Db05ED41fa4eDB40921F8377efEA12b": [
    {
      contract: "0x4D428CeCf85667E1Cb90D24D1130683C78Df48B5",
      allocation: 50_000,
    },
  ],
  "0x32AF8b3b7D529cd59887fA1ec743Eeb47D9F3F79": [
    {
      contract: "0x6066A66B6aA460990Fdd857D6F013d8940d7aBa9",
      allocation: 20_000,
    },
  ],
  "0xdF17c6402312Dfae82bCAFbaE0F3b1A14905202f": [
    {
      contract: "0x75Eff561053047E06406a4a822260E2cEB605Cce",
      allocation: 50_000,
    },
  ],
  "0xaf351823bdAFbE142546CF89D8BAD5A9c3b85Ee3": [
    {
      contract: "0xBd9aeE42865F5B1f0a1bb69902F0d7fb7a27524b",
      allocation: 100_000,
    },
  ],
  "0x0d72A7AD2bA11ac7A950A276B4D6cD30DF56FEEe": [
    {
      contract: "0x448491096f935d05F8eC9C21efbbcDb0DE12d83C",
      allocation: 150_000,
    },
  ],
  "0x3019974a172EA000Cb37584D03dC42c65064F007": [
    {
      contract: "0x43c26DFa982E77445325f81D4F1b57a0599fd9F5",
      allocation: 160_000,
    },
  ],
  "0xBa6f281D5AdE38d1A9a7F9Ca7172B9A1c1828cD9": [
    {
      contract: "0xd6f620608146faD03d2e4a20436d6AF4a6742484",
      allocation: 70_000,
    },
  ],
  "0xC2A92Bd1acB8d68007Badf9fa76fAf5742Dde397": [
    {
      contract: "0xfF6562209E23F730a6A067642DD8aB67610EF281",
      allocation: 150_000,
    },
  ],
  "0xB9c68c78e9b19700afEdD27a648F96323F63Bff3": [
    {
      contract: "0x28037144F1c545F05FdA267931e8343a807D596D",
      allocation: 60_000,
    },
  ],
  "0xA7AC9E3920EB64400Bc7Dd562F540f4927546638": [
    {
      contract: "0x665d94996973Bae324302aE3A314403Fb0cc7f45",
      allocation: 70_000,
    },
  ],
  "0x50C64c9417EcBB92eb8E4f8658a94E483b73dB3A": [
    {
      contract: "0xf37A9e6Db21FF47201FA93E370B1e58ba66b39a9",
      allocation: 30_000,
    },
  ],
  "0x948adedEBCeCE002172b96746286765AD17279f8": [
    {
      contract: "0x3d8CD50b54a6F6bC66bdc5c74A3BFC848E7762D9",
      allocation: 12_000,
    },
  ],
  "0x85B2b25BCb79A4945c1d7ad5e773f4af5b7167c3": [
    {
      contract: "0x6711b8CD3e8b4cA1346f362674f8CFeeE777E891",
      allocation: 30_000,
    },
  ],
  "0x84De018aF0542eCD05de395dFB8AF3c8aF5E121B": [
    {
      contract: "0x4394F73143ede4e3A9626137455cd460f7c132D4",
      allocation: 400_000,
    },
  ],
  "0x8cCab3539E198A38a7e5468C7dC0e5193d25F38B": [
    {
      contract: "0xf482d682F85f65F39AF3da83bCE0eFD3Db16c5D7",
      allocation: 120_000,
    },
  ],
  "0x85Be497639bB93485a65b9E2a786E8adA2156AC6": [
    {
      contract: "0x79c164b9b05595e900b295bD80031B62ca1c8851",
      allocation: 120_000,
    },
  ],
  "0x7fE6Ad9ffe5a479eBd9eDe726207FdEc9cF3d61F": [
    {
      contract: "0x4A9D51380B88FCd3807A349EdfC5078687D073e5",
      allocation: 120_000,
    },
  ],
};
