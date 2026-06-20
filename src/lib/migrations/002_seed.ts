import db, { close } from "../db";

export async function up() {
  // ── Categories ──────────────────────────────────────────────────────────────
  await db`INSERT OR IGNORE INTO categories (name, description) VALUES
    ('Electronics',  'Phones, laptops, cameras and other gadgets'),
    ('Clothing',     'Apparel, shoes and accessories'),
    ('Books',        'Fiction, non-fiction, textbooks and more'),
    ('Furniture',    'Home and office furniture'),
    ('Sports',       'Sports equipment and outdoor gear'),
    ('Other',        'Everything else')`;

  // ── Users (passwords are bcrypt of "password123") ───────────────────────────
  const hash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

  await db`INSERT OR IGNORE INTO users (username, email, password_hash, is_admin) VALUES
    ('admin',  'admin@example.com',  ${hash}, 1),
    ('marius', 'marius@example.com', ${hash}, 0),
    ('egle',   'egle@example.com',   ${hash}, 0),
    ('tomas',  'tomas@example.com',  ${hash}, 0),
    ('laura',  'laura@example.com',  ${hash}, 0),
    ('rokas',  'rokas@example.com',  ${hash}, 0)`;

  // ── Posts ───────────────────────────────────────────────────────────────────
  // category ids: Electronics=1, Clothing=2, Books=3, Furniture=4, Sports=5, Other=6
  // user ids:     admin=1, marius=2, egle=3, tomas=4, laura=5, rokas=6
  await db`INSERT OR IGNORE INTO posts
    (user_id, category_id, title, description, price, image_url, is_active) VALUES
    (2, 2, 'Vintage Leather Jacket',
      'Genuine leather, barely worn. Size M. No visible scratches or tears.',
      65,   NULL, 1),
    (3, 4, 'Standing Desk 140 cm',
      'IKEA Bekant, good condition. Pick up only — located in Kaunas centre.',
      120,  NULL, 1),
    (4, 1, 'Canon EOS 90D Body',
      'Low shutter count (~8 k), sensor in perfect condition. Comes with original box, strap and battery charger. No lens included. Selling because I switched to mirrorless.',
      850,  NULL, 1),
    (5, 4, 'Free sofa — pickup only',
      'Grey 3-seater, minor wear on the armrests. You haul.',
      NULL, NULL, 1),
    (6, 3, 'JavaScript: The Good Parts',
      'Douglas Crockford, paperback. Some highlights inside, otherwise good shape.',
      8,    NULL, 0),
    (2, 5, 'Road Bike Trek FX3',
      '2022 model, 54 cm frame, disc brakes. Serviced last month.',
      490,  NULL, 1),
    (3, 1, 'Sony WH-1000XM5 Headphones',
      'Noise-cancelling, barely used. Comes with original case and cables.',
      210,  NULL, 1),
    (4, 2, 'Winter Boots Ecco Size 43',
      'Worn one season, excellent grip. Waterproof.',
      55,   NULL, 1),
    (5, 3, 'Clean Code — Robert C. Martin',
      'Hardcover, mint condition. No marks inside.',
      12,   NULL, 1),
    (6, 5, 'Yoga Mat + Blocks Set',
      'Non-slip mat (6 mm) plus two foam blocks. Used maybe five times.',
      18,   NULL, 1),
    (2, 1, 'Raspberry Pi 4 Model B 8 GB',
      'With official case, power supply and a 32 GB micro SD preloaded with Raspberry Pi OS.',
      95,   NULL, 1),
    (1, 6, 'Moving boxes — free',
      'About 20 sturdy cardboard boxes, various sizes. Come collect from Žaliakalnis.',
      NULL, NULL, 1)`;

  // ── Favorites ───────────────────────────────────────────────────────────────
  await db`INSERT OR IGNORE INTO favorites (user_id, post_id) VALUES
    (2, 3),
    (2, 7),
    (3, 6),
    (3, 11),
    (4, 1),
    (5, 6),
    (5, 11),
    (6, 3),
    (6, 4),
    (1, 12)`;

  // ── Comments ─────────────────────────────────────────────────────────────────
  await db`INSERT OR IGNORE INTO comments (post_id, user_id, content, is_removed) VALUES
    -- Canon EOS 90D (post 3)
    (3, 3, 'Is this still available? Can I pick it up in Kaunas?',           0),
    (3, 6, 'What''s the lowest you''d go?',                                  0),
    (3, 1, 'Spam link removed.',                                              1),
    (3, 4, 'Price is firm — it''s already well below market.',               0),

    -- Standing Desk (post 2)
    (2, 2, 'Does it come with the monitor arm attachment?',                   0),
    (2, 3, 'Happy to take it this weekend if still available.',               0),

    -- Vintage Leather Jacket (post 1)
    (1, 4, 'Any chance of shipping?',                                         0),
    (1, 2, 'Sorry, pickup only.',                                             0),

    -- Road Bike (post 6)
    (6, 5, 'Is the frame aluminium or carbon?',                               0),
    (6, 2, 'Aluminium. Very stiff and responsive.',                           0),
    (6, 6, 'Would you take 450?',                                             0),

    -- Sony Headphones (post 7)
    (7, 6, 'Do you still have the receipt?',                                  0),
    (7, 3, 'No receipt, but I can show the original Amazon order.',           0),

    -- Free sofa (post 4)
    (4, 2, 'Still available? I have a van.',                                  0),
    (4, 6, 'What area are you in?',                                           0),
    (4, 5, 'Žaliakalnis. Let me know a day and we can sort it.',              0),

    -- Moving boxes (post 12)
    (12, 4, 'I''ll take them all — can come Saturday morning.',               0),
    (12, 1, 'Great, message me to confirm.',                                  0)`;
}

if (import.meta.main) {
  (async () => {
    try {
      await up();
      console.log("Migration 002 (seed) completed");
    } catch (err) {
      console.error("Seed migration failed", err);
      throw err;
    } finally {
      try {
        close();
      } catch (e) {
        // ignore
      }
    }
  })();
}

export default up;
