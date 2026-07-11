import { test, expect } from "@playwright/test";

export class LoginPage{
    constructor(page){
        this.page = page;
        this.UserEmailInput = page.getByPlaceholder('Email');
        this.UserPasswordInput = page.getByPlaceholder('Password');
        this.SignInButton = page.getByRole('button', {name: 'Sign In', exact: true});
        this.ErrorMessage = page.getByText('Invalid email or password')

        
    }
    async goto(path=('/')){
            await this.page.goto(path);

        }

   

    async Login(email, password){
        await this.UserEmailInput.fill(email);
        await this.UserPasswordInput.fill(password);
        await this.SignInButton.click();
        this.page.on('dialog', async (dialog)=>{
            console.log(dialog.message());
            await dialog.accept(); 
        });
        
    }
}