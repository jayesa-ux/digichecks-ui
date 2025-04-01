import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './modules/layout/header/header.component';
import { FooterComponent } from './modules/layout/footer/footer.component';
import { ToasterComponent } from './modules/common/toaster/toaster.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent, ToasterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    title = 'digichecks-front';

    constructor(public translate: TranslateService) {
        translate.setDefaultLang('en');
        translate.addLangs(['en', 'es', 'de']);
        translate.use('en');
    }

    ngOnInit() {}
}
