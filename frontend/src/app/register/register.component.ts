import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  register() {
    if (!this.username || !this.password || !this.confirmPassword) {
      alert('Proszę wypełnić wszystkie pola formularza!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Hasła nie są identyczne!');
      return;
    }

    const userData = { username: this.username, password: this.password };

    this.http.post('http://localhost:3000/api/register', userData)
      .subscribe(
        () => {
          alert('Rejestracja zakończona sukcesem!');
          this.router.navigate(['/login']);
        },
        error => {
          if (error.status === 409) {
            alert('Użytkownik o podanej nazwie już istnieje!');
          } else if (error.status === 500) {
            alert('Wewnętrzny błąd serwera!');
          } else {
            alert('Rejestracja zakończona sukcesem!');
          }
        }
      );
  }
}
