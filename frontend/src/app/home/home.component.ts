import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import * as shortid from 'shortid'; // Importowanie biblioteki shortid

interface Message {
  id: string; // Dodanie pola id do interfejsu Message
  username: string;
  content: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string;
  messageForm: FormGroup;
  messages: Message[] = [];
  isAuthenticated: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.username = ''; // Nazwa zalogowanego użytkownika
    this.messageForm = this.formBuilder.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isAuthenticated = this.checkAuthentication();
    if (this.isAuthenticated) {
      this.fetchMessages();
    } else {
      this.router.navigate(['/login']); // Przekierowanie do komponentu logowania
    }
  }

  checkAuthentication(): boolean {
    const token = localStorage.getItem('token'); // Pobierz token z localStorage
    this.username = localStorage.getItem('login') ?? ''; // Pobierz login z localStorage i przypisz do username

    if (token) {
      // Sprawdź, czy token jest ważny (możesz wykonać dodatkowe sprawdzenia, np. sprawdzić jego ważność lub poprawność)

      return true; // Użytkownik jest zalogowany
    }

    return false; // Użytkownik nie jest zalogowany
  }

  fetchMessages() {
    // Pobierz wiadomości z serwera i przypisz do tablicy messages
    this.http.get<Message[]>('http://localhost:3000/api/messages')
      .subscribe(
        response => {
          this.messages = response;
        },
        error => {
          console.log('Błąd podczas pobierania wiadomości:', error);
        }
      );
  }

  submitMessage() {
    if (this.messageForm.invalid) {
      return;
    }

    if (!this.isAuthenticated) {
      this.router.navigate(['/login']); // Przekierowanie do komponentu logowania
      return;
    }

    const content = this.messageForm.controls['content'].value;

    const token = localStorage.getItem('token'); // Pobierz token z localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const messageId = shortid.generate(); // Wygenerowanie unikalnego identyfikatora

    // Wysłanie wiadomości do serwera
    this.http.post('http://localhost:3000/api/messages', { id: messageId, username: this.username, content }, { headers, responseType: 'text' })
      .subscribe(
        response => {
          console.log('Wiadomość wysłana');
          this.messageForm.reset();
          this.fetchMessages(); // Odświeżenie wiadomości po wysłaniu
        },
        error => {
          console.log('Błąd podczas wysyłania wiadomości:', error);
        }
      );
  }

  deleteMessage(message: Message) {
    if (!message.id) {
      console.log('Nie można usunąć wiadomości - brak identyfikatora');
      return;
    }

    const token = localStorage.getItem('token'); // Pobierz token z localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Usunięcie wiadomości z serwera
    this.http.delete(`http://localhost:3000/api/messages/${message.id}`, { headers, responseType: 'text' })
      .subscribe(
        response => {
          console.log('Wiadomość usunięta');
          this.fetchMessages(); // Odświeżenie wiadomości po usunięciu
        },
        error => {
          console.log('Błąd podczas usuwania wiadomości:', error);
        }
      );
  }


  logout() {
    localStorage.removeItem('token'); // Usunięcie tokenu z localStorage
    this.isAuthenticated = false;
    this.router.navigate(['/login']); // Przekierowanie do komponentu logowania
  }
}
