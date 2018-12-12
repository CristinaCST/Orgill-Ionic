import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {Storage} from '@ionic/storage';
import {Platform} from 'ionic-angular';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';

import {Program} from '../../interfaces/models/program';
import {ShoppingListItem} from '../../interfaces/models/shopping-list-item';

@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;
  private queries;

  constructor(public sqlitePorter: SQLitePorter, private storage: Storage, private sqlite: SQLite, private platform: Platform, private http: HttpClient) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'orgill_market.db',
        location: 'default',
      })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.storage.get('database_filled').then(val => {
            if (val) {
              this.databaseReady.next(true);
            } else {
              this.fillDatabase();
            }
          });
        });
    });

    this.queries = {
      // insert
      addShoppingList: 'INSERT INTO shopping_list (name, description, type) VALUES (?, ?, ?)',
      insertShoppingListItem: 'INSERT INTO shopping_list_item (shopping_list_id, product_sku, program_number, quantity, item_price) VALUES (?, ?, ?, ?, ?)',

      // insert or replace
      insertOrReplaceProduct: 'INSERT OR REPLACE INTO product (sku, cat_id, image, model, name, qty_round_option, selling_unit, shelf_pack, suggested_retail, total_rec_count, velocity_code, vendor_name, upc_code, yourcost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)',
      addOrReplacePrograms: 'INSERT OR REPLACE INTO program (program_no, name, start_date, end_date, ship_date, market_only) VALUES (?, ?, ?, ?, ?, ?)',
      insertPurchase: 'INSERT INTO purchase_order (po, date, location, type, total, confirmation_number, program_number) VALUES (?, ?, ?, ?, ?, ?, ?)',

      // update
      updateShoppingList: 'UPDATE shopping_list_item SET quantity = ?, program_number = ?, item_price = ? WHERE shopping_list_id = ? ',
      updateShoppingListItem: 'UPDATE shopping_list_item SET program_number = ?, item_price = ?, quantity = ? WHERE shopping_list_id = ? AND id = ?',

      // delete
      deleteShoppingList: 'DELETE FROM shopping_list WHERE id = ?',
      deleteFromShoppingList: 'DELETE FROM shopping_list_item WHERE shopping_list_id = ? AND id IN (?)',
      deleteAllFromShoppingListWithId: 'DELETE FROM shopping_list_item WHERE shopping_list_id  = ?',
      deleteAllFromProduct: 'DELETE FROM product',
      deleteAllFromShoppingListItem: 'DELETE FROM shopping_list_item',
      deleteAllFromShoppingLists: 'DELETE FROM shopping_list WHERE id NOT IN (?,?)',
      deleteAllFromPurchase: 'DELETE FROM purchase_order',

      // select
      getAllShoppingLists: 'SELECT * FROM shopping_list',
      getNumOfListsWithName: 'SELECT count(1) AS list_num FROM shopping_list WHERE name = ?',
      getAllProductsFromShoppingList: 'SELECT * FROM shopping_list_item JOIN product ON (shopping_list_item.product_sku = product.sku) ' +
      'JOIN program ON (shopping_list_item.program_number = program.program_no)' +
      'WHERE shopping_list_item.shopping_list_id = ? ',
      getShoppingListsForProduct: 'SELECT DISTINCT shopping_list.id FROM shopping_list JOIN shopping_list_item ON (shopping_list.id = shopping_list_item.shopping_list_id) WHERE shopping_list_item.product_sku = ? ',
      getMarketTypeForProgram: 'SELECT market_only FROM program WHERE program_no = ?',
      getAllPurchases: 'SELECT * from purchase_order, program WHERE purchase_order.program_number = program.program_no ORDER by id DESC',
      getAllProductsFromPurchase: 'SELECT * FROM purchase_order ' +
      'JOIN shopping_list_item ON (purchase_order.id = shopping_list_item.purchase_order_id)' +
      'JOIN product ON (shopping_list_item.product_sku = product.sku) ' +
      'WHERE purchase_order_id = ?',
      getProgram: 'SELECT * FROM program WHERE program_no = ?',
      checkProductInList: 'Select count(*) as is_item_in_list from shopping_list_item  where product_sku =?' +
      'AND shopping_list_id=?'
    };
  }

  /* DATABASE */

  getDatabaseState(): Observable<any> {
    return this.databaseReady.asObservable();
  }

  fillDatabase() {
    this.http.get('assets/db.sql', {responseType: 'text'})
      .subscribe(sql => {
          this.sqlitePorter.importSqlToDb(this.database, sql)
            .then(() => {
              this.databaseReady.next(true);
              this.storage.set('database_filled', true).catch(err => console.error(err));
            })
            .catch(e => console.error(e));
        }
      );
  }

  /* PRODUCTS  & SHOPPING LISTS */
  addShoppingList(name, description, type): Promise<any> {
    const data = [name, description, type];
    return this.database.executeSql(this.queries.addShoppingList, data);
  }

  getNumOfListsWithName(name: string): Promise<any> {
    return this.database.executeSql(this.queries.getNumOfListsWithName, [name]);
  }

  addProductToShoppingList(shopping_list_id: Number, shopping_list_item: ShoppingListItem): Promise<any> {
    const product = shopping_list_item.product;
    const productData = [
      product.SKU,
      product.CatID,
      product.IMAGE,
      product.MODEL,
      product.NAME,
      product.QTY_ROUND_OPTION,
      product.SELLING_UNIT,
      product.SHELF_PACK,
      product.SUGGESTED_RETAIL,
      product.TOTAL_REC_COUNT,
      product.VELOCITY_CODE,
      product.VENDOR_NAME,
      product.UPC_CODE,
      product.YOURCOST];
    this.database.executeSql(this.queries.insertOrReplaceProduct, productData)
      .then(data => {
        console.log('Added Product Data: ', data);
        return data;
      }, err => {
        console.log('Add Product Error: ', err);
        return err;
      });

    const item_data = [shopping_list_id, product.SKU, shopping_list_item.program_number, shopping_list_item.quantity, shopping_list_item.item_price];
    return this.database.executeSql(this.queries.insertShoppingListItem, item_data);
  }

  getShoppingListsForProduct(product_sku: string) {
    return this.database.executeSql(this.queries.getShoppingListsForProduct, [product_sku]);
  }

  removeProductsFromShoppingList(shopping_list_id: number, shopping_item_ids: number[]): Promise<any> {
    let placeholders = '';
    for (let i = 0; i < shopping_item_ids.length; i++) {
      if (i === shopping_item_ids.length - 1) {
        placeholders += '?';
      } else {
        placeholders += '?,';
      }
    }
    const deleteQuery = 'DELETE FROM shopping_list_item WHERE shopping_list_id = ' + shopping_list_id + ' AND id IN (' + placeholders + ')';
    return this.database.executeSql(deleteQuery, shopping_item_ids);
  }

  removeShoppingList(shopping_list_id: number): Promise<any> {
    this.database.executeSql(this.queries.deleteAllFromShoppingListWithId, [shopping_list_id]).then(data => {
      return data;
    }, err => {
      console.error('Delete all items from shopping list Error: ', err);
      return err;
    });

    return this.database.executeSql(this.queries.deleteShoppingList, [shopping_list_id]);
  }

  getAllProductsFromShoppingList(id: number): Promise<any> {
    return this.database.executeSql(this.queries.getAllProductsFromShoppingList, [id]);
  }

  getAllShoppingLists(): Promise<any> {
    return this.database.executeSql(this.queries.getAllShoppingLists, []);
  }

  //TODO REMOVE UNUSED
  // updateShoppingList(shopping_list_id: Number, shopping_list_item: ShoppingListItem) {
  //   this.database.executeSql(this.queries.updateShoppingList, [shopping_list_item.quantity, shopping_list_item.program_number, shopping_list_item.item_price, shopping_list_id])
  //     .then(data => {
  //       return data;
  //     }, err => {
  //       console.log('Error: ', err);
  //       return err;
  //     });
  // }

  updateShoppingListItem(id: number, shopping_list_id: number, programNumber: string, price: number, quantity: number): Promise<any> {
    const params = [programNumber, price, quantity, shopping_list_id, id];
    return this.database.executeSql(this.queries.updateShoppingListItem, params);
  }

  clearStorageData(): Promise<any> {
    this.database.executeSql(this.queries.deleteAllFromProduct, [])
      .then(data => {
          console.log('dropped table product: ', data);
        },
        error => {
          console.error('drop table product error; ', error);
        });
    this.database.executeSql(this.queries.deleteAllFromShoppingListItem, [])
      .then(data => {
          console.log('dropped table shopping_list_item: ', data);
        },
        error => {
          console.error('drop table shopping_list_item error; ', error);
        });

    this.database.executeSql(this.queries.deleteAllFromShoppingLists, [1, 2])
      .then(data => {
        console.log('dropped table shopping_list: ', data);
      }, error => {
        console.error('drop table shopping_list error; ', error);
      });

    return this.database.executeSql(this.queries.deleteAllFromPurchase, []);
  }

  addPrograms(programs: Program[]) {
    let programData;

    programs.forEach(program => {
      programData = [program.PROGRAMNO, program.NAME, program.STARTDATE, program.ENDDATE, program.SHIPDATE, program.MARKETONLY];
      this.database.executeSql(this.queries.addOrReplacePrograms, programData)
        .then(data => {
            //console.log('added one program to database: ', data);
          },
          error => {
            console.error('add program to database error: ', error);
          });
    });

  }

  //TODO REMOVE UNUSED
  // getProgram(program_no: string): Promise<any> {
  //   return this.database.executeSql(this.queries.getProgram, [program_no]);
  // }

  getMarketTypeForProgram(programNo: string): Promise<any> {
    return this.database.executeSql(this.queries.getMarketTypeForProgram, [programNo]);
  }

  /* PURCHASES */

  finalizePurchase(purchase_order_id: number, shopping_list_item_ids: number[], shopping_list_id: number): Promise<any> {

    let placeholders = '';
    for (let i = 0; i < shopping_list_item_ids.length; i++) {
      if (i === shopping_list_item_ids.length - 1) {
        placeholders += '?';
      } else {
        placeholders += '?,';
      }
    }
    const finalizePurchaseQuery = 'UPDATE shopping_list_item SET purchase_order_id = ' + purchase_order_id + ', shopping_list_id = NULL WHERE shopping_list_id = ' + shopping_list_id + ' AND id IN (' + placeholders + ')';
    console.log('query: ', finalizePurchaseQuery);
    return this.database.executeSql(finalizePurchaseQuery, shopping_list_item_ids);
  }

  getAllPurchases(): Promise<any> {
    return this.database.executeSql(this.queries.getAllPurchases, []);
  }

  getAllProductsFromPurchase(purchase_order_id: number): Promise<any> {
    return this.database.executeSql(this.queries.getAllProductsFromPurchase, [purchase_order_id]);
  }

  insertPurchase(purchase: any): Promise<any> {
    const purchaseData = [
      purchase.PO,
      purchase.date,
      purchase.location,
      purchase.type,
      purchase.total,
      purchase.confirmation_number,
      purchase.program_number,
    ];

    console.log('in db: ', purchaseData);
    return this.database.executeSql(this.queries.insertPurchase, purchaseData);
  }

  checkProductInList(productSKU, listId) {
    const checkData = [
      productSKU,
      listId
    ];
    return this.database.executeSql(this.queries.checkProductInList, checkData);
  }
}
