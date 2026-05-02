import {
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL!;
const CONTRACT_ID = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID!;
const PASSPHRASE = Networks.TESTNET;

const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

type FreighterApi = {
  signTransaction: (xdr: string, opts: { networkPassphrase: string }) => Promise<string>;
};

function getFreighter(): FreighterApi {
  const freighter = (window as any).freighterApi;
  if (!freighter) throw new Error('Freighter not found');
  return freighter;
}

async function buildAndSend(publicKey: string, method: string, args: any[] = []) {
  const account = await server.getAccount(publicKey);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: PASSPHRASE })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const signedXdr = await getFreighter().signTransaction(tx.toXDR(), { networkPassphrase: PASSPHRASE });
  const signedTx = TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
  const submitted = await server.sendTransaction(signedTx);

  if (submitted.status !== 'PENDING') return submitted;

  while (true) {
    await new Promise((r) => setTimeout(r, 1200));
    const polled = await server.getTransaction(submitted.hash);
    if (polled.status !== 'NOT_FOUND') return polled;
  }
}

export const stellarService = {
  registerUser: (publicKey: string) =>
    buildAndSend(publicKey, 'register_user', [nativeToScVal(publicKey, { type: 'address' })]),

  addRecord: (publicKey: string, data: string) =>
    buildAndSend(publicKey, 'add_record', [
      nativeToScVal(publicKey, { type: 'address' }),
      nativeToScVal(data, { type: 'string' }),
    ]),

  updateRecord: (publicKey: string, id: number, data: string) =>
    buildAndSend(publicKey, 'update_record', [
      nativeToScVal(publicKey, { type: 'address' }),
      nativeToScVal(BigInt(id), { type: 'u64' }),
      nativeToScVal(data, { type: 'string' }),
    ]),

  async getRecords(publicKey: string) {
    const account = await server.getAccount(publicKey);
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: PASSPHRASE })
      .addOperation(contract.call('get_records', nativeToScVal(publicKey, { type: 'address' })))
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(tx);
    const retval = (simulated as any).result?.retval;
    return retval ? scValToNative(retval) : [];
  },
};
