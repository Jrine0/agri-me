module agri_me::agri_token {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin;

    const E_ALREADY_PUBLISHED: u64 = 1;

    struct AGRI has store, drop {}

    struct MintCap has key {
        cap: coin::MintCapability<AGRI>,
    }

    public entry fun initialize(admin: &signer) {
        assert!(!exists<MintCap>(signer::address_of(admin)), E_ALREADY_PUBLISHED);
        let (burn_cap, mint_cap, freeze_cap) = coin::initialize<AGRI>(
            admin,
            String::utf8(b"Agri Me Token"),
            String::utf8(b"AGRI"),
            8,
            true,
        );

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_freeze_cap(freeze_cap);
        move_to(admin, MintCap { cap: mint_cap });
    }

    public entry fun mint(admin: &signer, to: address, amount: u64) acquires MintCap {
        let mint_cap_ref = &borrow_global<MintCap>(signer::address_of(admin)).cap;
        coin::mint<AGRI>(amount, mint_cap_ref, to);
    }

    public entry fun transfer(sender: &signer, recipient: address, amount: u64) {
        coin::transfer<AGRI>(sender, recipient, amount);
    }
}
