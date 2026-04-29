module agri_me::events {
    use std::signer;
    use std::string::String;
    use aptos_framework::event;

    #[event]
    struct OracleEvent has drop, store {
        event_type: String,
        livestock_id: String,
        event_hash: vector<u8>,
        status: u8,
        severity: u8,
    }

    struct EventStore has key {
        oracle_events: event::EventHandle<OracleEvent>,
    }

    public entry fun initialize(account: &signer) {
        move_to(account, EventStore {
            oracle_events: event::new_event_handle<OracleEvent>(account),
        });
    }

    public entry fun emit_oracle_event(
        account: &signer,
        event_type: String,
        livestock_id: String,
        event_hash: vector<u8>,
        status: u8,
        severity: u8,
    ) acquires EventStore {
        let store = borrow_global_mut<EventStore>(signer::address_of(account));
        event::emit_event(&mut store.oracle_events, OracleEvent {
            event_type,
            livestock_id,
            event_hash,
            status,
            severity,
        });
    }
}
