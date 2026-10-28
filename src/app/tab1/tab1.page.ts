import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, 'products');

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  newProduct = {
    productName: '',
    price: 0,
    quantity: 0,
    category: 'Bags',
    description: ''
  };

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async addProduct() {

    if (
      !this.newProduct.productName ||
      !this.newProduct.price ||
      !this.newProduct.quantity ||
      !this.newProduct.description
    ) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill in all fields.',
        duration: 2000,
        position: 'bottom'
      });

      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Adding product...'
    });

    await loading.present();

    try {

      await addDoc(productsCol, {
        productName: this.newProduct.productName,
        price: Number(this.newProduct.price),
        quantity: Number(this.newProduct.quantity),
        category: this.newProduct.category,
        description: this.newProduct.description
      });

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: 'Product added successfully!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });

      await toast.present();

      this.newProduct = {
        productName: '',
        price: 0,
        quantity: 0,
        category: 'Bags',
        description: ''
      };

    } catch (error) {

      await loading.dismiss();

      console.error('Error adding product:', error);

      const toast = await this.toastCtrl.create({
        message: 'Failed to add product.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });

      await toast.present();
    }
  }
}