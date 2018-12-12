CREATE TABLE IF NOT EXISTS shopping_list(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, type TEXT);
CREATE TABLE IF NOT EXISTS product(cat_id TEXT, sku TEXT PRIMARY KEY,
qty_round_option TEXT, model TEXT, name TEXT, vendor_name TEXT, selling_unit TEXT, upc_code TEXT, suggested_retail TEXT, yourcost TEXT, image TEXT, shelf_pack TEXT, velocity_code TEXT, total_rec_count TEXT);

CREATE TABLE IF NOT EXISTS shopping_list_item(id INTEGER PRIMARY KEY AUTOINCREMENT, program_number TEXT,
quantity INTEGER, item_price REAL, shopping_list_id INTEGER, purchase_order_id INTEGER, product_sku TEXT,
FOREIGN KEY (product_sku) REFERENCES product(sku),
FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(id), FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id),
FOREIGN KEY (program_number) REFERENCES program(program_no));

CREATE TABLE IF NOT EXISTS purchase_order(id INTEGER PRIMARY KEY, date TEXT, type INTEGER, po TEXT, location INTEGER, total INTEGER, confirmation_number TEXT, program_number TEXT, FOREIGN KEY(program_number) REFERENCES program(program_no));

CREATE TABLE IF NOT EXISTS program(program_no TEXT PRIMARY KEY, name TEXT, start_date TEXT, end_date TEXT, ship_date TEXT, market_only TEXT);

INSERT INTO shopping_list(name, description, type) VALUES ('Default Shopping Cart', 'Shopping Cart designed for purchasing items outside of the Orgill Markets.','default');
INSERT INTO shopping_list(name, description, type) VALUES ('Market Only Cart', 'Shopping Cart used exclusively for purchasing items from the programs available at the Orgill Market.','market_only');
