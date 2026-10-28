import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, 'products');

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  products: any[] = [];

  searchText = '';

  selectedCategory = 'All';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.subscribeToProducts();
  }

  subscribeToProducts() {

    onSnapshot(productsCol, snapshot => {

      this.products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    });

  }

  get filteredProducts() {

    return this.products.filter(product => {

      const matchesSearch =
        product.productName
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());

      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.category === this.selectedCategory;

      return matchesSearch && matchesCategory;

    });

  }

  async deleteProduct(productId: string) {

    const loading = await this.loadingCtrl.create({
      message: 'Deleting product...'
    });

    await loading.present();

    try {

      await deleteDoc(
        doc(db, 'products', productId)
      );

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: 'Product deleted successfully!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });

      await toast.present();

    } catch (error) {

      await loading.dismiss();

      console.error('Delete error:', error);

    }

  }

  async updateProduct(product: any) {

    const alert = await this.alertCtrl.create({

      header: 'Update Product',

      inputs: [

        {
          name: 'productName',
          type: 'text',
          value: product.productName,
          placeholder: 'Product Name'
        },

        {
          name: 'price',
          type: 'number',
          value: product.price,
          placeholder: 'Price'
        },

        {
          name: 'quantity',
          type: 'number',
          value: product.quantity,
          placeholder: 'Quantity'
        },

        {
          name: 'description',
          type: 'text',
          value: product.description,
          placeholder: 'Description'
        }

      ],

      buttons: [

        {
          text: 'Cancel',
          role: 'cancel'
        },

        {
          text: 'Update',

          handler: async (data) => {

            try {

              const productRef = doc(
                db,
                'products',
                product.id
              );

              await updateDoc(productRef, {

                productName: data.productName,

                price: Number(data.price),

                quantity: Number(data.quantity),

                description: data.description

              });

              const toast = await this.toastCtrl.create({
                message: 'Product updated successfully!',
                duration: 2000,
                color: 'success',
                position: 'bottom'
              });

              await toast.present();

            } catch (error) {

              console.error(
                'Update error:',
                error
              );

            }

          }

        }

      ]

    });

    await alert.present();

  }

  async refreshProducts(event: any) {

    this.subscribeToProducts();

    setTimeout(() => {

      event.target.complete();

    }, 1000);

  }

}