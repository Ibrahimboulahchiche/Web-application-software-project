import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicPageComponent } from '@app/pages/classic-page/classic-page.component';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ParameterPageComponent } from '@app/pages/parameter-page/parameter-page.component';
import { RegistrationPageComponent } from '@app/pages/registration-page/registration-page.component';
import { SelectionsPageComponent } from '@app/pages/selections-page/selections-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'selections', component: SelectionsPageComponent },
    { path: 'registration/:id', component: RegistrationPageComponent },
    { path: 'classic/:id', component: ClassicPageComponent },
    { path: 'config', component: ConfigurationPageComponent },
    { path: 'parameter', component: ParameterPageComponent },
    { path: 'creation', component: GameCreationPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
