module agri_me::insurance {
    use std::signer;
    use std::string::String;
    use aptos_framework::event;

    const SAFE_STATUS: u8 = 0;
    const INTRUSION_STATUS: u8 = 1;
    const LOST_STATUS: u8 = 2;

    #[event]
    struct ClaimTriggered has drop, store {
        livestock_id: String,
        claim_type: String,
        proof_hash: vector<u8>,
        severity: u8,
        approved: bool,
    }

    struct ClaimStore has key {
        claims: event::EventHandle<ClaimTriggered>,
    }

    public entry fun initialize(account: &signer) {
        move_to(account, ClaimStore {
            claims: event::new_event_handle<ClaimTriggered>(account),
        });
    }

    public entry fun trigger_claim(
        account: &signer,
        livestock_id: String,
        claim_type: String,
        proof_hash: vector<u8>,
        severity: u8,
    ) acquires ClaimStore {
        let approved = severity >= 2;
        let store = borrow_global_mut<ClaimStore>(signer::address_of(account));
        event::emit_event(&mut store.claims, ClaimTriggered {
            livestock_id,
            claim_type,
            proof_hash,
            severity,
            approved,
        });
    }

    public fun should_payout(status: u8, severity: u8): bool {
        status == INTRUSION_STATUS && severity >= 2
    }
}
