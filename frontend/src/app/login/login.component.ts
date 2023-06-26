import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    if (!this.username || !this.password) {
      alert('Proszę wypełnić wszystkie pola formularza!');
      return;
    }

    this.username = this.username.trim();

    const userData = { username: this.username, password: this.password };

    this.http.post<{ token: string }>('http://localhost:3000/api/login', userData)
      .subscribe(
        response => {
          const token = response.token;
          localStorage.setItem('token', token); // Zapisz token JWT w pamięci lokalnej
          localStorage.setItem('login', this.username); // Zapisz nazwę użytkownika w pamięci lokalnej
          this.router.navigate(['/home']);
        },
        error => {
          alert('Nieprawidłowy login lub hasło!');
        }
      );
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
