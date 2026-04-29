module agri_me::livestock {
    use std::error;
    use std::signer;
    use std::string::String;
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};

    const E_NOT_OWNER: u64 = 1;
    const E_ALREADY_EXISTS: u64 = 2;
    const E_NOT_FOUND: u64 = 3;

    #[event]
    struct LivestockRegistered has drop, store {
        livestock_id: String,
        owner: address,
        gps_reference_hash: vector<u8>,
        status: u8,
    }

    #[event]
    struct LivestockStatusUpdated has drop, store {
        livestock_id: String,
        owner: address,
        previous_status: u8,
        next_status: u8,
        event_hash: vector<u8>,
    }

    struct Livestock has key, store {
        id: String,
        owner: address,
        gps_reference_hash: vector<u8>,
        status: u8,
        last_event_hash: vector<u8>,
        verified: bool,
    }

    struct Registry has key {
        records: Table<String, Livestock>,
        registered_events: event::EventHandle<LivestockRegistered>,
        status_events: event::EventHandle<LivestockStatusUpdated>,
    }

    public entry fun initialize(admin: &signer) {
        assert!(!exists<Registry>(signer::address_of(admin)), E_ALREADY_EXISTS);
        move_to(admin, Registry {
            records: table::new<String, Livestock>(),
            registered_events: event::new_event_handle<LivestockRegistered>(admin),
            status_events: event::new_event_handle<LivestockStatusUpdated>(admin),
        });
    }

    public entry fun register_livestock(
        owner: &signer,
        livestock_id: String,
        gps_reference_hash: vector<u8>,
        status: u8,
        proof_hash: vector<u8>,
    ) acquires Registry {
        let owner_address = signer::address_of(owner);
        let registry = borrow_global_mut<Registry>(owner_address);
        assert!(!table::contains(&registry.records, livestock_id), E_ALREADY_EXISTS);

        let record = Livestock {
            id: copy livestock_id,
            owner: owner_address,
            gps_reference_hash,
            status,
            last_event_hash: proof_hash,
            verified: true,
        };

        table::add(&mut registry.records, copy livestock_id, record);
        event::emit_event(&mut registry.registered_events, LivestockRegistered {
            livestock_id,
            owner: owner_address,
            gps_reference_hash,
            status,
        });
    }

    public entry fun update_status(
        owner: &signer,
        livestock_id: String,
        next_status: u8,
        event_hash: vector<u8>,
    ) acquires Registry {
        let owner_address = signer::address_of(owner);
        let registry = borrow_global_mut<Registry>(owner_address);
        let record = table::borrow_mut(&mut registry.records, copy livestock_id);
        let previous_status = record.status;
        record.status = next_status;
        record.last_event_hash = copy event_hash;

        event::emit_event(&mut registry.status_events, LivestockStatusUpdated {
            livestock_id,
            owner: owner_address,
            previous_status,
            next_status,
            event_hash,
        });
    }

    public fun exists(owner_address: address, livestock_id: String): bool acquires Registry {
        if (!exists<Registry>(owner_address)) {
            return false;
        };

        let registry = borrow_global<Registry>(owner_address);
        table::contains(&registry.records, livestock_id)
    }

    public fun get_status(owner_address: address, livestock_id: String): u8 acquires Registry {
        let registry = borrow_global<Registry>(owner_address);
        let record = table::borrow(&registry.records, livestock_id);
        record.status
    }
}
