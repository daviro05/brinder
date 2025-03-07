import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewlineToBrPipe } from './pipes/newline-to-br.pipe';

@NgModule({
  declarations: [NewlineToBrPipe],
  imports: [CommonModule],
  exports: [NewlineToBrPipe],
})
export class SharedModule {}
