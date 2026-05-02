#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub struct UserProfile {
    pub registered: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Record {
    pub id: u64,
    pub data: String,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    User(Address),
    Records(Address),
    NextId(Address),
}

#[contract]
pub struct AgriMeContract;

#[contractimpl]
impl AgriMeContract {
    pub fn register_user(env: Env, user: Address) {
        user.require_auth();
        let key = DataKey::User(user.clone());
        if env.storage().persistent().has(&key) {
            panic!("already_registered");
        }
        env.storage()
            .persistent()
            .set(&key, &UserProfile { registered: true });
        env.storage().persistent().set(&DataKey::NextId(user), &0u64);
    }

    pub fn add_record(env: Env, user: Address, data: String) {
        user.require_auth();
        Self::ensure_registered(&env, &user);
        if data.len() == 0 {
            panic!("empty_data");
        }

        let id_key = DataKey::NextId(user.clone());
        let mut next_id: u64 = env.storage().persistent().get(&id_key).unwrap_or(0);
        let mut records: Vec<Record> = env
            .storage()
            .persistent()
            .get(&DataKey::Records(user.clone()))
            .unwrap_or(Vec::new(&env));

        records.push_back(Record { id: next_id, data });
        next_id += 1;

        env.storage()
            .persistent()
            .set(&DataKey::Records(user.clone()), &records);
        env.storage().persistent().set(&id_key, &next_id);
    }

    pub fn update_record(env: Env, user: Address, id: u64, data: String) {
        user.require_auth();
        Self::ensure_registered(&env, &user);
        if data.len() == 0 {
            panic!("empty_data");
        }

        let key = DataKey::Records(user.clone());
        let mut records: Vec<Record> = env.storage().persistent().get(&key).unwrap_or(Vec::new(&env));

        let mut found = false;
        for i in 0..records.len() {
            let mut record = records.get_unchecked(i);
            if record.id == id {
                record.data = data.clone();
                records.set(i, record);
                found = true;
                break;
            }
        }

        if !found {
            panic!("record_not_found");
        }

        env.storage().persistent().set(&key, &records);
    }

    pub fn get_records(env: Env, user: Address) -> Vec<Record> {
        Self::ensure_registered(&env, &user);
        env.storage()
            .persistent()
            .get(&DataKey::Records(user))
            .unwrap_or(Vec::new(&env))
    }

    fn ensure_registered(env: &Env, user: &Address) {
        if !env.storage().persistent().has(&DataKey::User(user.clone())) {
            panic!("user_not_registered");
        }
    }
}
