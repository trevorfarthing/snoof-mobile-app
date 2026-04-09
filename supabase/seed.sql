-- Test users
INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) (
        select
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4 (),
            'authenticated',
            'authenticated',
            'user' || (ROW_NUMBER() OVER ()) || '@example.com',
            crypt ('password123', gen_salt ('bf')),
            current_timestamp,
            current_timestamp,
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            '{}',
            current_timestamp,
            current_timestamp,
            '',
            '',
            '',
            ''
        FROM
            generate_series(1, 10)
    );

-- Test user email identities
INSERT INTO
    auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) (
        select
            uuid_generate_v4 (),
            id,
            format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
            'email',
            id,
            current_timestamp,
            current_timestamp,
            current_timestamp
        from
            auth.users
    );

-- Pets (one per household, auto-created by the handle_new_user trigger)
WITH ranked_households AS (
    SELECT
        household_id,
        ROW_NUMBER() OVER (ORDER BY joined_at) AS rn
    FROM household_members
),
pet_data (rn, name, breed, dob, sex, spay_neuter, color, weight_lbs) AS (
    VALUES
        (1,  'Poppy',   'Australian Cattle Dog',    '2024-01-15', 'female', 'spayed',   'blue merle',      37.0),
        (2,  'Ruby',    'English Springer Spaniel', '2019-03-22', 'female', 'spayed',   'liver and white', 40.0),
        (3,  'Milo',    'Golden Retriever',         '2022-06-10', 'male',   'neutered', 'golden',          68.5),
        (4,  'Bella',   'French Bulldog',           '2023-09-01', 'female', 'spayed',   'fawn brindle',    22.0),
        (5,  'Cooper',  'Border Collie',            '2021-11-30', 'male',   'neutered', 'black and white', 45.0),
        (6,  'Luna',    'Labrador Retriever',       '2020-05-14', 'female', 'spayed',   'chocolate',       58.0),
        (7,  'Charlie', 'Beagle',                   '2023-02-28', 'male',   'neutered', 'tricolor',        26.5),
        (8,  'Daisy',   'Bernese Mountain Dog',     '2022-08-19', 'female', 'spayed',   'tricolor',        82.0),
        (9,  'Max',     'German Shepherd',          '2021-04-03', 'male',   'neutered', 'black and tan',   75.0),
        (10, 'Zoe',     'Shih Tzu',                 '2020-12-25', 'female', 'spayed',   'white and gold',  12.5)
)
INSERT INTO pets (household_id, name, species, breed, date_of_birth, sex, spay_neuter, color, weight_lbs)
SELECT
    rh.household_id,
    pd.name,
    'dog'::pet_species,
    pd.breed,
    pd.dob::date,
    pd.sex::pet_sex,
    pd.spay_neuter::spay_neuter_status,
    pd.color,
    pd.weight_lbs::decimal(6,2)
FROM ranked_households rh
JOIN pet_data pd ON rh.rn = pd.rn::int;