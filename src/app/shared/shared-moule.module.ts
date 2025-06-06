import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
    exports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
})
export class SharedMouleModule {}
