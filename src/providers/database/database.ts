import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/Rx';

import { Program } from '../../interfaces/models/program';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { DatabaseActionResponse } from '../../interfaces/response-body/database-action-response';
import { Product } from '../../interfaces/models/product';

@Injectable()
export class DatabaseProvider {
  public database: SQLiteObject;
  private readonly databaseReady: BehaviorSubject<boolean>;
  private readonly queries: any;

  constructor(public SQLiteporter: SQLitePorter, private readonly storage: Storage, private readonly sqlite: SQLite, private readonly platform: Platform, private readonly http: HttpClient) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'orgill_market.db',
        location: 'default'
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

  public getDatabaseState(): Observable<boolean> {
    return this.databaseReady.asObservable();
  }

  public fillDatabase(): void {
    this.http.get('assets/db.sql', { responseType: 'text' })
      .subscribe(sql => {
          this.SQLiteporter.importSqlToDb(this.database, sql)
            .then(() => {
              this.databaseReady.next(true);
              this.storage.set('database_filled', true).catch(err => console.error(err));
            })
            .catch(e => console.error(e));
        }
      );
  }

  /* PRODUCTS  & SHOPPING LISTS */
  public addShoppingList(name: string, description: string, type: string): Promise<DatabaseActionResponse> {
    const data: string[] = [name, description, type];
    return this.database.executeSql(this.queries.addShoppingList, data);
  }

  public getNumOfListsWithName(name: string): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getNumOfListsWithName, [name]);
  }

  public addProductToShoppingList(shopping_list_id: number, shopping_list_item: ShoppingListItem): Promise<DatabaseActionResponse> {
    const product: Product = shopping_list_item.product;
    const productData: string[] = [
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
       // Added Product Data.
        return data;
      }, err => {
        console.error('Add Product Error: ', err);
        return err;
      });

    const item_data: string[] = [shopping_list_id.toString(), product.SKU, shopping_list_item.program_number, shopping_list_item.quantity.toString(), shopping_list_item.item_price.toString()];
    return this.database.executeSql(this.queries.insertShoppingListItem, item_data);
  }

  public getShoppingListsForProduct(product_sku: string): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getShoppingListsForProduct, [product_sku]);
  }

  public removeProductsFromShoppingList(shopping_list_id: number, shopping_item_ids: number[]): Promise<DatabaseActionResponse> {
    let placeholders: string = '';
    for (let i: number = 0; i < shopping_item_ids.length; i++) {
      placeholders += (i === shopping_item_ids.length - 1) ? '?' : '?,';
    }
    const deleteQuery: string = 'DELETE FROM shopping_list_item WHERE shopping_list_id = ' + shopping_list_id.toString() + ' AND id IN (' + placeholders + ')';
    return this.database.executeSql(deleteQuery, shopping_item_ids);
  }

  public async removeShoppingList(shopping_list_id: number): Promise<DatabaseActionResponse> {
    const [err] = await this.database.executeSql(this.queries.deleteAllFromShoppingListWithId, [shopping_list_id]);
    if (err) {
      return err;
    }
    return this.database.executeSql(this.queries.deleteShoppingList, [shopping_list_id]);
  }

  public getAllProductsFromShoppingList(id: number): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getAllProductsFromShoppingList, [id]);
  }

  public getAllShoppingLists(): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getAllShoppingLists, []);
  }

  public updateShoppingListItem(id: number, shopping_list_id: number, programNumber: string, price: number, quantity: number): Promise<DatabaseActionResponse> {
    const params: string[] = [programNumber, price.toString(), quantity.toString(), shopping_list_id.toString(), id.toString()];
    return this.database.executeSql(this.queries.updateShoppingListItem, params);
  }

  public clearStorageData(): Promise<DatabaseActionResponse> {
    this.database.executeSql(this.queries.deleteAllFromProduct, [])
      .then(data => {
         // console.log('dropped table product: ', data);
        },
        error => {
          console.error('drop table product error; ', error);
        });
    this.database.executeSql(this.queries.deleteAllFromShoppingListItem, [])
      .then(data => {
         // console.log('dropped table shopping_list_item: ', data);
        },
        error => {
          console.error('drop table shopping_list_item error; ', error);
        });

    this.database.executeSql(this.queries.deleteAllFromShoppingLists, [1, 2])
      .then(data => {
       // console.log('dropped table shopping_list: ', data);
      }, error => {
        console.error('drop table shopping_list error; ', error);
      });

    return this.database.executeSql(this.queries.deleteAllFromPurchase, []);
  }

  public addPrograms(programs: Program[]): void {
    let programData: string[];

    // programs.forEach(program => {
    //   programData = [program.PROGRAMNO, program.NAME, program.STARTDATE, program.ENDDATE, program.SHIPDATE, program.MARKETONLY];
    //   this.database.executeSql(this.queries.addOrReplacePrograms, programData)
    //     .then(data => {
    //         Added one program to database.
    //       },
    //       error => {
    //         console.error('add program to database error: ', error);
    //       });
    // });

    this.asyncForEach(programs, async program => {
      programData = [program.PROGRAMNO, program.NAME, program.STARTDATE, program.ENDDATE, program.SHIPDATE, program.MARKETONLY];
      await this.database.executeSql(this.queries.addOrReplacePrograms, programData)
          .then(data => {
              // Added one program to database.
            },
            error => {
              console.error('add program to database error: ', error);
            });
    });

  }


  public getMarketTypeForProgram(programNo: string): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getMarketTypeForProgram, [programNo]);
  }


  public finalizePurchase(purchase_order_id: number, shopping_list_item_ids: number[], shopping_list_id: number): Promise<DatabaseActionResponse> {

    let placeholders: string = '';
    for (let i: number = 0; i < shopping_list_item_ids.length; i++) {
      placeholders += (i === shopping_list_item_ids.length - 1) ? '?' : '?,';
    }
    const finalizePurchaseQuery: string = 'UPDATE shopping_list_item SET purchase_order_id = ' + purchase_order_id.toString() + ', shopping_list_id = NULL WHERE shopping_list_id = ' + shopping_list_id.toString() + ' AND id IN (' + placeholders + ')';
    return this.database.executeSql(finalizePurchaseQuery, shopping_list_item_ids);
  }

  public getAllPurchases(): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getAllPurchases, []);
  }

  public getAllProductsFromPurchase(purchase_order_id: number): Promise<DatabaseActionResponse> {
    return this.database.executeSql(this.queries.getAllProductsFromPurchase, [purchase_order_id]);
  }

  public insertPurchase(purchase: any): Promise<DatabaseActionResponse> {
    const purchaseData: string[] = [
      purchase.PO,
      purchase.date,
      purchase.location,
      purchase.type,
      purchase.total,
      purchase.confirmation_number,
      purchase.program_number
    ];

    return this.database.executeSql(this.queries.insertPurchase, purchaseData);
  }

  public checkProductInList(productSKU: string, listId: number): Promise<DatabaseActionResponse> {
    const checkData: string[] = [
      productSKU,
      listId.toString()
    ];
    return this.database.executeSql(this.queries.checkProductInList, checkData);
  }


  public async asyncForEach<T>(targetArray: T[], callback: (item: T, index: number, arr: T[]) => any): Promise<void> {
    for (let index: number = 0; index < targetArray.length; index++) {
      await callback(targetArray[index], index, targetArray);
    }
  }

}
