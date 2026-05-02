# agri_me (Stellar Soroban Rewrite)

This repository contains a minimal Soroban + Next.js implementation for agricultural records.

## Smart Contract (Rust + Soroban)
- `register_user(user)`
- `add_record(user, data)`
- `update_record(user, id, data)`
- `get_records(user)`

Files:
- `Cargo.toml`
- `lib.rs`
- `contract.rs`

## Frontend (Next.js App Router)
Files:
- `app/page.tsx`
- `hooks/useWallet.ts`
- `services/stellar.ts`

Environment variables:
- `NEXT_PUBLIC_STELLAR_RPC_URL`
- `NEXT_PUBLIC_STELLAR_CONTRACT_ID`

## Notes

